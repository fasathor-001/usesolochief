import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UpgradeSuccessToast } from '@/components/billing/UpgradeSuccessToast'
import { getWeekStart } from '@/lib/utils/date-utils'
import { getDataSufficiency } from '@/lib/intelligence/intelligence-service'
import { backfillAgentMdpStatesIfNeeded } from '@/lib/actions/mdp'
import { Archive, CheckCircle, Clock, RotateCcw } from 'lucide-react'
import { ContextPanel, ContextBlock } from '@/components/ui/solochief/ContextPanel'
import { PageHeader } from '@/components/ui/solochief/PageHeader'
import { MetricRow } from '@/components/ui/solochief/MetricRow'
import type { Commitment, WeeklyPlan, WeeklyOutcome, DailyLog, Followup, ParkingLotItem } from '@/types/database'

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysSince(dateStr: string): number {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 86400000)
}

function greetingLabel(name?: string): string {
  const h = new Date().getHours()
  const timeWord = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return name ? `Good ${timeWord}, ${name}.` : `Good ${timeWord}.`
}

function weekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export default async function CommandCentrePage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Backfill MDP states for users who completed onboarding before this fix
  await backfillAgentMdpStatesIfNeeded(user.id)

  const { upgraded } = await searchParams

  const weekStart = getWeekStart()
  const today = todayString()
  const weekNum = weekNumber(new Date())

  const [
    planRes,
    commitmentsRes,
    followupsRes,
    parkingRes,
    sufficiency,
    profileRes,
  ] = await Promise.all([
    supabase.from('weekly_plans').select('*').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle(),
    supabase.from('commitments').select('*').eq('user_id', user.id).is('deleted_at', null).order('priority'),
    supabase.from('followups').select('*').eq('user_id', user.id).is('deleted_at', null).not('status', 'in', '(completed,cancelled)').order('due_date'),
    supabase.from('parking_lot_items').select('*').eq('user_id', user.id).in('status', ['waiting', 'scheduled']).order('created_at', { ascending: false }),
    getDataSufficiency(),
    supabase.from('profiles').select('full_name, plan').eq('user_id', user.id).maybeSingle(),
  ])

  const plan = planRes.data as WeeklyPlan | null
  const commitments = (commitmentsRes.data ?? []) as Commitment[]
  const followups = (followupsRes.data ?? []) as Followup[]
  const parkingItems = (parkingRes.data ?? []) as ParkingLotItem[]
  const firstName =
    (profileRes.data as { full_name: string | null } | null)?.full_name?.split(' ')[0]
    ?? user.email?.split('@')[0]

  let focusCommitment: Commitment | null = null
  let todayLog: DailyLog | null = null
  let outcomes: WeeklyOutcome[] = []

  if (plan?.main_focus_commitment_id) {
    focusCommitment = commitments.find(c => c.id === plan.main_focus_commitment_id) ?? null
  }

  if (focusCommitment) {
    const { data: log } = await supabase
      .from('daily_logs').select('*')
      .eq('commitment_id', focusCommitment.id)
      .eq('log_date', today)
      .maybeSingle()
    todayLog = log as DailyLog ?? null
  }

  if (plan) {
    const { data: outcomesData } = await supabase
      .from('weekly_outcomes').select('*').eq('weekly_plan_id', plan.id)
    outcomes = (outcomesData ?? []) as WeeklyOutcome[]
  }

  const overdueFollowups = followups.filter(f => f.due_date && f.due_date < today)
  const dueToday = followups.filter(f => f.due_date === today)
  const outcomesComplete = outcomes.filter(o => o.achieved === true).length

  type AttentionItem = { dot: string; text: string; sub: string; href: string }
  const attentionItems: AttentionItem[] = []

  for (const f of overdueFollowups.slice(0, 3)) {
    const days = daysSince(f.due_date!)
    attentionItems.push({ dot: '#EF4444', text: f.title, sub: `${days}d overdue`, href: '/dashboard/follow-ups' })
  }

  for (const item of parkingItems.filter(p => daysSince(p.parked_at) > 14).slice(0, 2)) {
    attentionItems.push({ dot: '#F59E0B', text: item.title, sub: `${daysSince(item.parked_at)}d in parking lot`, href: '/dashboard/parking-lot' })
  }

  const staleLaunch = commitments
    .filter(c => c.stage === 'launch_checklist' && (!c.last_touched_at || daysSince(c.last_touched_at.split('T')[0]) > 7))
    .slice(0, 2)
  for (const c of staleLaunch) {
    attentionItems.push({ dot: '#8B5CF6', text: c.title, sub: 'No recent activity on launch checklist', href: '/dashboard/launch-checklists' })
  }

  const statusLabel: Record<string, string> = {
    in_progress: 'In progress', done: 'Done', partial: 'Partial', blocked: 'Blocked', slipped: 'Slipped',
  }

  return (
    <>
      {upgraded === 'true' && <UpgradeSuccessToast plan={profileRes.data?.plan ?? 'pro'} />}

      {/* Main content */}
      <div className="sc-content sc-page-container">

        <PageHeader
          title={greetingLabel(firstName)}
          subtitle={plan
            ? `Week ${weekNum} is active. Here is what needs attention today.`
            : 'No weekly plan set. Start by defining your focus for the week.'}
        />

        {/* Two-column layout */}
        <div className="sc-grid-main">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="sc-grid-col">

            {/* No plan CTA */}
            {!plan && (
              <Link
                href="/dashboard/weekly-plan"
                className="sc-card sc-plan-cta"
                style={{ display: 'block', marginBottom: 20, textDecoration: 'none' }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)' }}>Set this week&apos;s plan →</p>
                <p style={{ fontSize: 12, color: 'var(--sc-text-2)', marginTop: 4 }}>
                  Define your focus commitment and three outcomes for the week.
                </p>
              </Link>
            )}

            {/* Today's focus */}
            <div
              className="sc-focus-card"
              style={{ marginBottom: 14 }}
            >
              <p className="sc-card-label" style={{ color: 'var(--sc-teal)' }}>Today&apos;s focus</p>
              {focusCommitment ? (
                <>
                  <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--sc-text)', letterSpacing: '-0.1px', lineHeight: 1.3, marginBottom: 8 }}>
                    {focusCommitment.title}
                  </p>
                  {todayLog?.notes ? (
                    <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 8 }}>
                      {todayLog.notes}
                    </p>
                  ) : (
                    <Link
                      href="/dashboard/today"
                      style={{ fontSize: 12, color: 'var(--sc-teal)', display: 'block', marginBottom: 8 }}
                    >
                      Set today&apos;s outcome →
                    </Link>
                  )}
                  {todayLog && (
                    <span
                      className="sc-badge"
                      style={{
                        backgroundColor: todayLog.status === 'done' ? 'var(--sc-teal-10)' : 'rgba(59,130,246,0.10)',
                        color: todayLog.status === 'done' ? '#007a6b' : '#185FA5',
                      }}
                    >
                      {statusLabel[todayLog.status] ?? todayLog.status}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 12 }}>
                    Start here. What is the one thing that matters today?
                  </p>
                  <Link
                    href="/dashboard/today"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--sc-teal)',
                      display: 'inline-block',
                    }}
                  >
                    Set your focus →
                  </Link>
                </>
              )}
            </div>

            {/* Needs attention */}
            <div className="sc-card" style={{ marginBottom: 14 }}>
              <p
                className="sc-card-label"
                style={{ color: attentionItems.length > 0 ? '#F59E0B' : 'var(--sc-muted)' }}
              >
                Needs attention
              </p>
              {attentionItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                  {attentionItems.slice(0, 5).map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      style={{
                        display: 'block',
                        padding: '7px 10px',
                        borderRadius: 6,
                        borderLeft: `3px solid ${item.dot}`,
                        backgroundColor: 'var(--sc-bg)',
                        textDecoration: 'none',
                      }}
                    >
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--sc-text)', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {item.text}
                      </p>
                      <p className="sc-meta">{item.sub}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 4 }}>
                  <p style={{ fontSize: 13, color: 'var(--sc-teal)', fontWeight: 500 }}>All clear.</p>
                  <p className="sc-meta" style={{ marginTop: 2 }}>Everything is on track.</p>
                </div>
              )}
            </div>

            {/* Commitments empty state */}
            {commitments.length === 0 && (
              <div className="sc-card" style={{ marginBottom: 14 }}>
                <p className="sc-card-label" style={{ color: 'var(--sc-teal)' }}>Commitments</p>
                <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 12 }}>
                  What have you said yes to this week?
                </p>
                <Link
                  href="/dashboard/commitments"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--sc-teal)',
                    display: 'inline-block',
                  }}
                >
                  Add a commitment →
                </Link>
              </div>
            )}

            {/* Follow-ups empty state */}
            {followups.length === 0 && (
              <div className="sc-card" style={{ marginBottom: 14 }}>
                <p className="sc-card-label" style={{ color: 'var(--sc-teal)' }}>Follow-ups</p>
                <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 12 }}>
                  Anyone waiting on you?
                </p>
                <Link
                  href="/dashboard/follow-ups"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--sc-teal)',
                    display: 'inline-block',
                  }}
                >
                  Add a follow-up →
                </Link>
              </div>
            )}

            {/* Quick actions */}
            <div style={{ marginBottom: 14 }}>
              <p className="sc-section-label" style={{ marginTop: 0 }}>Quick actions</p>
              <div className="sc-quick-grid">
                {[
                  { label: 'Park an idea', href: '/dashboard/parking-lot', Icon: Archive },
                  { label: 'Add follow-up', href: '/dashboard/follow-ups', Icon: Clock },
                  { label: 'Log today', href: '/dashboard/today', Icon: CheckCircle },
                  { label: 'Start review', href: '/dashboard/review', Icon: RotateCcw },
                ].map(({ label, href, Icon }) => (
                  <Link key={label} href={href} className="sc-quick-action">
                    <Icon />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Progressive disclosure */}
            {sufficiency.weeklyScoreUnlocked && (
              <div
                className="sc-card"
                style={{ borderColor: 'rgba(0,194,168,0.2)', backgroundColor: 'rgba(0,194,168,0.03)' }}
              >
                <p className="sc-card-label" style={{ color: 'var(--sc-teal)' }}>Weekly score unlocked</p>
                <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 8 }}>
                  Complete this week&apos;s Friday Review to see your weekly score.
                </p>
                <Link href="/dashboard/review" style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-teal)' }}>
                  Go to Friday Review →
                </Link>
              </div>
            )}
          </div>

          {/* ── Right column — context panel ────────────────── */}
          <ContextPanel>
            {/* Week at a glance — only show if user has started tracking */}
            {(outcomes.length > 0 || followups.length > 0 || parkingItems.length > 0) && (
              <ContextBlock title="Week at a glance">
                <MetricRow
                  label="Outcomes"
                  value={`${outcomesComplete} / ${outcomes.length || 3}`}
                />
                <MetricRow
                  label="Overdue"
                  value={overdueFollowups.length}
                  variant={overdueFollowups.length > 0 ? 'danger' : 'default'}
                />
                <MetricRow
                  label="Due today"
                  value={dueToday.length}
                />
                <MetricRow
                  label="Parked"
                  value={parkingItems.length}
                />
              </ContextBlock>
            )}

            {/* This week outcomes */}
            {outcomes.length > 0 && (
              <ContextBlock title="This week">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {outcomes.slice(0, 3).map((o) => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle
                        size={13}
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          color: o.achieved ? 'var(--sc-teal)' : 'var(--sc-border)',
                        }}
                      />
                      <span style={{ fontSize: 12, color: o.achieved ? 'var(--sc-muted)' : 'var(--sc-text-2)', lineHeight: 1.4 }}>
                        {o.description}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: 12 }}>
                  <div className="sc-progress-bar">
                    <div
                      className="sc-progress-fill"
                      style={{ width: `${outcomes.length ? (outcomesComplete / outcomes.length) * 100 : 0}%` }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 5 }}>
                    {outcomesComplete} of {outcomes.length} complete
                  </p>
                </div>
              </ContextBlock>
            )}

            {/* Commitments summary */}
            <ContextBlock title="Commitments">
              <MetricRow
                label="Active"
                value={commitments.filter(c => c.stage === 'active').length}
              />
              <MetricRow
                label="Launch checklists"
                value={commitments.filter(c => c.stage === 'launch_checklist').length}
              />
              <MetricRow
                label="Total"
                value={commitments.length}
              />
            </ContextBlock>
          </ContextPanel>

        </div>
      </div>
    </>
  )
}
