'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AgentName, AgentState, AgentMdpRow, EvaluationResult } from '@/lib/mdp/types'
import { stateLabel } from '@/lib/mdp/types'

// Proving streak needed to reach Valued
const PROVING_THRESHOLD = 3
// R0 count from Candidate needed to reach Void
const VOID_THRESHOLD    = 5

// ── Transition logic ──────────────────────────────────────────────────────────
//
//  R1 (correct = true):
//    candidate → proving  (streak resets to 1)
//    proving   → proving  (streak++) or valued (if streak >= PROVING_THRESHOLD)
//    valued    → valued   (streak++)
//    void      → void     (terminal — no change accepted)
//
//  R0 (correct = false):
//    candidate → candidate (r0_count++) or void (if r0_count >= VOID_THRESHOLD)
//    proving   → candidate (streak 0)
//    valued    → proving   (streak 0)
//    void      → void      (terminal)

export async function evaluateAgent(
  userId:    string,
  agentName: AgentName,
  correct:   boolean,
): Promise<EvaluationResult> {
  const db = createAdminClient()

  const { data: row, error } = await db
    .from('agent_mdp_states')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_name', agentName)
    .maybeSingle()

  if (error || !row) {
    // Table may not yet exist (migration pending) — fail silently
    console.warn(`[mdp] No state row for agent=${agentName} user=${userId}`)
    return { newState: 'candidate', message: 'State row not found — migration may be pending.' }
  }

  const current: AgentState = row.state

  if (current === 'void') {
    return { newState: 'void', message: `${agentName}: void state is terminal — no transition.` }
  }

  let newState:   AgentState = current
  let newStreak:  number     = row.correct_streak
  let newR0Count: number     = row.r0_count
  const newTotal: number     = row.total_evaluations + 1

  if (correct) {
    newStreak  = row.correct_streak + 1
    newR0Count = 0

    if (current === 'candidate') {
      newState  = 'proving'
      newStreak = 1
    } else if (current === 'proving') {
      if (newStreak >= PROVING_THRESHOLD) {
        newState = 'valued'
      }
    }
    // valued + R1 → valued (streak increments)
  } else {
    newStreak = 0
    newR0Count = row.r0_count + 1

    if (current === 'candidate') {
      if (newR0Count >= VOID_THRESHOLD) newState = 'void'
    } else if (current === 'proving') {
      newState = 'candidate'
    } else if (current === 'valued') {
      newState  = 'proving'
      newR0Count = 0
    }
  }

  const { error: updateErr } = await db
    .from('agent_mdp_states')
    .update({
      state:             newState,
      correct_streak:    newState === 'void' ? 0 : newStreak,
      r0_count:          newR0Count,
      total_evaluations: newTotal,
      last_evaluated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('agent_name', agentName)

  if (updateErr) {
    console.error(`[mdp] Update failed for ${agentName}:`, updateErr.message)
  }

  const label = stateLabel(newState)
  const msg   = correct
    ? `R1: ${agentName} → ${label} (streak: ${newStreak}, total: ${newTotal})`
    : `R0: ${agentName} → ${label} (r0_count: ${newR0Count}, total: ${newTotal})`

  return { newState, message: msg }
}

export async function getUserAgentStates(userId: string): Promise<AgentMdpRow[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('agent_mdp_states')
    .select('*')
    .eq('user_id', userId)
    .order('agent_name')

  if (error) {
    // Table may not exist yet — return empty array gracefully
    return []
  }
  return (data ?? []) as AgentMdpRow[]
}

export async function seedAgentMdpStates(userId: string) {
  const supabase = await createClient()
  const agents = ['planning', 'focus', 'followup', 'review'] as const
  const rows = agents.map(agent_name => ({
    user_id: userId,
    agent_name,
    state: 'candidate' as const,
  }))
  const { error } = await supabase
    .from('agent_mdp_states')
    .upsert(rows, { onConflict: 'user_id,agent_name', ignoreDuplicates: true })
  if (error) {
    console.error('Failed to seed MDP states:', error.message)
  }
}

export async function backfillAgentMdpStatesIfNeeded(userId: string): Promise<void> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agent_mdp_states')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  // If zero rows found, backfill them
  if (!error && (data?.length ?? 0) === 0) {
    await seedAgentMdpStates(userId)
  }
}

