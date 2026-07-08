'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Returns true (R1), false (R0), or null (insufficient data — no signal)

function getWeekStart(): string {
  const now  = new Date()
  const day  = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon  = new Date(now)
  mon.setUTCDate(now.getUTCDate() + diff)
  return mon.toISOString().split('T')[0]
}

// ── Planning signal ───────────────────────────────────────────────────────────
// R1 if ≥60% of weekly outcomes achieved, R0 if <30% or no plan exists.

export async function collectPlanningSignal(userId: string): Promise<boolean | null> {
  const db        = createAdminClient()
  const weekStart = getWeekStart()

  const { data: plan } = await db
    .from('weekly_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (!plan) return false  // R0 — no plan this week

  const { data: outcomes } = await db
    .from('weekly_outcomes')
    .select('id, achieved')
    .eq('weekly_plan_id', plan.id)

  if (!outcomes || outcomes.length === 0) return null

  const total    = outcomes.length
  const achieved = outcomes.filter((o: any) => o.achieved).length
  const rate     = achieved / total

  if (rate >= 0.6) return true    // R1
  if (rate <  0.3) return false   // R0
  return null                      // neutral — no signal
}

// ── Focus signal ──────────────────────────────────────────────────────────────
// Switch Challenge table not yet implemented. Returns null until built.

export async function collectFocusSignal(_userId: string): Promise<boolean | null> {
  return null
}

// ── Follow-up signal ──────────────────────────────────────────────────────────
// R1 if at least one follow-up resolved this week.
// R0 if 3+ follow-ups are overdue and none resolved.

export async function collectFollowupSignal(userId: string): Promise<boolean | null> {
  const db        = createAdminClient()
  const weekStart = getWeekStart()
  const today     = new Date().toISOString().split('T')[0]

  const [resolvedRes, overdueRes] = await Promise.all([
    db
      .from('followups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('updated_at', weekStart),
    db
      .from('followups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .eq('status', 'open')
      .lt('due_date', today),
  ])

  const resolved = resolvedRes.count ?? 0
  const overdue  = overdueRes.count  ?? 0

  if (resolved > 0)   return true    // R1 — at least one loop closed
  if (overdue  >= 3)  return false   // R0 — 3+ overdue ignored
  return null                         // insufficient data
}

