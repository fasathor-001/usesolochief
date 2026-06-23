'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isPlatformAdmin } from '@/lib/admin'

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string
  email: string
  full_name: string | null
  plan: string
  onboarded_at: string | null
  created_at: string
  last_sign_in_at: string | null
  plan_activated_at: string | null
  plan_expires_at: string | null
  plan_cancelled_at: string | null
  polar_customer_id: string | null
  polar_subscription_id: string | null
  providers: string[]
}

export interface AdminUserDetail extends AdminUserRow {
  workspace_id: string | null
  commitment_count: number
  followup_count: number
  parking_count: number
  review_count: number
  weekly_plan_count: number
}

export interface AdminMetrics {
  total: number
  newThisWeek: number
  onboarded: number
  free: number
  pro: number
  operator: number
  chief: number
  paid: number
  withWeeklyPlan: number
  withCommitments: number
  withReview: number
  recentSignups: AdminUserRow[]
  recentUpgrades: AdminUserRow[]
}

export interface AdminFeedbackRow {
  id: string
  user_id: string | null
  email: string | null
  type: string
  message: string
  page: string | null
  status: string
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export interface SystemStatus {
  appUrl: string
  environment: string
  supabaseConfigured: boolean
  polarConfigured: boolean
  resendConfigured: boolean
  twilioConfigured: boolean
  cronConfigured: boolean
  anthropicConfigured: boolean
  tableCounts: Record<string, number>
}

// ── Guard ──────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isPlatformAdmin(user.email)) throw new Error('Unauthorised')
  return createAdminClient()
}

// ── Merge helper ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeUsers(authUsers: any[], profiles: any[]): AdminUserRow[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return authUsers.map((u: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: any = profileMap.get(u.id) ?? {}
    return {
      id: u.id,
      email: u.email ?? '',
      full_name: p.full_name ?? null,
      plan: p.plan ?? 'free',
      onboarded_at: p.onboarded_at ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      plan_activated_at: p.plan_activated_at ?? null,
      plan_expires_at: p.plan_expires_at ?? null,
      plan_cancelled_at: p.plan_cancelled_at ?? null,
      polar_customer_id: p.polar_customer_id ?? null,
      polar_subscription_id: p.polar_subscription_id ?? null,
      providers: u.app_metadata?.providers ?? [],
    }
  })
}

// ── Metrics ────────────────────────────────────────────────────────────────

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const db = await requireAdmin()

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const [authUsersResult, profilesResult, weeklyPlanResult, commitmentResult, reviewResult] =
    await Promise.all([
      db.auth.admin.listUsers({ perPage: 1000 }),
      db.from('profiles').select(
        'user_id, plan, onboarded_at, created_at, full_name, plan_activated_at, plan_expires_at, plan_cancelled_at, polar_customer_id, polar_subscription_id',
      ),
      db.from('weekly_plans').select('workspace_id'),
      db.from('commitments').select('workspace_id').is('deleted_at', null),
      db.from('reviews').select('workspace_id'),
    ])

  const authUsers = authUsersResult.data?.users ?? []
  const profiles = profilesResult.data ?? []
  const merged = mergeUsers(authUsers, profiles)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withWeeklyPlan = new Set((weeklyPlanResult.data ?? []).map((r: any) => r.workspace_id)).size
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withCommitments = new Set((commitmentResult.data ?? []).map((r: any) => r.workspace_id)).size
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withReview = new Set((reviewResult.data ?? []).map((r: any) => r.workspace_id)).size

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planCounts = profiles.reduce((acc: Record<string, number>, p: any) => {
    const plan = p.plan ?? 'free'
    acc[plan] = (acc[plan] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const newThisWeek = merged.filter(u => new Date(u.created_at) >= weekStart).length

  const recentSignups = [...merged]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  const recentUpgrades = [...merged]
    .filter(u => u.plan_activated_at)
    .sort((a, b) => new Date(b.plan_activated_at!).getTime() - new Date(a.plan_activated_at!).getTime())
    .slice(0, 8)

  return {
    total: merged.length,
    newThisWeek,
    onboarded: profiles.filter((p: any) => p.onboarded_at).length,
    free: planCounts['free'] ?? 0,
    pro: planCounts['pro'] ?? 0,
    operator: planCounts['operator'] ?? 0,
    chief: planCounts['chief'] ?? 0,
    paid: (planCounts['pro'] ?? 0) + (planCounts['operator'] ?? 0) + (planCounts['chief'] ?? 0),
    withWeeklyPlan,
    withCommitments,
    withReview,
    recentSignups,
    recentUpgrades,
  }
}

// ── Users list ─────────────────────────────────────────────────────────────

export async function getAdminUsers(search?: string, plan?: string): Promise<AdminUserRow[]> {
  const db = await requireAdmin()

  const [authUsersResult, profilesResult] = await Promise.all([
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from('profiles').select(
      'user_id, full_name, plan, onboarded_at, created_at, plan_activated_at, plan_expires_at, plan_cancelled_at, polar_customer_id, polar_subscription_id',
    ),
  ])

  let merged = mergeUsers(authUsersResult.data?.users ?? [], profilesResult.data ?? [])

  if (plan && plan !== 'all') merged = merged.filter(u => u.plan === plan)

  if (search) {
    const q = search.toLowerCase()
    merged = merged.filter(
      u => u.email.toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q),
    )
  }

  return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ── User detail ────────────────────────────────────────────────────────────

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const db = await requireAdmin()

  const [authUserResult, profileResult, workspaceResult] = await Promise.all([
    db.auth.admin.getUserById(userId),
    db.from('profiles').select('*').eq('user_id', userId).single(),
    db.from('workspaces').select('id').eq('user_id', userId).single(),
  ])

  if (authUserResult.error || !authUserResult.data.user) return null

  const authUser = authUserResult.data.user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile: any = profileResult.data ?? {}
  const workspaceId: string | null = workspaceResult.data?.id ?? null

  let commitment_count = 0, followup_count = 0, parking_count = 0, review_count = 0, weekly_plan_count = 0

  if (workspaceId) {
    const [cc, fc, pc, rc, wpc] = await Promise.all([
      db.from('commitments').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).is('deleted_at', null),
      db.from('followups').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).not('status', 'eq', 'cancelled'),
      db.from('parking_lot_items').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
      db.from('reviews').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
      db.from('weekly_plans').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
    ])
    commitment_count = cc.count ?? 0
    followup_count = fc.count ?? 0
    parking_count = pc.count ?? 0
    review_count = rc.count ?? 0
    weekly_plan_count = wpc.count ?? 0
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    full_name: profile.full_name ?? null,
    plan: profile.plan ?? 'free',
    onboarded_at: profile.onboarded_at ?? null,
    created_at: authUser.created_at,
    last_sign_in_at: (authUser as any).last_sign_in_at ?? null,
    plan_activated_at: profile.plan_activated_at ?? null,
    plan_expires_at: profile.plan_expires_at ?? null,
    plan_cancelled_at: profile.plan_cancelled_at ?? null,
    polar_customer_id: profile.polar_customer_id ?? null,
    polar_subscription_id: profile.polar_subscription_id ?? null,
    providers: authUser.app_metadata?.providers ?? [],
    workspace_id: workspaceId,
    commitment_count,
    followup_count,
    parking_count,
    review_count,
    weekly_plan_count,
  }
}

// ── Billing list ───────────────────────────────────────────────────────────

export async function getAdminBilling(plan?: string): Promise<AdminUserRow[]> {
  const db = await requireAdmin()

  const [authUsersResult, profilesResult] = await Promise.all([
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from('profiles').select(
      'user_id, full_name, plan, plan_activated_at, plan_expires_at, plan_cancelled_at, polar_customer_id, polar_subscription_id, created_at, onboarded_at',
    ),
  ])

  let merged = mergeUsers(authUsersResult.data?.users ?? [], profilesResult.data ?? [])

  if (plan && plan !== 'all') merged = merged.filter(u => u.plan === plan)

  return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ── Feedback ───────────────────────────────────────────────────────────────

export async function getAdminFeedback(status?: string): Promise<AdminFeedbackRow[]> {
  const db = await requireAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db.from('feedback').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) {
    console.error('[admin] getAdminFeedback failed:', error.message)
    return []
  }
  return data ?? []
}

export async function updateFeedbackStatus(id: string, newStatus: string): Promise<void> {
  const db = await requireAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await db.from('feedback').update({
    status: newStatus,
    reviewed_at: new Date().toISOString(),
    reviewed_by: user?.email ?? 'admin',
  }).eq('id', id)

  if (error) {
    console.error('[admin] updateFeedbackStatus failed:', error.message)
    throw new Error('Failed to update feedback status')
  }
}

// ── System status ──────────────────────────────────────────────────────────

export async function getAdminSystemStatus(): Promise<SystemStatus> {
  const db = await requireAdmin()

  const tables = [
    'profiles', 'workspaces', 'commitments', 'weekly_plans',
    'followups', 'parking_lot_items', 'reviews', 'daily_focus',
  ]

  const results = await Promise.all(
    tables.map(t => db.from(t).select('id', { count: 'exact', head: true })),
  )

  const tableCounts: Record<string, number> = {}
  tables.forEach((t, i) => { tableCounts[t] = results[i].count ?? 0 })

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '(not set)',
    environment: process.env.NODE_ENV ?? 'unknown',
    supabaseConfigured: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    polarConfigured: !!(process.env.POLAR_ACCESS_TOKEN || process.env.POLAR_API_KEY),
    resendConfigured: !!(process.env.RESEND_API_KEY),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID),
    cronConfigured: !!(process.env.CRON_SECRET),
    anthropicConfigured: !!(process.env.ANTHROPIC_API_KEY),
    tableCounts,
  }
}
