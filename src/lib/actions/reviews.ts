'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Review, ReviewItem, WeeklyPlan, WeeklyOutcome, Followup, ParkingLotItem, Commitment } from '@/types/database'
import { incrementWeeklyReviews } from '@/lib/intelligence/intelligence-service'
import { getWeekStart } from '@/lib/utils/date-utils'

export interface ReviewPageData {
  plan: WeeklyPlan | null
  outcomes: WeeklyOutcome[]
  overdueFollowups: Followup[]
  parkingItemsThisWeek: ParkingLotItem[]
  commitments: Commitment[]
  existingReview: Review | null
}

export async function getReviewPageData(): Promise<ActionResult<ReviewPageData>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const weekStart = getWeekStart()
  const today = new Date().toISOString().split('T')[0]

  const [planRes, followupsRes, parkingRes, commitmentsRes, existingReviewRes] = await Promise.all([
    supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle(),
    supabase
      .from('followups')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .eq('status', 'open')
      .lt('due_date', today),
    supabase
      .from('parking_lot_items')
      .select('*')
      .eq('user_id', user.id)
      .gte('parked_at', weekStart),
    supabase
      .from('commitments')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('priority'),
    supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .gte('review_date', weekStart)
      .maybeSingle(),
  ])

  const plan = planRes.data as WeeklyPlan | null
  let outcomes: WeeklyOutcome[] = []

  if (plan) {
    const { data: outcomesData } = await supabase
      .from('weekly_outcomes')
      .select('*')
      .eq('weekly_plan_id', plan.id)
      .order('created_at')
    outcomes = (outcomesData ?? []) as WeeklyOutcome[]
  }

  return {
    data: {
      plan,
      outcomes,
      overdueFollowups: (followupsRes.data ?? []) as Followup[],
      parkingItemsThisWeek: (parkingRes.data ?? []) as ParkingLotItem[],
      commitments: (commitmentsRes.data ?? []) as Commitment[],
      existingReview: existingReviewRes.data as Review | null,
    },
    error: null,
  }
}

export interface CompleteReviewInput {
  weeklyPlanId: string | null
  shippedText: string
  slippedText: string
  wronglyTouchedText: string
  belowLevelText: string
  nextWeekFocusCommitmentId: string | null
  nextWeekStopListChange: string
  outcomeResults: { outcomeId: string; achieved: boolean }[]
  dismissedFollowupIds: string[]
  energyRating: number | null
  focusRating: number | null
}

export async function completeReview(input: CompleteReviewInput): Promise<ActionResult<Review>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!workspace) return { data: null, error: 'No workspace found' }

  const today = new Date().toISOString().split('T')[0]

  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      weekly_plan_id: input.weeklyPlanId,
      review_date: today,
      review_type: 'friday_review',
      shipped_text: input.shippedText || null,
      slipped_text: input.slippedText || null,
      wrongly_touched_text: input.wronglyTouchedText || null,
      below_level_text: input.belowLevelText || null,
      next_week_focus_commitment_id: input.nextWeekFocusCommitmentId,
      next_week_stop_list_change: input.nextWeekStopListChange || null,
      energy_rating: input.energyRating,
      focus_rating: input.focusRating,
      completed_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (reviewError) return { data: null, error: reviewError.message }

  // Write review_items for outcome results
  if (input.outcomeResults.length > 0) {
    const reviewItems = input.outcomeResults.map(({ outcomeId, achieved }) => ({
      user_id: user.id,
      workspace_id: workspace.id,
      review_id: review.id,
      commitment_id: null as string | null,
      description: outcomeId,
      outcome: (achieved ? 'done' : 'slipped') as string,
    }))
    await supabase.from('review_items').insert(reviewItems)
  }

  // Update outcome achieved flags
  for (const { outcomeId, achieved } of input.outcomeResults) {
    await supabase
      .from('weekly_outcomes')
      .update({ achieved })
      .eq('id', outcomeId)
      .eq('user_id', user.id)
  }

  // Update streak_records for friday_review
  const weekStart = getWeekStart()
  const { data: existingStreak } = await supabase
    .from('streak_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('streak_type', 'friday_review')
    .maybeSingle()

  if (existingStreak) {
    const prevDate = existingStreak.last_completed_date
    const prevWeekStart = prevDate ? getWeekStart(new Date(prevDate)) : null
    // Check if last review was last week (consecutive)
    const lastWeek = new Date(weekStart)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastWeekStr = lastWeek.toISOString().split('T')[0]
    const isConsecutive = prevWeekStart === lastWeekStr

    const newStreak = isConsecutive ? existingStreak.current_streak + 1 : 1
    const longest = Math.max(existingStreak.longest_streak, newStreak)

    await supabase
      .from('streak_records')
      .update({ current_streak: newStreak, longest_streak: longest, last_completed_date: weekStart })
      .eq('id', existingStreak.id)
  } else {
    await supabase.from('streak_records').insert({
      user_id: user.id,
      workspace_id: workspace.id,
      streak_type: 'friday_review',
      current_streak: 1,
      longest_streak: 1,
      last_completed_date: weekStart,
    })
  }

  // Update intelligence state
  await incrementWeeklyReviews(user.id)

  revalidatePath('/dashboard/review')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/weekly-plan')

  return { data: review as Review, error: null }
}

export async function getReviewHistory(): Promise<ActionResult<Review[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('review_date', { ascending: false })
    .limit(52)

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as Review[], error: null }
}

export async function redirectAfterReview(): Promise<void> {
  redirect('/dashboard?reviewed=1')
}
