import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWeekStart } from '@/lib/utils/date-utils'
import { getDataSufficiency } from '@/lib/intelligence/intelligence-service'
import { AlertCircle, Archive, CheckCircle, Clock } from 'lucide-react'
import type { Commitment, WeeklyPlan, WeeklyOutcome, DailyLog, Followup, ParkingLotItem } from '@/types/database'

type AttentionItem = {
  type: string
  title: string
  detail: string
  href: string
  colour: string
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00Z')
  return Math.floor((new Date().getTime() - d.getTime()) / 86400000)
}

function greetingLabel(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function CommandCentrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const weekStart = getWeekStart()
  const today = todayString()

  const [
    profileRes,
    planRes,
    commitmentsRes,
    followupsRes,
    parkingRes,
    sufficiency,
  ] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('user_id', user.id).maybeSingle(),
    supabase.from('weekly_plans').select('*').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
    supabase.from('commitments').select('*').eq('user_id', user.id).is('deleted_at', null).order('priority'),
    supabase.from('followups').select('*').eq('user_id', user.id).is('deleted_at', null).not('status', 'in', '(completed,cancelled)').order('due_date'),
    supabase.from('parking_lot_items').select('*').eq('user_id', user.id).in('status', ['waiting', 'scheduled']).order('created_at', { ascending: false }),
    getDataSufficiency(),
  ])

  const plan = planRes.data as WeeklyPlan | null
  const commitments = (commitmentsRes.data ?? []) as Commitment[]
  const followups = (followupsRes.data ?? []) as Followup[]
  const parkingItems = (parkingRes.data ?? []) as ParkingLotItem[]
  const firstName = profileRes.data?.full_name?.split(' ')[0] ?? ''

  let focusCommitment: Commitment | null = null
  let todayLog: DailyLog | null = null
  let outcomes: WeeklyOutcome[] = []

  if (plan?.main_focus_commitment_id) {
    focusCommitment = commitments.find(c => c.id === plan.main_focus_commitment_id) ?? null
  }

  if (focusCommitment) {
    const { data: log } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('commitment_id', focusCommitment.id)
      .eq('log_date', today)
      .maybeSingle()
    todayLog = log as DailyLog ?? null
  }

  if (plan) {
    const { data: outcomesData } = await supabase
      .from('weekly_outcomes')
      .select('*')
      .eq('weekly_plan_id', plan.id)
    outcomes = (outcomesData ?? []) as WeeklyOutcome[]
  }

  const outcomesComplete = outcomes.filter(o => o.achieved === true).length
  const overdueFollowups = followups.filter(f => f.due_date && f.due_date < today)
  const weekEndDate = (() => {
    const d = new Date(weekStart + 'T12:00:00Z')
    d.setUTCDate(d.getUTCDate() + 6)
    return d.toISOString().split('T')[0]
  })()
  const followupsDueThisWeek = followups.filter(f => f.due_date && f.due_date >= today && f.due_date <= weekEndDate)

  // Build attention items
  const attentionItems: AttentionItem[] = []

  for (const f of overdueFollowups.slice(0, 3)) {
    const days = daysSince(f.due_date!)
    attentionItems.push({
      type: 'overdue_followup',
      title: f.title,
      detail: `${days}d overdue`,
      href: '/dashboard/follow-ups',
      colour: '#EF4444',
    })
  }

  // Parking lot items older than 14 days
  for (const item of parkingItems.filter(p => daysSince(p.parked_at) > 14).slice(0, 2)) {
    attentionItems.push({
      type: 'old_parking',
      title: item.title,
      detail: `${daysSince(item.parked_at)}d in parking lot`,
      href: '/dashboard/parking-lot',
      colour: '#F59E0B',
    })
  }

  // Launch checklist commitments with no recent activity
  const staleLaunch = commitments
    .filter(c => c.stage === 'launch_checklist' && (!c.last_touched_at || daysSince(c.last_touched_at.split('T')[0]) > 7))
    .slice(0, 2)
  for (const c of staleLaunch) {
    attentionItems.push({
      type: 'inactive_checklist',
      title: c.title,
      detail: 'No recent activity on launch checklist',
      href: '/dashboard/launch-checklists',
      colour: '#8B5CF6',
    })
  }

  const noPlan = !plan
  const noFocus = !focusCommitment

  return (
    <div className="p-6 max-w-2xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--sc-text)' }}>
          {greetingLabel()}{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>Command Centre</p>
      </div>

      {/* No plan CTA */}
      {noPlan && (
        <Link
          href="/dashboard/weekly-plan"
          className="block p-4 rounded-xl mb-6 border transition-all hover:border-[var(--sc-accent)]"
          style={{ borderColor: 'rgba(0,194,168,0.3)', backgroundColor: 'rgba(0,194,168,0.06)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--sc-accent)' }}>
            Set this week&apos;s plan →
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--sc-muted)' }}>
            No weekly plan found. Start with your focus and 3 outcomes.
          </p>
        </Link>
      )}

      <div className="space-y-6">
        {/* Section 1 — Today's snapshot */}
        <section
          className="p-5 rounded-xl border"
          style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--sc-muted)' }}>
            TODAY
          </p>
          {noFocus ? (
            <Link
              href="/dashboard/weekly-plan"
              className="text-sm font-medium"
              style={{ color: 'var(--sc-accent)' }}
            >
              What is today&apos;s focus? →
            </Link>
          ) : (
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--sc-text)' }}>
                {focusCommitment!.title}{' '}is today&apos;s focus
              </p>
              {todayLog?.notes ? (
                <p className="text-xs mb-2" style={{ color: 'var(--sc-muted)' }}>
                  One outcome: {todayLog.notes}
                </p>
              ) : (
                <Link
                  href="/dashboard/today"
                  className="text-xs"
                  style={{ color: 'var(--sc-accent)' }}
                >
                  Set today&apos;s outcome →
                </Link>
              )}
              {todayLog && (
                <span
                  className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: todayLog.status === 'done' ? 'rgba(0,194,168,0.12)' : 'rgba(59,130,246,0.12)',
                    color: todayLog.status === 'done' ? 'var(--sc-accent)' : '#3B82F6',
                  }}
                >
                  {todayLog.status.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Section 2 — This week at a glance */}
        <section
          className="p-5 rounded-xl border"
          style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--sc-muted)' }}>
            THIS WEEK
          </p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            <Stat label="outcomes complete" value={`${outcomesComplete} / ${outcomes.length || 3}`} />
            <Stat label="follow-ups due" value={String(followupsDueThisWeek.length)} />
            <Stat
              label="overdue"
              value={String(overdueFollowups.length)}
              colour={overdueFollowups.length > 0 ? '#EF4444' : undefined}
            />
            <Stat label="ideas parked" value={String(parkingItems.length)} />
          </div>
        </section>

        {/* Section 3 — Needs attention */}
        {attentionItems.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--sc-muted)' }}>
              NEEDS ATTENTION
            </p>
            <div className="space-y-2">
              {attentionItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-[var(--sc-accent)]"
                  style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', textDecoration: 'none' }}
                >
                  <AlertCircle size={14} style={{ color: item.colour, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--sc-text)' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: 'var(--sc-muted)' }}>{item.detail}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 4 — Quick actions */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--sc-muted)' }}>
            QUICK ACTIONS
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Park an idea', href: '/dashboard/parking-lot', Icon: Archive },
              { label: 'Add follow-up', href: '/dashboard/follow-ups', Icon: Clock },
              { label: 'Log today', href: '/dashboard/today', Icon: CheckCircle },
              { label: 'Start review', href: '/dashboard/review', Icon: CheckCircle },
            ].map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:border-[var(--sc-accent)]"
                style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-text)', textDecoration: 'none', backgroundColor: 'var(--sc-surface)' }}
              >
                <Icon size={14} style={{ color: 'var(--sc-accent)' }} />
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* Progressive disclosure: weekly score card */}
        {sufficiency.weeklyScoreUnlocked && (
          <section
            className="p-5 rounded-xl border"
            style={{ borderColor: 'rgba(0,194,168,0.2)', backgroundColor: 'rgba(0,194,168,0.04)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--sc-accent)' }}>
              WEEKLY SCORE UNLOCKED
            </p>
            <p className="text-xs" style={{ color: 'var(--sc-muted)' }}>
              Complete this week&apos;s Friday Review to see your weekly score.
            </p>
            <Link
              href="/dashboard/review"
              className="text-xs font-medium mt-1 block"
              style={{ color: 'var(--sc-accent)' }}
            >
              Go to Friday Review →
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div>
      <span className="text-lg font-bold" style={{ color: colour ?? 'var(--sc-text)' }}>{value}</span>
      <span className="text-xs ml-1.5" style={{ color: 'var(--sc-muted)' }}>{label}</span>
    </div>
  )
}
