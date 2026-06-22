'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type {
  ActionResult, Commitment, DailyLog, DailyLogStatus, NotTodayItem,
  Followup, StopListItem, SwitchRequest, WeeklyPlan,
} from '@/types/database'
import { incrementDailyLogs, incrementSwitchEvents } from '@/lib/intelligence/intelligence-service'

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface TodayPageData {
  plan: WeeklyPlan | null
  focusCommitment: Commitment | null
  todayLog: DailyLog | null
  notTodayItems: NotTodayItem[]
  followupsDue: Followup[]
  stopItems: StopListItem[]
  allCommitments: Commitment[]
}

export async function getTodayData(): Promise<ActionResult<TodayPageData>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const today = todayString()

  // Get current weekly plan
  const { data: plan } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .lte('week_start', today)
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle()

  let focusCommitment: Commitment | null = null
  let todayLog: DailyLog | null = null

  if (plan?.main_focus_commitment_id) {
    const { data: commitment } = await supabase
      .from('commitments')
      .select('*')
      .eq('id', plan.main_focus_commitment_id)
      .is('deleted_at', null)
      .maybeSingle()
    focusCommitment = (commitment as Commitment) ?? null

    if (focusCommitment) {
      const { data: log } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('commitment_id', focusCommitment.id)
        .eq('log_date', today)
        .maybeSingle()
      todayLog = (log as DailyLog) ?? null
    }
  }

  const [notTodayRes, followupsRes, stopItemsRes, commitmentsRes] = await Promise.all([
    supabase
      .from('not_today_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('blocked_date', today),
    supabase
      .from('followups')
      .select('*')
      .eq('user_id', user.id)
      .is('completed_at', null)
      .lte('due_date', today)
      .order('due_date'),
    supabase
      .from('stop_list_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true),
    supabase
      .from('commitments')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('priority'),
  ])

  return {
    data: {
      plan: (plan as WeeklyPlan) ?? null,
      focusCommitment,
      todayLog,
      notTodayItems: (notTodayRes.data ?? []) as NotTodayItem[],
      followupsDue: (followupsRes.data ?? []) as Followup[],
      stopItems: (stopItemsRes.data ?? []) as StopListItem[],
      allCommitments: (commitmentsRes.data ?? []) as Commitment[],
    },
    error: null,
  }
}

const LogSchema = z.object({
  commitmentId: z.string().uuid(),
  status: z.enum(['planned', 'confirmed', 'in_progress', 'done', 'partial', 'blocked', 'slipped', 'switched', 'wrongly_touched', 'unknown', 'needs_review']),
  notes: z.string().max(2000).optional(),
  timeSpentMins: z.number().int().min(0).max(1440).nullable().optional(),
})

export async function upsertDailyLog(
  input: z.infer<typeof LogSchema>,
): Promise<ActionResult<DailyLog>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const parsed = LogSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!workspace) return { data: null, error: 'No workspace found' }

  const today = todayString()

  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(
      {
        user_id: user.id,
        workspace_id: workspace.id,
        commitment_id: parsed.data.commitmentId,
        log_date: today,
        status: parsed.data.status as DailyLogStatus,
        status_source: 'user_web',
        notes: parsed.data.notes ?? null,
        time_spent_mins: parsed.data.timeSpentMins ?? null,
      },
      { onConflict: 'commitment_id,log_date' },
    )
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }

  await incrementDailyLogs(user.id)

  revalidatePath('/dashboard/today')
  return { data: data as DailyLog, error: null }
}

export async function addNotTodayItem(
  description: string,
  commitmentId?: string,
): Promise<ActionResult<NotTodayItem>> {
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
    .from('not_today_items')
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      description,
      blocked_date: todayString(),
      commitment_id: commitmentId ?? null,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/today')
  return { data: data as NotTodayItem, error: null }
}

export async function removeNotTodayItem(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('not_today_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/today')
  return { data: null, error: null }
}

export async function requestSwitch(
  fromCommitmentId: string,
  toCommitmentId: string,
  reason: string,
): Promise<ActionResult<SwitchRequest>> {
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
    .from('switch_requests')
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      from_commitment_id: fromCommitmentId,
      to_commitment_id: toCommitmentId,
      reason,
      decision: 'pending',
      source: 'user_web',
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  await incrementSwitchEvents(user.id)
  revalidatePath('/dashboard/today')
  return { data: data as SwitchRequest, error: null }
}

export async function decideSwitchRequest(
  requestId: string,
  decision: 'approved' | 'blocked',
  decisionNote?: string,
): Promise<ActionResult<SwitchRequest>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('switch_requests')
    .update({
      decision,
      decided_at: new Date().toISOString(),
      decision_note: decisionNote ?? null,
    })
    .eq('id', requestId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/today')
  return { data: data as SwitchRequest, error: null }
}

export async function completeFollowup(followupId: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('followups')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', followupId)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/today')
  return { data: null, error: null }
}
