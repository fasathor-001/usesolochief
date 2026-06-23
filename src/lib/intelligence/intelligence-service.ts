import { createClient } from '@/lib/supabase/server'
import type { DataSufficiency, AdviceConfidence } from '@/types/database'

function deriveConfidence(dailyLogs: number, weeklyReviews: number, switchEvents: number): AdviceConfidence {
  if (weeklyReviews >= 4 && dailyLogs >= 20) return 'high'
  if (dailyLogs >= 10 || weeklyReviews >= 2 || switchEvents >= 5) return 'medium'
  return 'low'
}

export async function getDataSufficiency(): Promise<DataSufficiency> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      dailyLogs: 0, weeklyReviews: 0, switchEvents: 0, parkEvents: 0,
      patternVoiceUnlocked: false, weeklyScoreUnlocked: false, streakVisible: false,
      adviceConfidence: 'low',
    }
  }

  const { data: state } = await supabase
    .from('user_intelligence_state')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!state) {
    return {
      dailyLogs: 0, weeklyReviews: 0, switchEvents: 0, parkEvents: 0,
      patternVoiceUnlocked: false, weeklyScoreUnlocked: false, streakVisible: false,
      adviceConfidence: 'low',
    }
  }

  return {
    dailyLogs: state.total_daily_logs,
    weeklyReviews: state.total_weekly_reviews,
    switchEvents: state.total_switch_events,
    parkEvents: state.total_park_events,
    patternVoiceUnlocked: state.pattern_voice_unlocked,
    weeklyScoreUnlocked: state.weekly_score_unlocked,
    streakVisible: state.streak_visible,
    adviceConfidence: deriveConfidence(
      state.total_daily_logs,
      state.total_weekly_reviews,
      state.total_switch_events,
    ),
  }
}

export async function ensureIntelligenceState(userId: string, workspaceId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('user_intelligence_state').upsert(
    { user_id: userId, workspace_id: workspaceId },
    { onConflict: 'user_id', ignoreDuplicates: true },
  )
}

export async function incrementDailyLogs(userId: string): Promise<void> {
  const supabase = await createClient()
  const { data: state } = await supabase
    .from('user_intelligence_state')
    .select('total_daily_logs, total_weekly_reviews, total_switch_events, total_park_events')
    .eq('user_id', userId)
    .maybeSingle()

  if (!state) return

  const newTotal = state.total_daily_logs + 1
  const patternUnlocked =
    state.total_weekly_reviews >= 2 ||
    newTotal >= 10 ||
    state.total_switch_events + state.total_park_events >= 5

  await supabase
    .from('user_intelligence_state')
    .update({
      total_daily_logs: newTotal,
      pattern_voice_unlocked: patternUnlocked,
    })
    .eq('user_id', userId)
}

export async function incrementWeeklyReviews(userId: string): Promise<void> {
  const supabase = await createClient()
  const { data: state } = await supabase
    .from('user_intelligence_state')
    .select('total_daily_logs, total_weekly_reviews, total_switch_events, total_park_events, first_friday_review_completed_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (!state) return

  const newReviews = state.total_weekly_reviews + 1
  const patternUnlocked =
    newReviews >= 2 ||
    state.total_daily_logs >= 10 ||
    state.total_switch_events + state.total_park_events >= 5
  const weeklyScoreUnlocked =
    !!state.first_friday_review_completed_at && state.total_daily_logs >= 5
  const streakVisible = newReviews >= 4

  await supabase
    .from('user_intelligence_state')
    .update({
      total_weekly_reviews: newReviews,
      pattern_voice_unlocked: patternUnlocked,
      weekly_score_unlocked: weeklyScoreUnlocked,
      streak_visible: streakVisible,
      first_friday_review_completed_at: state.first_friday_review_completed_at ?? new Date().toISOString(),
    })
    .eq('user_id', userId)
}

export async function incrementSwitchEvents(userId: string): Promise<void> {
  const supabase = await createClient()
  const { data: state } = await supabase
    .from('user_intelligence_state')
    .select('total_daily_logs, total_weekly_reviews, total_switch_events, total_park_events')
    .eq('user_id', userId)
    .maybeSingle()

  if (!state) return

  const newSwitches = state.total_switch_events + 1
  const patternUnlocked =
    state.total_weekly_reviews >= 2 ||
    state.total_daily_logs >= 10 ||
    newSwitches + state.total_park_events >= 5

  await supabase
    .from('user_intelligence_state')
    .update({
      total_switch_events: newSwitches,
      pattern_voice_unlocked: patternUnlocked,
    })
    .eq('user_id', userId)
}

export async function incrementParkEvents(userId: string): Promise<void> {
  const supabase = await createClient()
  const { data: state } = await supabase
    .from('user_intelligence_state')
    .select('total_daily_logs, total_weekly_reviews, total_switch_events, total_park_events')
    .eq('user_id', userId)
    .maybeSingle()

  if (!state) return

  const newParks = state.total_park_events + 1
  const patternUnlocked =
    state.total_weekly_reviews >= 2 ||
    state.total_daily_logs >= 10 ||
    state.total_switch_events + newParks >= 5

  await supabase
    .from('user_intelligence_state')
    .update({
      total_park_events: newParks,
      pattern_voice_unlocked: patternUnlocked,
    })
    .eq('user_id', userId)
}

export async function recordFirstWeeklyPlan(userId: string): Promise<void> {
  const supabase = await createClient()
  const { data: state } = await supabase
    .from('user_intelligence_state')
    .select('first_weekly_plan_completed_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (!state || state.first_weekly_plan_completed_at) return

  await supabase
    .from('user_intelligence_state')
    .update({ first_weekly_plan_completed_at: new Date().toISOString() })
    .eq('user_id', userId)
}
