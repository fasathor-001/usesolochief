'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Review, ReviewItem, WeeklyPlan, WeeklyOutcome, Followup, ParkingLotItem, Commitment } from '@/types/database'
import { incrementWeeklyReviews } from '@/lib/intelligence/intelligence-service'
import { getWeekStart } from '@/lib/utils/date-utils'
import { evaluateAgent } from '@/lib/actions/mdp'
import { collectPlanningSignal, collectFocusSignal, collectFollowupSignal } from '@/lib/actions/mdp-signals'
import { collectReviewSignal } from '@/lib/mdp/types'
import { getAIReviewSummaryLimit } from '@/lib/plan-limits'
import { getReviewSummaryUsageThisMonth } from '@/lib/actions/usage'

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

  // MDP Agent Trust Engine — collect signals and evaluate all four agents.
  // Runs after review is saved; failures do not block the review save.
  try {
    const [planningSignal, focusSignal, followupSignal] = await Promise.all([
      collectPlanningSignal(user.id),
      collectFocusSignal(user.id),
      collectFollowupSignal(user.id),
    ])
    const reviewSignal = collectReviewSignal(true, input.energyRating, input.focusRating)

    const evaluations: Array<{ agent: Parameters<typeof evaluateAgent>[1]; signal: boolean | null }> = [
      { agent: 'planning', signal: planningSignal },
      { agent: 'focus',    signal: focusSignal    },
      { agent: 'followup', signal: followupSignal  },
      { agent: 'review',   signal: reviewSignal    },
    ]

    for (const { agent, signal } of evaluations) {
      if (signal !== null) {
        const result = await evaluateAgent(user.id, agent, signal)
        console.log(`[review/mdp] ${result.message}`)
      }
    }
  } catch (err) {
    console.error('[review/mdp] MDP evaluation error (non-blocking):', err instanceof Error ? err.message : 'unknown')
  }

  // Generate AI summary — non-blocking, respects monthly quota
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    const plan = profileData?.plan ?? 'free'
    const summaryLimit = getAIReviewSummaryLimit(plan)
    const summaryUsed = await getReviewSummaryUsageThisMonth(user.id)

    if (summaryLimit === Infinity || summaryUsed < summaryLimit) {
      const parts: string[] = []
      if (input.shippedText) parts.push(`Got done: ${input.shippedText}`)
      if (input.slippedText) parts.push(`Slipped: ${input.slippedText}`)
      if (input.wronglyTouchedText) parts.push(`Wrongly touched: ${input.wronglyTouchedText}`)
      if (input.belowLevelText) parts.push(`Below-level work: ${input.belowLevelText}`)
      if (input.nextWeekStopListChange) parts.push(`Stop-list change: ${input.nextWeekStopListChange}`)
      if (input.energyRating) parts.push(`Energy: ${input.energyRating}/5`)
      if (input.focusRating) parts.push(`Focus: ${input.focusRating}/5`)

      if (parts.length > 0) {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: 'You write concise, honest weekly review summaries for solo operators. 2-3 sentences. No filler. Plain prose, no bullet points.',
          messages: [{ role: 'user', content: `Summarise this week:\n${parts.join('\n')}` }],
        })
        const summaryText = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : null
        if (summaryText) {
          await supabase
            .from('reviews')
            .update({ summary: summaryText })
            .eq('id', review.id)
        }
      }
    }
  } catch (err) {
    console.error('[review/summary] AI summary error (non-blocking):', err instanceof Error ? err.message : 'unknown')
  }

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
