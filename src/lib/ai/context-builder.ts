import { createClient } from '@/lib/supabase/server'
import { getDataSufficiency } from '@/lib/intelligence/intelligence-service'
import { getWeekStart } from '@/lib/utils/date-utils'

export interface ContextPackage {
  profile: {
    name: string
    timezone: string
  }
  commitments: {
    id: string
    title: string
    category: string
    stage: string
    permissionLevel: string
    priority: number
    nextAction: string | null
  }[]
  currentWeek: {
    weekStart: string
    theme: string | null
    mainFocus: string | null
    stopList: string[]
    outcomes: string[]
    locked: boolean
  }
  todayFocus: {
    date: string
    commitmentTitle: string | null
    status: string | null
    notes: string | null
  }
  overdueFollowups: {
    title: string
    dueDate: string | null
    urgency: string
    daysOverdue: number
  }[]
  recentParkingLot: {
    title: string
    category: string
    parkedAt: string
  }[]
  switchRequestsThisWeek: number
  intelligence: {
    patternVoiceUnlocked: boolean
    weeklyScoreUnlocked: boolean
    adviceConfidence: string
    totalDailyLogs: number
    totalWeeklyReviews: number
  }
  lastReview: {
    date: string
    summary: string | null
    energyRating: number | null
    focusRating: number | null
  } | null
}

export async function buildContextPackage(): Promise<ContextPackage> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const empty: ContextPackage = {
    profile: { name: 'User', timezone: 'UTC' },
    commitments: [],
    currentWeek: { weekStart: '', theme: null, mainFocus: null, stopList: [], outcomes: [], locked: false },
    todayFocus: { date: '', commitmentTitle: null, status: null, notes: null },
    overdueFollowups: [],
    recentParkingLot: [],
    switchRequestsThisWeek: 0,
    intelligence: { patternVoiceUnlocked: false, weeklyScoreUnlocked: false, adviceConfidence: 'low', totalDailyLogs: 0, totalWeeklyReviews: 0 },
    lastReview: null,
  }

  if (!user) return empty

  const weekStart = getWeekStart()
  const today = new Date().toISOString().split('T')[0]

  const [
    profileRes,
    commitmentsRes,
    planRes,
    stopListRes,
    todayLogRes,
    overdueRes,
    parkingRes,
    switchRes,
    reviewRes,
    sufficiency,
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, timezone').eq('user_id', user.id).maybeSingle(),
    supabase.from('commitments').select('id,title,category,stage,permission_level,priority,next_action').eq('user_id', user.id).is('deleted_at', null).order('priority'),
    supabase.from('weekly_plans').select('*').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
    supabase.from('stop_list_items').select('description').eq('user_id', user.id).eq('active', true),
    supabase.from('daily_logs').select('status,notes,commitment_id').eq('user_id', user.id).eq('log_date', today).maybeSingle(),
    supabase.from('followups').select('title,due_date,urgency').eq('user_id', user.id).is('deleted_at', null).eq('status', 'open').lt('due_date', today).order('due_date'),
    supabase.from('parking_lot_items').select('title,category,parked_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('switch_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekStart),
    supabase.from('reviews').select('review_date,summary,energy_rating,focus_rating').eq('user_id', user.id).not('completed_at', 'is', null).order('review_date', { ascending: false }).limit(1).maybeSingle(),
    getDataSufficiency(),
  ])

  const plan = planRes.data
  let mainFocusTitle: string | null = null
  let outcomes: string[] = []

  if (plan?.main_focus_commitment_id) {
    const focusCommitment = commitmentsRes.data?.find((c: { id: string }) => c.id === plan.main_focus_commitment_id)
    mainFocusTitle = focusCommitment?.title ?? null
  }

  if (plan) {
    const { data: outcomesData } = await supabase
      .from('weekly_outcomes')
      .select('description')
      .eq('weekly_plan_id', plan.id)
    outcomes = (outcomesData ?? []).map((o: { description: string }) => o.description)
  }

  // Find today's focus commitment title
  let todayCommitmentTitle: string | null = null
  if (todayLogRes.data?.commitment_id) {
    const c = commitmentsRes.data?.find((c: { id: string }) => c.id === todayLogRes.data?.commitment_id)
    todayCommitmentTitle = c?.title ?? null
  } else if (mainFocusTitle) {
    todayCommitmentTitle = mainFocusTitle
  }

  // Calculate days overdue
  const todayMs = new Date(today).getTime()
  const overdueFollowups = (overdueRes.data ?? []).map((f: { title: string; due_date: string | null; urgency: string }) => {
    const daysOverdue = f.due_date
      ? Math.floor((todayMs - new Date(f.due_date).getTime()) / 86400000)
      : 0
    return { title: f.title, dueDate: f.due_date, urgency: f.urgency ?? 'normal', daysOverdue }
  })

  return {
    profile: {
      name: profileRes.data?.full_name ?? 'User',
      timezone: profileRes.data?.timezone ?? 'Europe/London',
    },
    commitments: (commitmentsRes.data ?? []).map((c: { id: string; title: string; category: string; stage: string; permission_level: string; priority: number; next_action: string | null }) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      stage: c.stage,
      permissionLevel: c.permission_level,
      priority: c.priority,
      nextAction: c.next_action,
    })),
    currentWeek: {
      weekStart,
      theme: plan?.theme ?? null,
      mainFocus: mainFocusTitle,
      stopList: (stopListRes.data ?? []).map((s: { description: string }) => s.description),
      outcomes,
      locked: !!plan?.locked_at,
    },
    todayFocus: {
      date: today,
      commitmentTitle: todayCommitmentTitle,
      status: todayLogRes.data?.status ?? null,
      notes: todayLogRes.data?.notes ?? null,
    },
    overdueFollowups,
    recentParkingLot: (parkingRes.data ?? []).map((p: { title: string; category: string; parked_at: string }) => ({
      title: p.title,
      category: p.category,
      parkedAt: p.parked_at,
    })),
    switchRequestsThisWeek: switchRes.count ?? 0,
    intelligence: {
      patternVoiceUnlocked: sufficiency.patternVoiceUnlocked,
      weeklyScoreUnlocked: sufficiency.weeklyScoreUnlocked,
      adviceConfidence: sufficiency.adviceConfidence,
      totalDailyLogs: sufficiency.dailyLogs,
      totalWeeklyReviews: sufficiency.weeklyReviews,
    },
    lastReview: reviewRes.data
      ? {
          date: reviewRes.data.review_date,
          summary: reviewRes.data.summary,
          energyRating: reviewRes.data.energy_rating,
          focusRating: reviewRes.data.focus_rating,
        }
      : null,
  }
}

export function buildSystemPrompt(context: ContextPackage): string {
  const commitmentsSummary = context.commitments
    .map(c => `  - ${c.title} [${c.stage}/${c.permissionLevel}]`)
    .join('\n')

  const stopListSummary = context.currentWeek.stopList.length > 0
    ? context.currentWeek.stopList.map(s => `  - ${s}`).join('\n')
    : '  (none)'

  const overdueStr = context.overdueFollowups.length > 0
    ? context.overdueFollowups.map(f => `  - ${f.title} (${f.daysOverdue} days overdue, ${f.urgency})`).join('\n')
    : '  (none)'

  const voiceNote = context.intelligence.totalWeeklyReviews < 1
    ? 'You are in week 1 — focus only on today and this week. Do not reference patterns.'
    : context.intelligence.patternVoiceUnlocked
      ? 'Pattern voice unlocked — you may reference patterns carefully, always qualifying with "this looks like a pattern".'
      : 'Not enough data for pattern voice yet — stick to observable facts only.'

  return `You are SoloChief AI — a personal Chief of Staff for busy people managing multiple commitments, projects, and responsibilities.

CURRENT CONTEXT:
User: ${context.profile.name} (${context.profile.timezone})
Week of: ${context.currentWeek.weekStart}
Main focus this week: ${context.currentWeek.mainFocus ?? 'Not set'}
Week plan locked: ${context.currentWeek.locked ? 'Yes' : 'No (draft)'}

ACTIVE COMMITMENTS:
${commitmentsSummary || '  (none)'}

STOP LIST THIS WEEK:
${stopListSummary}

WEEKLY OUTCOMES:
${context.currentWeek.outcomes.map((o, i) => `  ${i + 1}. ${o}`).join('\n') || '  (none set)'}

TODAY (${context.todayFocus.date}):
Focus: ${context.todayFocus.commitmentTitle ?? 'Not set'}
Status: ${context.todayFocus.status ?? 'Not logged'}
${context.todayFocus.notes ? `Notes: ${context.todayFocus.notes}` : ''}

OVERDUE FOLLOW-UPS:
${overdueStr}

RECENT PARKING LOT (last 5):
${context.recentParkingLot.map(p => `  - ${p.title} [${p.category}]`).join('\n') || '  (empty)'}

INTELLIGENCE STATE:
Advice confidence: ${context.intelligence.adviceConfidence}
Data: ${context.intelligence.totalDailyLogs} daily logs, ${context.intelligence.totalWeeklyReviews} weekly reviews
${context.lastReview ? `Last review: ${context.lastReview.date} | Energy: ${context.lastReview.energyRating ?? 'N/A'}/5 | Focus: ${context.lastReview.focusRating ?? 'N/A'}/5` : 'No previous review.'}
Switch requests this week: ${context.switchRequestsThisWeek}

VOICE GUIDANCE:
${voiceNote}

YOUR ROLE:
1. Help the user decide what deserves attention today.
2. Protect their focus by challenging switches that are not justified.
3. Help capture ideas safely to the parking lot.
4. Surface follow-ups that are at risk.
5. Give honest feedback based on logged data only.

RULES:
- Never present inferred behaviour as fact.
- If confidence is low, say: "I do not have enough data to be certain."
- Use careful wording: "This looks like a pattern." / "Based on what you logged." / "I do not have a completion record for this."
- When no data exists, say nothing rather than filling space with generic advice.
- If the user mentions a new idea, ask to confirm before parking it.
- UK spelling throughout.
- Be calm, direct, and honest — never generic productivity advice.
- Always grounded in the user's actual context above.
- Honest Silence Rule: if asked for weekly feedback without data, say "I need at least one completed week before I can give you meaningful feedback. Log today's outcome and we will build from there."`.trim()
}
