import { NextRequest } from 'next/server'
import twilio from 'twilio'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { twimlResponse, twimlEmpty } from '@/lib/whatsapp/twilio'
import { buildAiReply } from '@/lib/whatsapp/scheduled-whatsapp'
import { handleOnboardingReply, startOnboarding } from '@/lib/whatsapp/onboarding'
import { expiredTokenMessage, alreadyConnectedMessage, helpText } from '@/lib/whatsapp/templates'
import type { OnboardingStep } from '@/lib/whatsapp/onboarding'

// Twilio webhook — URL must exactly match what is configured in the Twilio console.
// Configure this URL in the Twilio console:  https://solochief.app/api/whatsapp/webhook

export async function POST(request: NextRequest) {
  // ── 1. Parse form body first (signature validation requires the params) ───
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const params = Object.fromEntries(formData.entries()) as Record<string, string>

  // ── 2. Signature validation ───────────────────────────────────────────────
  const twilioSignature = request.headers.get('x-twilio-signature') ?? ''
  // URL must be hardcoded — dynamic construction causes mismatches with Twilio's signed URL.
  const url = 'https://solochief.app/api/whatsapp/webhook'

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    twilioSignature,
    url,
    params,
  )

  // Bypass signature check in sandbox mode (Twilio sandbox does not sign requests reliably).
  const isSandbox = process.env.TWILIO_SANDBOX === 'true'

  if (!isValid && !isSandbox) {
    console.warn('[whatsapp/webhook] Invalid Twilio signature')
    return new Response('Forbidden', { status: 403 })
  }

  // ── 2. Parse message ─────────────────────────────────────────────────────
  const rawFrom   = (params['From'] ?? '').replace('whatsapp:', '')
  const bodyText  = (params['Body'] ?? '').trim()

  if (!rawFrom || !bodyText) return twimlEmpty()

  const db = createAdminClient()

  // ── 2.5. Handle connection token flow ────────────────────────────────────
  if (bodyText.startsWith('Hey Chief ')) {
    const rawToken = bodyText.slice(10).trim()
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')

    // Look up token
    const { data: tokenRecord } = await db
      .from('whatsapp_connect_tokens')
      .select('user_id, expires_at, failed_attempts')
      .eq('token_hash', tokenHash)
      .eq('used', false)
      .maybeSingle()

    if (!tokenRecord) {
      return twimlResponse(expiredTokenMessage())
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      await db
        .from('whatsapp_connect_tokens')
        .update({ failed_attempts: tokenRecord.failed_attempts + 1, last_attempt_at: new Date().toISOString() })
        .eq('token_hash', tokenHash)
      return twimlResponse(expiredTokenMessage())
    }

    const userId = tokenRecord.user_id

    // Check for duplicate scenarios
    const { data: existingProfile } = await db
      .from('profiles')
      .select('user_id, whatsapp_number, whatsapp_onboarding_step')
      .eq('whatsapp_number', rawFrom)
      .maybeSingle()

    if (existingProfile) {
      if (existingProfile.user_id === userId) {
        // Same user, already linked
        await db.from('whatsapp_connect_tokens').update({ used: true, used_at: new Date().toISOString() }).eq('token_hash', tokenHash)
        return twimlResponse('WhatsApp is already connected.')
      } else {
        // Different user has this number
        return twimlResponse('This WhatsApp number is connected to another SoloChief account. Please contact support.')
      }
    }

    // Check if user already has a different WhatsApp number
    const { data: userProfile } = await db
      .from('profiles')
      .select('whatsapp_number')
      .eq('user_id', userId)
      .single()

    if (userProfile?.whatsapp_number && userProfile.whatsapp_number !== rawFrom) {
      // Replace old number with new one
      await db
        .from('profiles')
        .update({
          whatsapp_number: rawFrom,
          whatsapp_connected: true,
          whatsapp_connected_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      // New connection
      await db
        .from('profiles')
        .update({
          whatsapp_number: rawFrom,
          whatsapp_connected: true,
          whatsapp_connected_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    }

    // Mark token as used
    await db.from('whatsapp_connect_tokens').update({ used: true, used_at: new Date().toISOString() }).eq('token_hash', tokenHash)

    // Check if onboarding needs to be started
    const onboardingStep = userProfile?.whatsapp_number ? null : undefined
    if (!userProfile?.whatsapp_number) {
      // New connection, start onboarding
      const consentMessage = await startOnboarding(userId, rawFrom)
      return twimlResponse(consentMessage)
    } else {
      // Already had a number, send connected confirmation with user's name
      const { data: profile } = await db
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .maybeSingle()
      const name = profile?.full_name ? profile.full_name.split(' ')[0] : 'there'
      return twimlResponse(alreadyConnectedMessage())
    }
  }

  // ── 3. Look up user by WhatsApp number ──────────────────────────────────

  const { data: profile } = await db
    .from('profiles')
    .select('user_id, full_name, whatsapp_connected, whatsapp_onboarding_step')
    .eq('whatsapp_number', rawFrom)
    .maybeSingle()

  // Log inbound regardless
  await db.from('whatsapp_logs').insert({
    user_id:   profile?.user_id ?? null,
    phone:     rawFrom,
    direction: 'inbound',
    type:      'command_reply',
    status:    'sent',
  }).then()

  if (!profile || !profile.whatsapp_connected) {
    return twimlResponse(
      'This number is not linked to a SoloChief account. Visit solochief.app/dashboard/settings → WhatsApp to connect.',
    )
  }

  const userId = profile.user_id
  const name   = (profile.full_name ?? '').split(' ')[0] || 'there'

  // ── 4. Workspace lookup ──────────────────────────────────────────────────
  const { data: workspace } = await db
    .from('workspaces')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  const workspaceId = workspace?.id ?? ''

  // ── 5. Onboarding check ─────────────────────────────────────────────────
  // If user is mid-onboarding, route to onboarding handler instead of commands
  const onboardingStep = profile.whatsapp_onboarding_step as OnboardingStep | null
  if (onboardingStep && onboardingStep !== 'complete') {
    const reply = await handleOnboardingReply(userId, onboardingStep, bodyText, rawFrom)
    return twimlResponse(reply)
  }

  // ── 6. Command routing ───────────────────────────────────────────────────
  const lower = bodyText.toLowerCase()

  // setup / start setup → initiate onboarding
  if (/^(setup|start\s+setup)\b/.test(lower)) {
    const reply = await startOnboarding(userId, rawFrom)
    return twimlResponse(reply)
  }

  // hi / hello / hey / start → briefing
  if (/^(hi|hello|hey|start)\b/.test(lower)) {
    return twimlResponse(await handleBriefing(db, userId, name))
  }

  // briefing / morning
  if (/^(briefing|morning)\b/.test(lower)) {
    return twimlResponse(await handleBriefing(db, userId, name))
  }

  // focus
  if (/^focus\b/.test(lower)) {
    return twimlResponse(await handleFocus(db, userId))
  }

  // follow-ups / followups
  if (/^follow[\s-]?ups?\b/.test(lower)) {
    return twimlResponse(await handleFollowUps(db, userId))
  }

  // commitments
  if (/^commitments?\b/.test(lower)) {
    return twimlResponse(await handleCommitments(db, userId))
  }

  // plan
  if (/^plan\b/.test(lower)) {
    return twimlResponse(await handlePlan(db, userId))
  }

  // capture [text]
  const captureMatch = lower.match(/^capture\s+(.+)/)
  if (captureMatch) {
    const item = bodyText.slice(8).trim()
    return twimlResponse(await handleCapture(db, userId, workspaceId, item))
  }

  // done [text]
  const doneMatch = lower.match(/^done\s+(.+)/)
  if (doneMatch) {
    const query = bodyText.slice(5).trim()
    return twimlResponse(await handleDone(db, userId, query))
  }

  // help
  if (/^help\b/.test(lower)) {
    return twimlResponse(helpText())
  }

  // AI fallback
  const aiReply = await buildAiReply(userId, workspaceId, bodyText)
  await db.from('whatsapp_logs').insert({
    user_id:   userId,
    phone:     rawFrom,
    direction: 'outbound',
    type:      'ai_reply',
    status:    'sent',
  }).then()

  return twimlResponse(aiReply)
}

// ── Command handlers ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBriefing(db: any, userId: string, name: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  const [focusRes, followupsRes, planRes] = await Promise.all([
    db.from('daily_logs').select('status, commitment_id').eq('user_id', userId).eq('log_date', today).maybeSingle(),
    db.from('followups').select('title, due_date').eq('user_id', userId).is('deleted_at', null).in('status', ['open', 'waiting']).lte('due_date', today).order('due_date').limit(5),
    db.from('weekly_plans').select('main_focus_commitment_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  let mainFocusTitle: string | null = null
  if (planRes.data?.main_focus_commitment_id) {
    const { data: c } = await db.from('commitments').select('title').eq('id', planRes.data.main_focus_commitment_id).maybeSingle()
    mainFocusTitle = c?.title ?? null
  }

  const focusLine = mainFocusTitle
    ? `FOCUS TODAY\n${mainFocusTitle}`
    : `FOCUS TODAY\nNo focus set — open SoloChief to plan your day.`

  const followups = (followupsRes.data ?? []) as any[]
  const followupLines = followups.length > 0
    ? `FOLLOW-UPS DUE\n${followups.map((f: any) => `• ${f.title}`).join('\n')}`
    : null

  const parts = [`Morning, ${name}.`, focusLine]
  if (followupLines) parts.push(followupLines)
  parts.push(`Reply 'help' for all commands.`)

  return parts.join('\n\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleFocus(db: any, userId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  const { data: log } = await db
    .from('daily_logs')
    .select('status, commitment_id')
    .eq('user_id', userId)
    .eq('log_date', today)
    .maybeSingle()

  if (!log?.commitment_id) {
    const { data: plan } = await db
      .from('weekly_plans')
      .select('main_focus_commitment_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (plan?.main_focus_commitment_id) {
      const { data: c } = await db.from('commitments').select('title').eq('id', plan.main_focus_commitment_id).maybeSingle()
      if (c?.title) return `TODAY'S FOCUS\n${c.title}\n\nStatus: not yet logged.`
    }
    return `No focus is set for today. Open SoloChief to set one: solochief.app/dashboard/today`
  }

  const { data: c } = await db.from('commitments').select('title').eq('id', log.commitment_id).maybeSingle()
  return `TODAY'S FOCUS\n${c?.title ?? 'Unknown'}\n\nStatus: ${log.status ?? 'not logged'}.`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleFollowUps(db: any, userId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  const { data: followups } = await db
    .from('followups')
    .select('title, due_date, status')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .in('status', ['open', 'waiting'])
    .lte('due_date', today)
    .order('due_date')
    .limit(8)

  if (!followups || followups.length === 0) {
    return 'No follow-ups are due today. All clear.'
  }

  const lines = (followups as any[]).map((f: any) => {
    const overdue = f.due_date < today
    return `• ${f.title}${overdue ? ' (overdue)' : ''}`
  })

  return `FOLLOW-UPS DUE\n${lines.join('\n')}\n\nView all: solochief.app/dashboard/follow-ups`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCommitments(db: any, userId: string): Promise<string> {
  const { data: commitments } = await db
    .from('commitments')
    .select('title, stage')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .not('stage', 'in', '(parked,completed)')
    .order('priority')
    .limit(8)

  if (!commitments || commitments.length === 0) {
    return 'No active commitments. Add one at solochief.app/dashboard/commitments'
  }

  const lines = (commitments as any[]).map((c: any) => `• ${c.title}`)
  return `ACTIVE COMMITMENTS\n${lines.join('\n')}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePlan(db: any, userId: string): Promise<string> {
  const { data: plan } = await db
    .from('weekly_plans')
    .select('main_focus_commitment_id, week_start')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!plan) {
    return `No weekly plan set. Open SoloChief to plan your week: solochief.app/dashboard/weekly-plan`
  }

  let focusTitle: string | null = null
  if (plan.main_focus_commitment_id) {
    const { data: c } = await db.from('commitments').select('title').eq('id', plan.main_focus_commitment_id).maybeSingle()
    focusTitle = c?.title ?? null
  }

  return `THIS WEEK\nWeek of ${plan.week_start}\nMain focus: ${focusTitle ?? 'Not set'}\n\nFull plan: solochief.app/dashboard/weekly-plan`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCapture(db: any, userId: string, workspaceId: string, item: string): Promise<string> {
  if (!item.trim()) return `Send *capture* [item] to save something. Example: capture Review the contract with Alex`

  const today = new Date().toISOString().split('T')[0]

  const { error } = await db.from('parking_lot_items').insert({
    user_id:    userId,
    workspace_id: workspaceId,
    title:      item.trim(),
    category:   'other',
    parked_at:  today,
    status:     'waiting',
    source:     'whatsapp',
  })

  if (error) return 'Could not save to parking lot. Try again or open SoloChief.'

  return `Captured: "${item.trim()}"\n\nSaved to your parking lot. Review it at solochief.app/dashboard/parking-lot`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDone(db: any, userId: string, query: string): Promise<string> {
  if (!query.trim()) return `Send *done* [name] to mark complete. Example: done Call with Alex`

  const { data: followups } = await db
    .from('followups')
    .select('id, title')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .in('status', ['open', 'waiting'])

  if (!followups || followups.length === 0) return 'No open follow-ups found.'

  const lowerQuery = query.toLowerCase()
  const match = (followups as any[]).find((f: any) =>
    f.title.toLowerCase().includes(lowerQuery) || lowerQuery.includes(f.title.toLowerCase().slice(0, 10)),
  )

  if (!match) {
    const titles = (followups as any[]).slice(0, 5).map((f: any) => `• ${f.title}`).join('\n')
    return `No match found for "${query}". Open follow-ups:\n${titles}`
  }

  const { error } = await db
    .from('followups')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', match.id)
    .eq('user_id', userId)

  if (error) return 'Could not mark as done. Try again or open SoloChief.'

  return `Done: "${match.title}" — marked complete.`
}

