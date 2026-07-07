import { NextRequest } from 'next/server'
import twilio from 'twilio'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { twimlResponse, twimlEmpty, sendInteractiveMessage, sendWhatsApp } from '@/lib/whatsapp/twilio'
import { buildAiReply } from '@/lib/whatsapp/scheduled-whatsapp'
import { handleOnboardingReply, startOnboarding } from '@/lib/whatsapp/onboarding'
import { expiredTokenMessage, alreadyConnectedMessage, helpText, getTimeOfDayGreeting } from '@/lib/whatsapp/templates'
import { hasWhatsAppAccess } from '@/lib/whatsapp/access'
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
  const buttonPayload = params['ButtonPayload'] ?? params['ButtonText'] ?? ''

  if (!rawFrom || !bodyText) return twimlEmpty()

  const db = createAdminClient()

  // Log incoming request for button payload debugging
  console.log('[whatsapp/webhook] Incoming message:', {
    from: rawFrom,
    body: bodyText,
    buttonPayload: buttonPayload,
    allParams: params,
  })

  // ── 2.4. Handle interactive button replies ─────────────────────────────────
  // Check for button payloads BEFORE processing other message types
  if (buttonPayload || ['Get started 🚀', 'Yes, let\'s go', 'No thanks'].includes(bodyText)) {
    console.log('[whatsapp/webhook] Button reply detected:', buttonPayload || bodyText)

    // Get user info
    const { data: profile } = await db
      .from('profiles')
      .select('user_id, full_name, whatsapp_onboarding_step')
      .eq('whatsapp_number', rawFrom)
      .maybeSingle()

    if (!profile) {
      console.log('[whatsapp/webhook] No profile found for button reply')
      return twimlResponse(
        'Hey. I\'m Chief, your personal Chief of Staff.\n\n' +
        'I help you:\n\n' +
        '✅ Plan the week before it takes over\n' +
        '✅ Protect today\'s focus\n' +
        '✅ Track commitments and follow-ups\n' +
        '✅ Start every morning with clarity\n\n' +
        'To get started, sign up at solochief.app and connect your WhatsApp from Settings.\n\n' +
        'Takes 30 seconds.'
      )
    }

    const userId = profile.user_id
    const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'there'

    // Route button actions
    if (buttonPayload.includes('get_started') || bodyText === 'Get started 🚀') {
      console.log('[whatsapp/webhook] Get Started button')
      // Only trigger onboarding if not already complete
      if (profile.whatsapp_onboarding_step === 'complete') {
        console.log('[whatsapp/webhook] User already completed onboarding, skipping')
        return twimlResponse(
          `✅ You're already set up. Send *hi* for your morning brief or *help* to see all commands.`
        )
      }
      console.log('[whatsapp/webhook] Starting onboarding')
      const consentMessage = await startOnboarding(userId, rawFrom)
      return twimlResponse(consentMessage)
    }

    if (buttonPayload.includes('consent_yes') || bodyText === 'Yes, let\'s go') {
      console.log('[whatsapp/webhook] Consent Yes button')
      const reply = await handleOnboardingReply(userId, 'consent', '1', rawFrom)
      return twimlResponse(reply)
    }

    if (buttonPayload.includes('consent_no') || bodyText === 'No thanks') {
      console.log('[whatsapp/webhook] Consent No button')
      const reply = await handleOnboardingReply(userId, 'consent', '2', rawFrom)
      return twimlResponse(reply)
    }

    // Quiet hours button routing
    for (let i = 1; i <= 4; i++) {
      if (buttonPayload.includes(`quiet_${i}`)) {
        console.log(`[whatsapp/webhook] Quiet hours option ${i} button`)
        const reply = await handleOnboardingReply(userId, 'quiet_hours', String(i), rawFrom)
        return twimlResponse(reply)
      }
    }

    // Briefing time button routing
    for (let i = 1; i <= 4; i++) {
      if (buttonPayload.includes(`brief_${i}`)) {
        console.log(`[whatsapp/webhook] Briefing time option ${i} button`)
        const reply = await handleOnboardingReply(userId, 'briefing_time', String(i), rawFrom)
        return twimlResponse(reply)
      }
    }
  }

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

    // Check for duplicate scenarios - look for ANY profile with this number
    const { data: existingProfile } = await db
      .from('profiles')
      .select('user_id, whatsapp_number, whatsapp_connected')
      .eq('whatsapp_number', rawFrom)
      .maybeSingle()

    if (existingProfile) {
      console.log('[whatsapp/webhook] Found existing profile for number:', rawFrom, {
        user_id: existingProfile.user_id,
        whatsapp_connected: existingProfile.whatsapp_connected,
        current_user_id: userId,
      })

      if (existingProfile.user_id === userId) {
        // Same user with this number
        if (existingProfile.whatsapp_connected === true) {
          // Already actively connected - don't reconnect
          console.log('[whatsapp/webhook] Same user, already connected - blocking reconnect')
          await db.from('whatsapp_connect_tokens').update({ used: true, used_at: new Date().toISOString() }).eq('token_hash', tokenHash)
          return twimlResponse('WhatsApp is already connected.')
        }
        // Same user but disconnected - allow reconnection (continue below)
        console.log('[whatsapp/webhook] Same user but disconnected - allowing reconnect')
      } else if (existingProfile.whatsapp_connected === true) {
        // Different user has this number AND it's actively connected - block
        console.log('[whatsapp/webhook] Different user, actively connected - blocking')
        return twimlResponse('This WhatsApp number is connected to another SoloChief account. Please contact support.')
      } else {
        // Different user but their connection is disconnected - allow this user to take it
        console.log('[whatsapp/webhook] Different user but disconnected - allowing takeover')
      }
    }

    // Check if this user already has a different actively connected WhatsApp number
    const { data: userProfile } = await db
      .from('profiles')
      .select('user_id, whatsapp_number, whatsapp_connected, plan, whatsapp_trial_ends_at, current_plan_id')
      .eq('user_id', userId)
      .single()

    console.log('[Token Handler] Token lookup result:', {
      token_found: !!tokenRecord,
      user_id_from_token: tokenRecord?.user_id,
      profile_found: !!userProfile,
      profile_plan: userProfile?.plan,
      profile_user_id: userProfile?.user_id
    })

    // Check WhatsApp access before allowing connection
    console.log('[Webhook] Profile passed to hasWhatsAppAccess (token handler):', {
      user_id: userProfile?.user_id,
      plan: userProfile?.plan,
      trial_ends_at: userProfile?.whatsapp_trial_ends_at,
      raw_profile: JSON.stringify(userProfile)
    })
    if (!userProfile || !hasWhatsAppAccess(userProfile)) {
      console.log('[whatsapp/webhook] User lacks WhatsApp access - blocking connection')
      await db.from('whatsapp_connect_tokens').update({ used: true, used_at: new Date().toISOString() }).eq('token_hash', tokenHash)
      await db.from('whatsapp_upgrade_prompts').insert({ user_id: userId, prompt_location: 'webhook_token' }).then()
      return twimlResponse('WhatsApp is available on SoloChief Pro. Upgrade at solochief.app/pricing to connect.')
    }

    // Handle existing free users with WhatsApp connected - give them grace period
    if (userProfile?.plan === 'free' && userProfile.whatsapp_connected === true && !userProfile.whatsapp_trial_ends_at) {
      console.log('[whatsapp/webhook] Free user with WhatsApp connected but no trial - giving 7-day grace period')
      const trialEndsAt = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await db
        .from('profiles')
        .update({ whatsapp_trial_ends_at: trialEndsAt, whatsapp_trial_used: true })
        .eq('user_id', userId)
    }

    if (userProfile?.whatsapp_connected === true && userProfile.whatsapp_number && userProfile.whatsapp_number !== rawFrom) {
      // Replace currently connected number with new one
      console.log('[whatsapp/webhook] Replacing old number with new for user:', userId)
      await db
        .from('profiles')
        .update({
          whatsapp_number: rawFrom,
          whatsapp_connected: true,
          whatsapp_connected_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      // New connection or reconnection (whatsapp_connected was false)
      console.log('[whatsapp/webhook] Setting whatsapp_connected=true for user:', userId, 'phone:', rawFrom)
      const { error: updateErr } = await db
        .from('profiles')
        .update({
          whatsapp_number: rawFrom,
          whatsapp_connected: true,
          whatsapp_connected_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      if (updateErr) {
        console.error('[whatsapp/webhook] Failed to update whatsapp_connected:', updateErr)
      } else {
        console.log('[whatsapp/webhook] Successfully updated whatsapp_connected=true')
      }
    }

    // Mark token as used
    await db.from('whatsapp_connect_tokens').update({ used: true, used_at: new Date().toISOString() }).eq('token_hash', tokenHash)

    // Get user's first name for welcome message
    const { data: userProfile2 } = await db
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .maybeSingle()
    const firstName = userProfile2?.full_name ? userProfile2.full_name.split(' ')[0] : 'there'

    // Check if this is a new connection or reconnection
    if (!userProfile?.whatsapp_number) {
      // New connection: send welcome message with fallback, then start consent flow
      console.log('[whatsapp/webhook] New connection - sending welcome message')
      try {
        // Try to send interactive welcome message if ContentSid is available
        if (process.env.TWILIO_CONTENT_CONNECTED_SID) {
          await sendInteractiveMessage(rawFrom, process.env.TWILIO_CONTENT_CONNECTED_SID, { '1': firstName })
          console.log('[whatsapp/webhook] Welcome sent via interactive template')
        } else {
          throw new Error('ContentSid not configured')
        }
      } catch (err) {
        // Always fall back to plain text - never send nothing
        console.log('[whatsapp/webhook] Interactive template failed or not configured, sending text fallback:', err instanceof Error ? err.message : 'unknown')
        await sendWhatsApp(
          rawFrom,
          `🎯 Hey ${firstName}! Your Personal Chief of Staff is now active on WhatsApp. 🚀\n\n` +
          `Here's what I do:\n\n` +
          `📋 Send your morning brief every day\n` +
          `⚡ Let you log updates with a quick reply\n` +
          `🔁 Check in when things go quiet\n` +
          `💬 Answer anything you throw at me\n\n` +
          `Ready to set up your daily rhythm?`
        )
        console.log('[whatsapp/webhook] Welcome text message sent')
      }

      // Welcome message sent - user will tap "Get started 🚀" button to continue
      return twimlResponse('Welcome message sent. Tap the "Get started" button to continue.')
    } else {
      // Reconnection: send connected confirmation
      console.log('[whatsapp/webhook] Reconnection - sending connected confirmation')
      return twimlResponse(alreadyConnectedMessage())
    }
  }

  // ── 3. Look up user by WhatsApp number ──────────────────────────────────

  const { data: profile } = await db
    .from('profiles')
    .select('user_id, full_name, whatsapp_connected, whatsapp_onboarding_step, plan, whatsapp_trial_ends_at')
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
      'Hey. I\'m Chief, your personal Chief of Staff.\n\n' +
      'I help you:\n\n' +
      '✅ Plan the week before it takes over\n' +
      '✅ Protect today\'s focus\n' +
      '✅ Track commitments and follow-ups\n' +
      '✅ Start every morning with clarity\n\n' +
      'To get started, sign up at solochief.app and connect your WhatsApp from Settings.\n\n' +
      'Takes 30 seconds.'
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
    // Only trigger onboarding if not already complete
    if (profile.whatsapp_onboarding_step === 'complete') {
      console.log('[whatsapp/webhook] Setup command but user already completed onboarding')
      return twimlResponse(
        `✅ You're already set up. Send *hi* for your morning brief or *help* to see all commands.`
      )
    }
    console.log('[whatsapp/webhook] Setup command → starting onboarding')
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

  // AI fallback - check access first
  console.log('[Webhook] Profile passed to hasWhatsAppAccess (AI fallback):', {
    user_id: profile?.user_id,
    plan: profile?.plan,
    trial_ends_at: profile?.whatsapp_trial_ends_at,
    raw_profile: JSON.stringify(profile)
  })
  if (!hasWhatsAppAccess(profile)) {
    console.log('[whatsapp/webhook] User lacks WhatsApp access - blocking AI reply')
    await db.from('whatsapp_upgrade_prompts').insert({ user_id: userId, prompt_location: 'ai_fallback' }).then()
    const upgradeMessage = `💬 WhatsApp chat with Chief is available on Pro.\n\nUpgrade at solochief.app/pricing to unlock your personal Chief of Staff on WhatsApp.`
    await db.from('whatsapp_logs').insert({
      user_id: userId,
      phone: rawFrom,
      direction: 'outbound',
      type: 'upgrade_prompt',
      status: 'sent',
    }).then()
    return twimlResponse(upgradeMessage)
  }

  const aiReply = await buildAiReply(userId, workspaceId, bodyText)
  await db.from('whatsapp_logs').insert({
    user_id:   userId,
    phone:     rawFrom,
    direction: 'outbound',
    type:     'ai_reply',
    status:   'sent',
  }).then()

  return twimlResponse(aiReply)
}

// ── Command handlers ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBriefing(db: any, userId: string, name: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  const [focusRes, followupsRes, planRes, commitmentsRes, profileRes] = await Promise.all([
    db.from('daily_logs').select('status, commitment_id').eq('user_id', userId).eq('log_date', today).maybeSingle(),
    db.from('followups').select('title, due_date').eq('user_id', userId).is('deleted_at', null).in('status', ['open', 'waiting']).lte('due_date', today).order('due_date').limit(5),
    db.from('weekly_plans').select('main_focus_commitment_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    db.from('commitments').select('title').eq('user_id', userId).is('deleted_at', null).in('stage', ['main_focus', 'active']).order('priority').limit(5),
    db.from('profiles').select('timezone').eq('user_id', userId).maybeSingle(),
  ])

  let mainFocusTitle: string | null = null
  if (planRes.data?.main_focus_commitment_id) {
    const { data: c } = await db.from('commitments').select('title').eq('id', planRes.data.main_focus_commitment_id).maybeSingle()
    mainFocusTitle = c?.title ?? null
  }

  const focusLine = mainFocusTitle
    ? `🎯 FOCUS TODAY\n${mainFocusTitle}`
    : `🎯 FOCUS TODAY\nNo focus set. Open SoloChief to plan your day.`

  const followups = (followupsRes.data ?? []) as any[]
  const followupLines = followups.length > 0
    ? `🔁 FOLLOW-UPS DUE\n${followups.map((f: any) => `• ${f.title}`).join('\n')}`
    : null

  const commitments = (commitmentsRes.data ?? []) as any[]
  const commitmentLines = commitments.length > 0
    ? `📋 COMMITMENTS\n${commitments.map((c: any) => `• ${c.title}`).join('\n')}`
    : null

  const timezone = profileRes.data?.timezone ?? 'UTC'
  const firstName = name.split(' ')[0]
  const timeGreeting = getTimeOfDayGreeting(firstName, timezone)

  const parts = [timeGreeting, focusLine]
  if (followupLines) parts.push(followupLines)
  if (commitmentLines) parts.push(commitmentLines)
  parts.push(`Reply *help* for all commands.`)
  parts.push(`💬 Or just reply with anything on your mind. Chief is here to help.`)

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

