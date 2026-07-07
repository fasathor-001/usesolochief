import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsApp } from '@/lib/whatsapp/twilio'
import Anthropic from '@anthropic-ai/sdk'

export interface WhatsAppResult {
  sent:    number
  skipped: number
  failed:  number
}

// ── Dedupe helpers ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function alreadySent(db: any, dedupeKey: string): Promise<boolean> {
  const { data } = await db
    .from('whatsapp_logs')
    .select('id')
    .eq('dedupe_key', dedupeKey)
    .maybeSingle()
  return !!data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logWhatsApp(db: any, params: {
  userId: string | null
  phone: string
  direction: 'inbound' | 'outbound'
  type: string
  dedupeKey?: string
  status: 'sent' | 'failed'
  error?: string | null
}): Promise<void> {
  await db.from('whatsapp_logs').insert({
    user_id:    params.userId,
    phone:      params.phone,
    direction:  params.direction,
    type:       params.type,
    dedupe_key: params.dedupeKey ?? null,
    status:     params.status,
    error:      params.error ?? null,
  })
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInQuietHours(profile: any, now: Date): boolean {
  const hour = now.getHours()
  const start = profile.whatsapp_quiet_start
  const end = profile.whatsapp_quiet_end
  if (start === null || end === null) return false // No quiet hours
  if (start < end) return hour >= start && hour < end // Normal range (e.g. 9-17)
  return hour >= start || hour < end // Overnight wrap (e.g. 21-7)
}

// ── Morning briefing ──────────────────────────────────────────────────────────

export async function sendMorningBriefings(): Promise<WhatsAppResult> {
  const db      = createAdminClient()
  const now     = new Date()
  const today   = toDateStr(now)
  const result: WhatsAppResult = { sent: 0, skipped: 0, failed: 0 }

  // Fetch all verified, opted-in users who have completed onboarding
  const { data: profiles } = await db
    .from('profiles')
    .select('user_id, full_name, whatsapp_number, whatsapp_connected, whatsapp_onboarded_at, whatsapp_briefing_hour, whatsapp_quiet_start, whatsapp_quiet_end')
    .eq('whatsapp_connected', true)
    .not('whatsapp_number', 'is', null)
    .not('whatsapp_onboarded_at', 'is', null)

  if (!profiles || profiles.length === 0) return result

  // Notification opt-outs
  const { data: notifPrefs } = await db
    .from('notification_preferences')
    .select('user_id, whatsapp_notifications_enabled')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const optedOut = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (notifPrefs ?? []).filter((p: any) => p.whatsapp_notifications_enabled === false).map((p: any) => p.user_id as string),
  )

  for (const profile of profiles as any[]) {
    const { user_id, full_name, whatsapp_number, whatsapp_briefing_hour } = profile
    if (!whatsapp_number) { result.skipped++; continue }
    if (optedOut.has(user_id)) { result.skipped++; continue }

    // Check if briefing hour matches current hour
    if (whatsapp_briefing_hour !== null && whatsapp_briefing_hour !== now.getHours()) {
      result.skipped++
      continue
    }

    // Skip if user is in quiet hours
    if (isInQuietHours(profile, now)) { result.skipped++; continue }

    const dedupeKey = `whatsapp_morning:${user_id}:${today}`
    if (await alreadySent(db, dedupeKey)) { result.skipped++; continue }

    const briefing = await buildMorningBriefing(db, user_id, full_name ?? '')
    const sendRes  = await sendWhatsApp(whatsapp_number, briefing)

    if (sendRes.error && sendRes.error !== 'not_configured') {
      await logWhatsApp(db, { userId: user_id, phone: whatsapp_number, direction: 'outbound', type: 'briefing', dedupeKey, status: 'failed', error: sendRes.error })
      result.failed++
    } else if (sendRes.error === 'not_configured') {
      result.skipped++
    } else {
      await logWhatsApp(db, { userId: user_id, phone: whatsapp_number, direction: 'outbound', type: 'briefing', dedupeKey, status: 'sent' })
      result.sent++
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildMorningBriefing(db: any, userId: string, name: string): Promise<string> {
  const today = toDateStr(new Date())

  const [focusRes, followupsRes, planRes] = await Promise.all([
    db.from('daily_logs').select('status, notes, commitment_id').eq('user_id', userId).eq('log_date', today).maybeSingle(),
    db.from('followups').select('title, due_date').eq('user_id', userId).is('deleted_at', null).in('status', ['open', 'waiting']).lte('due_date', today).order('due_date').limit(5),
    db.from('weekly_plans').select('main_focus_commitment_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  let mainFocusTitle: string | null = null
  if (planRes.data?.main_focus_commitment_id) {
    const { data: commitment } = await db.from('commitments').select('title').eq('id', planRes.data.main_focus_commitment_id).maybeSingle()
    mainFocusTitle = commitment?.title ?? null
  }

  const greeting = name ? `👋 Morning, ${name.split(' ')[0]}.` : '👋 Morning.'

  const focusLine = mainFocusTitle
    ? `🎯 FOCUS TODAY\n${mainFocusTitle}`
    : `🎯 FOCUS TODAY\nNo focus set — open SoloChief to plan your day.`

  const followups = (followupsRes.data ?? []) as any[]
  const followupLines = followups.length > 0
    ? `🔁 FOLLOW-UPS DUE\n${followups.slice(0, 5).map((f: any) => `• ${f.title}`).join('\n')}`
    : null

  const parts = [greeting, focusLine]
  if (followupLines) parts.push(followupLines)
  parts.push(`Reply 'help' for all commands.`)

  return parts.join('\n\n')
}

// ── Follow-up nudge ───────────────────────────────────────────────────────────

export async function sendFollowupNudges(): Promise<WhatsAppResult> {
  const db      = createAdminClient()
  const now     = new Date()
  const today   = toDateStr(now)
  const result: WhatsAppResult = { sent: 0, skipped: 0, failed: 0 }

  // Fetch all verified, opted-in users who have completed onboarding
  const { data: profiles } = await db
    .from('profiles')
    .select('user_id, full_name, whatsapp_number, whatsapp_connected, whatsapp_onboarded_at, whatsapp_quiet_start, whatsapp_quiet_end')
    .eq('whatsapp_connected', true)
    .not('whatsapp_number', 'is', null)
    .not('whatsapp_onboarded_at', 'is', null)

  if (!profiles || profiles.length === 0) return result

  const { data: notifPrefs } = await db
    .from('notification_preferences')
    .select('user_id, whatsapp_notifications_enabled')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const optedOut = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (notifPrefs ?? []).filter((p: any) => p.whatsapp_notifications_enabled === false).map((p: any) => p.user_id as string),
  )

  for (const profile of profiles as any[]) {
    const { user_id, whatsapp_number } = profile
    if (!whatsapp_number) { result.skipped++; continue }
    if (optedOut.has(user_id)) { result.skipped++; continue }

    // Skip if user is in quiet hours
    if (isInQuietHours(profile, now)) { result.skipped++; continue }

    const dedupeKey = `whatsapp_followup_nudge:${user_id}:${today}`
    if (await alreadySent(db, dedupeKey)) { result.skipped++; continue }

    // Count overdue follow-ups
    const { count: overdueCount } = await db
      .from('followups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .eq('status', 'open')
      .lt('due_date', today)

    if (!overdueCount || overdueCount === 0) { result.skipped++; continue }

    const body = `You have ${overdueCount} overdue follow-up${overdueCount === 1 ? '' : 's'}.\n\nReply 'follow-ups' to review them.`
    const sendRes = await sendWhatsApp(whatsapp_number, body)

    if (sendRes.error && sendRes.error !== 'not_configured') {
      await logWhatsApp(db, { userId: user_id, phone: whatsapp_number, direction: 'outbound', type: 'followup_nudge', dedupeKey, status: 'failed', error: sendRes.error })
      result.failed++
    } else if (sendRes.error === 'not_configured') {
      result.skipped++
    } else {
      await logWhatsApp(db, { userId: user_id, phone: whatsapp_number, direction: 'outbound', type: 'followup_nudge', dedupeKey, status: 'sent' })
      result.sent++
    }
  }

  return result
}

// ── Inbound AI reply ─────────────────────────────────────────────────────────

export async function buildAiReply(
  userId: string,
  workspaceId: string,
  userMessage: string,
): Promise<string> {
  const db  = createAdminClient()
  const today = toDateStr(new Date())

  const [profileRes, commitmentsRes, followupsRes] = await Promise.all([
    db.from('profiles').select('full_name').eq('user_id', userId).maybeSingle(),
    db.from('commitments').select('title, stage').eq('user_id', userId).is('deleted_at', null).order('priority').limit(10),
    db.from('followups').select('title, due_date').eq('user_id', userId).is('deleted_at', null).eq('status', 'open').lt('due_date', today).limit(5),
  ])

  const name = profileRes.data?.full_name ?? 'the user'
  const commitments = (commitmentsRes.data ?? []).map((c: any) => `${c.title} [${c.stage}]`).join(', ') || 'none'
  const overdue     = (followupsRes.data ?? []).map((f: any) => f.title).join(', ') || 'none'

  const systemPrompt = `You are SoloChief AI, responding via WhatsApp. The user is ${name}.
Active commitments: ${commitments}.
Overdue follow-ups: ${overdue}.
Keep your reply to 2–3 sentences maximum. Be calm, direct, and specific. UK spelling. No emojis.
CRITICAL: Never use em dashes (—) in any response. Use a comma, full stop, or new line instead.`

  if (!process.env.ANTHROPIC_API_KEY) return "I'm not able to answer that right now — open SoloChief at solochief.app for assistance."

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response  = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
    })

    const block = response.content[0]
    return block.type === 'text' ? block.text.trim() : "I wasn't able to form a response. Try again or open SoloChief."
  } catch {
    return "Something went wrong. Open SoloChief at solochief.app for assistance."
  }
}
