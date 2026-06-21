'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type {
  ActionResult, WeeklyPlan, WeeklyOutcome, StopListItem, Followup, Commitment,
} from '@/types/database'
import { recordFirstWeeklyPlan } from '@/lib/intelligence/intelligence-service'

// Returns YYYY-MM-DD for the Monday of the week containing the given date
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface WeeklyPlanPageData {
  plan: WeeklyPlan
  outcomes: WeeklyOutcome[]
  commitments: Commitment[]
  stopItems: StopListItem[]
  followups: Followup[]
}

export async function getOrCreateWeeklyPlan(): Promise<ActionResult<WeeklyPlanPageData>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!workspace) return { data: null, error: 'No workspace found' }

  const weekStart = getWeekStart()

  // Fetch or create weekly plan
  let { data: plan } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (!plan) {
    const { data: created, error: createErr } = await supabase
      .from('weekly_plans')
      .insert({
        user_id: user.id,
        workspace_id: workspace.id,
        week_start: weekStart,
      })
      .select('*')
      .single()
    if (createErr) return { data: null, error: createErr.message }
    plan = created
  }

  const [outcomesRes, commitmentsRes, stopItemsRes, followupsRes] = await Promise.all([
    supabase
      .from('weekly_outcomes')
      .select('*')
      .eq('weekly_plan_id', plan.id)
      .order('created_at'),
    supabase
      .from('commitments')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('priority'),
    supabase
      .from('stop_list_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at'),
    supabase
      .from('followups')
      .select('*')
      .eq('user_id', user.id)
      .is('completed_at', null)
      .order('due_date', { nullsFirst: false }),
  ])

  return {
    data: {
      plan: plan as WeeklyPlan,
      outcomes: (outcomesRes.data ?? []) as WeeklyOutcome[],
      commitments: (commitmentsRes.data ?? []) as Commitment[],
      stopItems: (stopItemsRes.data ?? []) as StopListItem[],
      followups: (followupsRes.data ?? []) as Followup[],
    },
    error: null,
  }
}

const UpdatePlanSchema = z.object({
  mainFocusCommitmentId: z.string().uuid().nullable().optional(),
  overrideCommitmentId: z.string().uuid().nullable().optional(),
  theme: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

export async function updateWeeklyPlan(
  planId: string,
  input: z.infer<typeof UpdatePlanSchema>,
): Promise<ActionResult<WeeklyPlan>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const parsed = UpdatePlanSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  const updates: Record<string, unknown> = {}
  if (parsed.data.mainFocusCommitmentId !== undefined) updates.main_focus_commitment_id = parsed.data.mainFocusCommitmentId
  if (parsed.data.overrideCommitmentId !== undefined) updates.override_commitment_id = parsed.data.overrideCommitmentId
  if (parsed.data.theme !== undefined) updates.theme = parsed.data.theme
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes

  const { data, error } = await supabase
    .from('weekly_plans')
    .update(updates)
    .eq('id', planId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/weekly-plan')
  return { data: data as WeeklyPlan, error: null }
}

export async function lockWeeklyPlan(planId: string): Promise<ActionResult<WeeklyPlan>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: plan } = await supabase
    .from('weekly_plans')
    .select('*, weekly_outcomes(*)')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (!plan) return { data: null, error: 'Weekly plan not found' }
  if (!plan.main_focus_commitment_id) return { data: null, error: 'Set your main focus before locking' }

  const outcomes = (plan.weekly_outcomes as WeeklyOutcome[]) ?? []
  const filled = outcomes.filter((o) => o.description?.trim())
  if (filled.length !== 3) return { data: null, error: 'You must have exactly 3 outcomes before locking' }

  const { data, error } = await supabase
    .from('weekly_plans')
    .update({ locked_at: new Date().toISOString() })
    .eq('id', planId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }

  await recordFirstWeeklyPlan(user.id)

  revalidatePath('/dashboard/weekly-plan')
  revalidatePath('/dashboard/today')
  return { data: data as WeeklyPlan, error: null }
}

export async function upsertWeeklyOutcome(
  planId: string,
  index: number,
  description: string,
  existingId?: string,
): Promise<ActionResult<WeeklyOutcome>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: plan } = await supabase
    .from('weekly_plans')
    .select('workspace_id, locked_at')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (!plan) return { data: null, error: 'Weekly plan not found' }
  if (plan.locked_at) return { data: null, error: 'Weekly plan is locked' }

  if (existingId) {
    const { data, error } = await supabase
      .from('weekly_outcomes')
      .update({ description })
      .eq('id', existingId)
      .eq('weekly_plan_id', planId)
      .select('*')
      .single()
    if (error) return { data: null, error: error.message }
    return { data: data as WeeklyOutcome, error: null }
  }

  const { data, error } = await supabase
    .from('weekly_outcomes')
    .insert({
      user_id: user.id,
      workspace_id: plan.workspace_id,
      weekly_plan_id: planId,
      description,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as WeeklyOutcome, error: null }
}

export async function addStopListItem(description: string): Promise<ActionResult<StopListItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!workspace) return { data: null, error: 'No workspace found' }

  const { data, error } = await supabase
    .from('stop_list_items')
    .insert({ user_id: user.id, workspace_id: workspace.id, description, active: true })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/weekly-plan')
  return { data: data as StopListItem, error: null }
}

export async function removeStopListItem(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('stop_list_items')
    .update({ active: false, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/weekly-plan')
  return { data: null, error: null }
}
