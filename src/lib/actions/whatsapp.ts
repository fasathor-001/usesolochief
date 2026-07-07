'use server'

import { createHash, randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsApp } from '@/lib/whatsapp/twilio'
import { startOnboarding } from '@/lib/whatsapp/onboarding'
import type { ActionResult } from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateConnectToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < 6; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export interface WhatsAppStatus {
  number: string | null
  connected: boolean
  notificationsEnabled: boolean
}

// ── Get status ────────────────────────────────────────────────────────────────

export async function getWhatsAppStatus(): Promise<ActionResult<WhatsAppStatus>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const profileRes = await supabase
    .from('profiles')
    .select('whatsapp_number, whatsapp_connected, whatsapp_notifications_enabled')
    .eq('user_id', user.id)
    .single()

  return {
    data: {
      number:               profileRes.data?.whatsapp_number ?? null,
      connected:            profileRes.data?.whatsapp_connected ?? false,
      notificationsEnabled: profileRes.data?.whatsapp_notifications_enabled ?? true,
    },
    error: null,
  }
}

// ── Generate WhatsApp Connect Link ───────────────────────────────────────────

export async function generateWhatsAppConnectLink(): Promise<ActionResult<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const rawToken = generateConnectToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const db = createAdminClient()

  // Expire any existing unused tokens for this user
  await db
    .from('whatsapp_connect_tokens')
    .update({ expires_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('used', false)

  // Insert new token
  const { error: insertErr } = await db.from('whatsapp_connect_tokens').insert({
    user_id:    user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  if (insertErr) {
    return { data: null, error: 'Failed to generate connection link.' }
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER
  if (!whatsappNumber) {
    return { data: null, error: 'WhatsApp configuration not available.' }
  }

  const connectMessage = `Hey Chief ${rawToken}`
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(connectMessage)}`

  return { data: waUrl, error: null }
}

// ── Disconnect WhatsApp ───────────────────────────────────────────────────────

export async function disconnectWhatsApp(): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      whatsapp_connected: false,
      whatsapp_disconnected_at: new Date().toISOString(),
      whatsapp_number: null,
    })
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
