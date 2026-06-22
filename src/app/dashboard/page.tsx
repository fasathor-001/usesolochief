import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWeekStart } from '@/lib/utils/date-utils'
import { getDataSufficiency } from '@/lib/intelligence/intelligence-service'
import { Archive, CheckCircle, Clock, LayoutDashboard, RotateCcw } from 'lucide-react'
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

export default async function CommandCentrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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
    supabase.from('profiles').select('full_name').eq('user_id', user.id).maybeSingle(),
  ])

  const plan = planRes.data as WeeklyPlan | null
  const commitments = (commitmentsRes.data ?? []) as Commitment[]
  const followups = (followupsRes.data ?? []) as Followup[]
  const parkingItems = (parkingRes.data ?? []) as ParkingLotItem[]
  const firstName = (profileRes.data as { full_name: string | null } | null)?.full_name?.split(' ')[0]

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

  // Attention items
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
      {/* Topbar */}
      <div className="sc-topbar">
        <div className="sc-topbar-left">
          <span className="sc-topbar-title">Command Centre</span>
          <span className="sc-topbar-sub">
            {plan ? `Week ${weekNum} is active.` : `Week ${weekNum} — no plan set.`}
          </span>
        </div>
        <div className="sc-topbar-actions">
          <LayoutDashboard size={16} style={{ color: 'var(--sc-muted)' }} />
        </div>
      </div>

      {/* Content */}
      <div className="sc-content sc-content-narrow">
        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="sc-page-title">{greetingLabel(firstName)}</h1>
          <p className="sc-page-subtitle">
            {plan
              ? `Week ${weekNum} is active. Here is what needs attention today.`
              : 'No weekly plan set. Start by defining your focus for the week.'}
          </p>
        </div>

        {/* No plan CTA */}
        {!plan && (
          <Link
            href="/dashboard/weekly-plan"
            className="sc-card"
            style={{
              display: 'block',
              borderColor: 'rgba(0,194,168,0.3)',
              backgroundColor: 'rgba(0,194,168,0.04)',
              marginBottom: 20,
              textDecoration: 'none',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-teal)' }}>Set this week&apos;s plan →</p>
            <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 3 }}>
              Define your focus commitment and three outcomes for the week.
            </p>
          </Link>
        )}

        {/* Three-card row: Today's Focus + This Week + Needs Attention */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {/* Today's Focus */}
          <div className="sc-card">
            <p className="sc-card-label">Today&apos;s focus</p>
            {focusCommitment ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--sc-text)', letterSpacing: '-0.1px', lineHeight: 1.3, marginBottom: 6 }}>
                  {focusCommitment.title}
                </p>
                {todayLog?.notes ? (
                  <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 10 }}>
                    {todayLog.notes}
                  </p>
                ) : (
                  <Link
                    href="/dashboard/today"
                    style={{ fontSize: 12, color: 'var(--sc-teal)', display: 'block', marginBottom: 10 }}
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
              <Link href="/dashboard/weekly-plan" style={{ fontSize: 13, color: 'var(--sc-teal)' }}>
                No focus set — set one now →
              </Link>
            )}
          </div>

          {/* This Week */}
          <div className="sc-card">
            <p className="sc-card-label">This week</p>
            {outcomes.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {outcomes.slice(0, 3).map((o) => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle
                        size={14}
                        style={{
                          flexShrink: 0,
                          marginTop: 1,
                          color: o.achieved ? 'var(--sc-teal)' : 'var(--sc-border)',
                        }}
                      />
                      <span style={{ fontSize: 12, color: o.achieved ? 'var(--sc-muted)' : 'var(--sc-text)', lineHeight: 1.4 }}>
                        {o.description}
                      </span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 12 }}>
                  {outcomesComplete} of {outcomes.length} outcomes complete
                </p>
              </>
            ) : (
              <Link href="/dashboard/weekly-plan" style={{ fontSize: 13, color: 'var(--sc-teal)' }}>
                No outcomes set →
              </Link>
            )}
          </div>

          {/* Needs Attention */}
          <div className="sc-card">
            <p className="sc-card-label" style={{ color: attentionItems.length > 0 ? '#F59E0B' : 'var(--sc-muted)' }}>
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
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 13, color: 'var(--sc-teal)', fontWeight: 500 }}>All clear.</p>
                <p className="sc-meta" style={{ marginTop: 2 }}>Everything is on track.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="sc-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 28 }}>
          <div className="sc-stat">
            <p className="sc-stat-value">{outcomesComplete}/{outcomes.length || 3}</p>
            <p className="sc-stat-label">outcomes</p>
          </div>
          <div className="sc-stat">
            <p className={`sc-stat-value${overdueFollowups.length > 0 ? ' danger' : ''}`}>
              {overdueFollowups.length}
            </p>
            <p className="sc-stat-label">overdue</p>
          </div>
          <div className="sc-stat">
            <p className="sc-stat-value">{dueToday.length}</p>
            <p className="sc-stat-label">due today</p>
          </div>
          <div className="sc-stat">
            <p className="sc-stat-value">{parkingItems.length}</p>
            <p className="sc-stat-label">parked</p>
          </div>
        </div>

        {/* Quick actions */}
        <div>
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
            style={{ borderColor: 'rgba(0,194,168,0.2)', backgroundColor: 'rgba(0,194,168,0.03)', marginTop: 20 }}
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
    </>
  )
}
