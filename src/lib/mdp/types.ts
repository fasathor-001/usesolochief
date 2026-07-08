// Shared MDP types and pure utilities — no 'use server', safe to import in client components.

export type AgentName  = 'planning' | 'focus' | 'followup' | 'review'
export type AgentState = 'candidate' | 'proving' | 'valued' | 'void'

export interface AgentMdpRow {
  id:                string
  user_id:           string
  agent_name:        AgentName
  state:             AgentState
  correct_streak:    number
  r0_count:          number
  total_evaluations: number
  last_evaluated_at: string | null
  created_at:        string
}

export interface EvaluationResult {
  newState: AgentState
  message:  string
}

// User-facing label — never expose "void" or "dead" to users.
export function stateLabel(state: AgentState): string {
  switch (state) {
    case 'candidate':  return 'Candidate'
    case 'proving':    return 'Proving'
    case 'valued':     return 'Valued'
    case 'void':       return 'Rebuilding'
  }
}

// Review signal — synchronous pure function, no DB access.
// R1 if review completed and ratings useful (avg ≥ 3).
// R0 if skipped or rated poor.
export function collectReviewSignal(
  reviewCompleted: boolean,
  energyRating:    number | null,
  focusRating:     number | null,
): boolean | null {
  if (!reviewCompleted) return false

  const ratings = [energyRating, focusRating].filter((r): r is number => r !== null)
  if (ratings.length === 0) return true   // completed without ratings — positive signal

  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  if (avg >= 3) return true
  if (avg <  2) return false
  return true
}
