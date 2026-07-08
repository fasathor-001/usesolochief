import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { mondayReminderEmail } from '@/lib/email/templates/monday-reminder'
import { fridayReminderEmail } from '@/lib/email/templates/friday-reminder'
import { followupReminderEmail } from '@/lib/email/templates/followup-reminder'

export interface ScheduledEmailResult {
  sent: number
  skipped: number
  failed: number
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getYearWeek(date: Date): string {
  const year = date.getFullYear()
  const week = getISOWeek(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

// ── Dedupe helpers ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function alreadySent(db: any, dedupeKey: string): Promise<boolean> {
  const { data } = await db.from('email_logs')
    .select('id')
    .eq('dedupe_key', dedupeKey)
    .maybeSingle()
  return !!data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logEmail(db: any, params: {
  userId: string
  email: string
  type: string
  dedupeKey: string
  subject: string
  status: 'sent' | 'failed'
  providerId?: string | null
  error?: string | null
}): Promise<void> {
  await db.from('email_logs').insert({
    user_id:             params.userId,
    email:               params.email,
    type:                params.type,
    status:              params.status,
    dedupe_key:          params.dedupeKey,
    subject:             params.subject,
    provider_message_id: params.providerId ?? null,
    error:               params.error ?? null,
    sent_at:             params.status === 'sent' ? new Date().toISOString() : null,
  }).then() // fire-and-forget; don't block send result on log write
}

// ── Monday plan email ─────────────────────────────────────────────────────────

export async function sendMondayPlanEmails(): Promise<ScheduledEmailResult> {
  const db = createAdminClient()
  const now        = new Date()
  const yearWeek   = getYearWeek(now)
  const weekStart  = getMondayOfWeek(now)
  const weekEnd    = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  const weekNumber = getISOWeek(now)

  // Fetch all auth users
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = authData?.users ?? []

  // Profiles: name + workspace_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await db.from('profiles').select('user_id, full_name, workspace_id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]))

  // Email opt-outs (notification_preferences.email_enabled = false)
  const { data: notifPrefs } = await db.from('notification_preferences').select('user_id, email_enabled')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailDisabled = new Set((notifPrefs ?? []).filter((p: any) => p.email_enabled === false).map((p: any) => p.user_id as string))

  // Workspaces that already have a weekly plan for this week
  const { data: existingPlans } = await db.from('weekly_plans')
    .select('workspace_id')
    .gte('week_start', toDateString(weekStart))
    .lt('week_start', toDateString(weekEnd))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspacesWithPlan = new Set((existingPlans ?? []).map((p: any) => p.workspace_id as string))

  const result: ScheduledEmailResult = { sent: 0, skipped: 0, failed: 0 }

  for (const user of authUsers) {
    if (!user.email) { result.skipped++; continue }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile: any = profileMap.get(user.id) ?? {}
    const name: string = profile.full_name ?? ''

    if (emailDisabled.has(user.id)) { result.skipped++; continue }

    // Skip if user already set their weekly plan
    if (profile.workspace_id && workspacesWithPlan.has(profile.workspace_id)) {
      result.skipped++; continue
    }

    const dedupeKey = `monday_plan:${user.id}:${yearWeek}`
    if (await alreadySent(db, dedupeKey)) { result.skipped++; continue }

    const emailContent = mondayReminderEmail(name, weekNumber)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendRes: any = await sendEmail({ to: user.email, ...emailContent })

    if (sendRes.skipped) {
      // No RESEND_API_KEY — dev env, skip without logging
      result.skipped++
    } else if (sendRes.error) {
      await logEmail(db, { userId: user.id, email: user.email, type: 'monday_plan', dedupeKey, subject: emailContent.subject, status: 'failed', error: 'Send failed' })
      result.failed++
    } else {
      await logEmail(db, { userId: user.id, email: user.email, type: 'monday_plan', dedupeKey, subject: emailContent.subject, status: 'sent', providerId: sendRes.data?.id })
      result.sent++
    }
  }

  return result
}

// ── Friday review email ───────────────────────────────────────────────────────

export async function sendFridayReviewEmails(): Promise<ScheduledEmailResult> {
  const db = createAdminClient()
  const now       = new Date()
  const yearWeek  = getYearWeek(now)
  const weekStart = getMondayOfWeek(now)
  const weekEnd   = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = authData?.users ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await db.from('profiles').select('user_id, full_name, workspace_id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]))

  const { data: notifPrefs } = await db.from('notification_preferences').select('user_id, email_enabled')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailDisabled = new Set((notifPrefs ?? []).filter((p: any) => p.email_enabled === false).map((p: any) => p.user_id as string))

  // Workspaces that have a completed review for this week
  const { data: completedReviews } = await db.from('reviews')
    .select('workspace_id')
    .not('completed_at', 'is', null)
    .gte('review_date', toDateString(weekStart))
    .lt('review_date', toDateString(weekEnd))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspacesWithReview = new Set((completedReviews ?? []).map((r: any) => r.workspace_id as string))

  const result: ScheduledEmailResult = { sent: 0, skipped: 0, failed: 0 }

  for (const user of authUsers) {
    if (!user.email) { result.skipped++; continue }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile: any = profileMap.get(user.id) ?? {}
    const name: string = profile.full_name ?? ''

    if (emailDisabled.has(user.id)) { result.skipped++; continue }

    // Skip if user already completed their Friday review this week
    if (profile.workspace_id && workspacesWithReview.has(profile.workspace_id)) {
      result.skipped++; continue
    }

    const dedupeKey = `friday_review:${user.id}:${yearWeek}`
    if (await alreadySent(db, dedupeKey)) { result.skipped++; continue }

    const emailContent = fridayReminderEmail(name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendRes: any = await sendEmail({ to: user.email, ...emailContent })

    if (sendRes.skipped) {
      result.skipped++
    } else if (sendRes.error) {
      await logEmail(db, { userId: user.id, email: user.email, type: 'friday_review', dedupeKey, subject: emailContent.subject, status: 'failed', error: 'Send failed' })
      result.failed++
    } else {
      await logEmail(db, { userId: user.id, email: user.email, type: 'friday_review', dedupeKey, subject: emailContent.subject, status: 'sent', providerId: sendRes.data?.id })
      result.sent++
    }
  }

  return result
}

// ── Follow-up reminder email ──────────────────────────────────────────────────

export async function sendFollowupReminderEmails(): Promise<ScheduledEmailResult> {
  const db      = createAdminClient()
  const now     = new Date()
  const todayStr = toDateString(now)

  // Query follow-ups due today or overdue (not soft-deleted)
  const { data: dueFollowups, error: followupError } = await db.from('followups')
    .select('user_id, title, contact_name, due_date')
    .in('status', ['open', 'waiting'])
    .is('deleted_at', null)
    .lte('due_date', todayStr)
    .order('due_date', { ascending: true })

  if (followupError) {
    console.error('[followup-reminders] query failed:', followupError.message)
    return { sent: 0, skipped: 0, failed: 0 }
  }

  if (!dueFollowups || dueFollowups.length === 0) {
    return { sent: 0, skipped: 0, failed: 0 }
  }

  // Group by user_id, separating overdue from due today
  type OverdueItem = { title: string; contact_name: string | null; days_overdue: number }
  type DueTodayItem = { title: string; contact_name: string | null }
  const userOverdue  = new Map<string, OverdueItem[]>()
  const userDueToday = new Map<string, DueTodayItem[]>()

  for (const item of dueFollowups) {
    const isOverdue  = item.due_date < todayStr
    const isDueToday = item.due_date === todayStr

    if (isOverdue) {
      const msPerDay = 1000 * 60 * 60 * 24
      const daysOverdue = Math.floor((now.getTime() - new Date(item.due_date + 'T00:00:00').getTime()) / msPerDay)
      const arr = userOverdue.get(item.user_id) ?? []
      arr.push({ title: item.title, contact_name: item.contact_name ?? null, days_overdue: daysOverdue })
      userOverdue.set(item.user_id, arr)
    } else if (isDueToday) {
      const arr = userDueToday.get(item.user_id) ?? []
      arr.push({ title: item.title, contact_name: item.contact_name ?? null })
      userDueToday.set(item.user_id, arr)
    }
  }

  // Union of affected user IDs
  const affectedUsers = new Set([...userOverdue.keys(), ...userDueToday.keys()])
  if (affectedUsers.size === 0) return { sent: 0, skipped: 0, failed: 0 }

  // Auth users for emails
  const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authEmailMap = new Map((authData?.users ?? []).map((u: any) => [u.id as string, u.email as string | undefined]))

  // Profiles for names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await db.from('profiles').select('user_id, full_name')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id as string, (p.full_name ?? '') as string]))

  // Email opt-outs
  const { data: notifPrefs } = await db.from('notification_preferences').select('user_id, email_enabled')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailDisabled = new Set((notifPrefs ?? []).filter((p: any) => p.email_enabled === false).map((p: any) => p.user_id as string))

  const result: ScheduledEmailResult = { sent: 0, skipped: 0, failed: 0 }

  for (const userId of affectedUsers) {
    const userEmail = authEmailMap.get(userId)
    if (!userEmail) { result.skipped++; continue }

    if (emailDisabled.has(userId)) { result.skipped++; continue }

    const dedupeKey = `followup_due:${userId}:${todayStr}`
    if (await alreadySent(db, dedupeKey)) { result.skipped++; continue }

    const overdueItems  = userOverdue.get(userId) ?? []
    const dueTodayItems = userDueToday.get(userId) ?? []
    const name          = profileMap.get(userId) ?? ''

    const emailContent = followupReminderEmail(name, overdueItems, dueTodayItems)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendRes: any = await sendEmail({ to: userEmail, ...emailContent })

    if (sendRes.skipped) {
      result.skipped++
    } else if (sendRes.error) {
      await logEmail(db, { userId, email: userEmail, type: 'followup_due', dedupeKey, subject: emailContent.subject, status: 'failed', error: 'Send failed' })
      result.failed++
    } else {
      await logEmail(db, { userId, email: userEmail, type: 'followup_due', dedupeKey, subject: emailContent.subject, status: 'sent', providerId: sendRes.data?.id })
      result.sent++
    }
  }

  return result
}
