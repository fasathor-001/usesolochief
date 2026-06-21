'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Circle, AlertCircle, RefreshCw, Plus, X } from 'lucide-react'
import { upsertDailyLog, addNotTodayItem, completeFollowup } from '@/lib/actions/today'
import { SwitchChallengeModal } from '@/components/today/switch-challenge-modal'
import type {
  Commitment, DailyLog, DailyLogStatus, NotTodayItem, Followup, StopListItem, WeeklyPlan,
} from '@/types/database'

interface TodayClientProps {
  plan: WeeklyPlan | null
  focusCommitment: Commitment | null
  todayLog: DailyLog | null
  notTodayItems: NotTodayItem[]
  followupsDue: Followup[]
  stopItems: StopListItem[]
  allCommitments: Commitment[]
}

const STATUS_OPTIONS: { value: DailyLogStatus; label: string; colour: string }[] = [
  { value: 'in_progress', label: 'In progress', colour: '#3B82F6' },
  { value: 'done', label: 'Done', colour: '#00C2A8' },
  { value: 'partial', label: 'Partial', colour: '#F59E0B' },
  { value: 'blocked', label: 'Blocked', colour: '#EF4444' },
  { value: 'slipped', label: 'Slipped', colour: '#64748B' },
]

function todayLabel(): string {
  const now = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const today = new Date()
  const due = new Date(dueDate + 'T12:00:00Z')
  return due < new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

export function TodayClient({
  plan,
  focusCommitment,
  todayLog: initialLog,
  notTodayItems: initialNotToday,
  followupsDue: initialFollowups,
  stopItems,
  allCommitments,
}: TodayClientProps) {
  const [log, setLog] = useState<DailyLog | null>(initialLog)
  const [outcome, setOutcome] = useState(initialLog?.notes ?? '')
  const [status, setStatus] = useState<DailyLogStatus>(initialLog?.status ?? 'in_progress')
  const [notTodayItems, setNotTodayItems] = useState<NotTodayItem[]>(initialNotToday)
  const [followups, setFollowups] = useState<Followup[]>(initialFollowups)
  const [newNotToday, setNewNotToday] = useState('')
  const [switchTarget, setSwitchTarget] = useState<Commitment | null>(null)
  const [showSwitch, setShowSwitch] = useState(false)

  const [isLogging, startLog] = useTransition()
  const [isAddingNotToday, startAddNotToday] = useTransition()
  const [isCompletingFollowup, startCompleteFollowup] = useTransition()

  function handleLogEOD() {
    if (!focusCommitment) return
    startLog(async () => {
      const { data, error } = await upsertDailyLog({
        commitmentId: focusCommitment.id,
        status,
        notes: outcome || undefined,
      })
      if (error) { toast.error(error); return }
      setLog(data)
      toast.success('Day logged')
    })
  }

  function handleAddNotToday() {
    const desc = newNotToday.trim()
    if (!desc) return
    startAddNotToday(async () => {
      const { data, error } = await addNotTodayItem(desc)
      if (error) { toast.error(error); return }
      if (data) setNotTodayItems((prev) => [...prev, data])
      setNewNotToday('')
    })
  }

  function handleCompleteFollowup(id: string) {
    startCompleteFollowup(async () => {
      const { error } = await completeFollowup(id)
      if (error) { toast.error(error); return }
      setFollowups((prev) => prev.filter((f) => f.id !== id))
      toast.success('Follow-up marked complete')
    })
  }

  function openSwitchChallenge(target: Commitment) {
    setSwitchTarget(target)
    setShowSwitch(true)
  }

  const otherCommitments = allCommitments.filter(
    (c) => c.id !== focusCommitment?.id && !c.deleted_at && c.stage !== 'parked'
  )

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--sc-text)' }}>
          Today Focus
        </h1>
        <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>
          {todayLabel()}
        </p>
      </div>

      <div className="space-y-8">
        {/* Main Focus Card */}
        <section>
          {!focusCommitment ? (
            <div
              className="p-6 rounded-xl border text-center"
              style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--sc-text)' }}>
                No focus set for this week
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--sc-muted)' }}>
                Set your main focus on the Weekly Plan page.
              </p>
              <a
                href="/dashboard/weekly-plan"
                className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
              >
                Go to Weekly Plan
              </a>
            </div>
          ) : (
            <div
              className="p-5 rounded-xl border"
              style={{ borderColor: 'rgba(0,194,168,0.3)', backgroundColor: 'var(--sc-surface)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--sc-accent)' }}>
                    Today&apos;s Focus
                  </p>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--sc-text)' }}>
                    {focusCommitment.title}
                  </h2>
                  {focusCommitment.next_action && (
                    <p className="text-sm mt-1" style={{ color: 'var(--sc-muted)' }}>
                      Next: {focusCommitment.next_action}
                    </p>
                  )}
                </div>
                {log && (
                  <span
                    className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: log.status === 'done' ? 'rgba(0,194,168,0.12)' : 'rgba(59,130,246,0.12)',
                      color: log.status === 'done' ? 'var(--sc-accent)' : '#3B82F6',
                    }}
                  >
                    {log.status.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Outcome */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                  Today&apos;s one outcome
                </label>
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What will be done by end of day?"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{
                    borderColor: 'var(--sc-border)',
                    backgroundColor: 'var(--sc-background)',
                    color: 'var(--sc-text)',
                  }}
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                      style={{
                        borderColor: status === opt.value ? opt.colour : 'var(--sc-border)',
                        backgroundColor: status === opt.value ? `${opt.colour}20` : 'transparent',
                        color: status === opt.value ? opt.colour : 'var(--sc-muted)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogEOD}
                  disabled={isLogging}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
                >
                  {isLogging ? 'Logging...' : log ? 'Update Log' : 'Log Day'}
                </button>
                {otherCommitments.length > 0 && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors"
                      style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
                    >
                      <RefreshCw size={13} />
                      Request Switch
                    </button>
                    <div
                      className="absolute top-full left-0 mt-1 w-56 rounded-lg border shadow-lg z-20 hidden group-focus-within:block group-hover:block"
                      style={{ backgroundColor: 'var(--sc-surface)', borderColor: 'var(--sc-border)' }}
                    >
                      {otherCommitments.slice(0, 6).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => openSwitchChallenge(c)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--sc-border)] first:rounded-t-lg last:rounded-b-lg transition-colors"
                          style={{ color: 'var(--sc-text)' }}
                        >
                          {c.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Not Today */}
        <section>
          <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
            Not today
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--sc-muted)' }}>
            Stop list and commitments blocked for today.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {stopItems.map((item) => (
              <span
                key={item.id}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--sc-surface)',
                  border: '1px solid var(--sc-border)',
                  color: 'var(--sc-muted)',
                  textDecoration: 'line-through',
                }}
              >
                {item.description}
              </span>
            ))}
            {notTodayItems.map((item) => (
              <span
                key={item.id}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#EF4444',
                }}
              >
                {item.description}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNotToday}
              onChange={(e) => setNewNotToday(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddNotToday() }}
              placeholder="Block something for today..."
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                borderColor: 'var(--sc-border)',
                backgroundColor: 'var(--sc-surface)',
                color: 'var(--sc-text)',
              }}
            />
            <button
              type="button"
              onClick={handleAddNotToday}
              disabled={isAddingNotToday}
              className="px-3 py-2 rounded-lg border text-sm transition-colors"
              style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </section>

        {/* Follow-ups Due */}
        {followups.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
              Follow-ups due
            </h2>
            <div className="space-y-2">
              {followups.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{
                    borderColor: isOverdue(f.due_date) ? 'rgba(239,68,68,0.3)' : 'var(--sc-border)',
                    backgroundColor: 'var(--sc-surface)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleCompleteFollowup(f.id)}
                    disabled={isCompletingFollowup}
                    className="shrink-0 transition-colors hover:opacity-70"
                    style={{ color: 'var(--sc-border)' }}
                  >
                    <Circle size={16} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--sc-text)' }}>{f.title}</p>
                    {f.due_date && (
                      <p className="text-xs" style={{ color: isOverdue(f.due_date) ? '#EF4444' : 'var(--sc-muted)' }}>
                        {isOverdue(f.due_date) ? 'Overdue — ' : 'Due '}
                        {f.due_date}
                      </p>
                    )}
                  </div>
                  {isOverdue(f.due_date) && (
                    <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No plan state */}
        {!plan && (
          <div
            className="p-4 rounded-xl border"
            style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
          >
            <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>
              No weekly plan found. Start your week on{' '}
              <a href="/dashboard/weekly-plan" style={{ color: 'var(--sc-accent)' }}>
                Monday Command Centre
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* Switch Challenge Modal */}
      {focusCommitment && switchTarget && (
        <SwitchChallengeModal
          open={showSwitch}
          onOpenChange={setShowSwitch}
          fromCommitment={focusCommitment}
          toCommitment={switchTarget}
          onApproved={() => {
            toast.success(`Switched to ${switchTarget.title}`)
            setSwitchTarget(null)
          }}
        />
      )}
    </div>
  )
}
