'use server'

import { createHash, randomInt } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsApp } from '@/lib/whatsapp/twilio'
import { startOnboarding } from '@/lib/whatsapp/onboarding'
import type { ActionResult } from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateOtp(): string {
  return String(randomInt(100000, 999999))
}

function hashOtp(otp: string, phone: string): string {
  return createHash('sha256').update(otp + phone).digest('hex')
}

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return null
  return raw.startsWith('+') ? '+' + digits : '+' + digits
}

export interface WhatsAppStatus {
  number: string | null
  verified: boolean
  notificationsEnabled: boolean
}

// ── Get status ────────────────────────────────────────────────────────────────

export async function getWhatsAppStatus(): Promise<ActionResult<WhatsAppStatus>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const [profileRes, notifRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('whatsapp_number, whatsapp_verified')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('notification_preferences')
      .select('whatsapp_notifications_enabled')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  return {
    data: {
      number:               profileRes.data?.whatsapp_number ?? null,
      verified:             profileRes.data?.whatsapp_verified ?? false,
      notificationsEnabled: notifRes.data?.whatsapp_notifications_enabled ?? true,
    },
    error: null,
  }
}

// ── Send OTP ──────────────────────────────────────────────────────────────────

export async function sendWhatsAppOtp(rawPhone: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const phone = normalisePhone(rawPhone.trim())
  if (!phone) return { data: null, error: 'Enter a valid phone number including country code.' }

  const otp     = generateOtp()
  const hash    = hashOtp(otp, phone)
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const db = createAdminClient()

  // Invalidate any existing OTP for this user
  await db.from('whatsapp_otps').delete().eq('user_id', user.id)

  const { error: insertErr } = await db.from('whatsapp_otps').insert({
    user_id:    user.id,
    phone,
    otp_hash:   hash,
    expires_at: expires,
    used:       false,
  })

  if (insertErr) return { data: null, error: 'Failed to generate verification code.' }

  const result = await sendWhatsApp(
    phone,
    `Your SoloChief verification code is: ${otp}\n\nThis code expires in 15 minutes. Do not share it with anyone.`,
  )

  if (result.error && result.error !== 'not_configured') {
    return { data: null, error: 'Failed to send verification code. Check the number and try again.' }
  }

  return { data: undefined, error: null }
}

// ── Verify OTP ────────────────────────────────────────────────────────────────

export async function verifyWhatsAppOtp(rawPhone: string, otp: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const phone = normalisePhone(rawPhone.trim())
  if (!phone) return { data: null, error: 'Invalid phone number.' }

  if (!otp || !/^\d{6}$/.test(otp.trim())) {
    return { data: null, error: 'Enter the 6-digit code.' }
  }

  const db = createAdminClient()
  const hash = hashOtp(otp.trim(), phone)

  const { data: record } = await db
    .from('whatsapp_otps')
    .select('*')
    .eq('user_id', user.id)
    .eq('phone', phone)
    .eq('otp_hash', hash)
    .eq('used', false)
    .maybeSingle()

  if (!record) {
    return { data: null, error: 'Incorrect code. Check the code and try again.' }
  }

  if (new Date(record.expires_at) < new Date()) {
    return { data: null, error: 'This code has expired. Request a new one.' }
  }

  await db.from('whatsapp_otps').update({ used: true }).eq('id', record.id)

  await db
    .from('profiles')
    .update({ whatsapp_number: phone, whatsapp_verified: true })
    .eq('user_id', user.id)

  // Send activation message
  const activationMessage = `SOLOCHIEF CONNECTED

You're all set. Your daily brief will arrive each morning at your chosen time.

Try these now:
hi - Morning briefing
focus - Today's focus
help - All commands

Full app: solochief.app`

  const activationResult = await sendWhatsApp(phone, activationMessage)
  if (activationResult.error && activationResult.error !== 'not_configured') {
    console.warn('[whatsapp] Failed to send activation message:', activationResult.error)
    // Continue anyway — verification succeeded, just the message failed
  }

  // Start onboarding flow
  const consentMessage = await startOnboarding(user.id)
  await sendWhatsApp(phone, consentMessage)

  return { data: undefined, error: null }
}

// ── Unlink WhatsApp ───────────────────────────────────────────────────────────

export async function unlinkWhatsApp(): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ whatsapp_number: null, whatsapp_verified: false })
    .eq('user_id', user.id)

  if (error) return { data: null, error: 'Failed to remove WhatsApp connection.' }
  return { data: undefined, error: null }
}

// ── Toggle notifications ──────────────────────────────────────────────────────

export async function toggleWhatsAppNotifications(enabled: boolean): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: user.id, whatsapp_notifications_enabled: enabled },
      { onConflict: 'user_id' },
    )

  if (error) return { data: null, error: 'Failed to update preference.' }
  return { data: undefined, error: null }
}
