'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Circle, AlertCircle, RefreshCw, Plus, X, Target } from 'lucide-react'
import { upsertDailyLog, addNotTodayItem, removeNotTodayItem, completeFollowup } from '@/lib/actions/today'
import { SwitchChallengeModal } from '@/components/today/switch-challenge-modal'
import { ContextPanel, ContextBlock } from '@/components/ui/solochief/ContextPanel'
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
  { value: 'done',        label: 'Done',        colour: '#00C2A8' },
  { value: 'partial',     label: 'Partial',     colour: '#F59E0B' },
  { value: 'blocked',     label: 'Blocked',     colour: '#EF4444' },
  { value: 'slipped',     label: 'Slipped',     colour: '#64748B' },
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
  const [isRemovingNotToday, startRemoveNotToday] = useTransition()
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

  function handleRemoveNotToday(id: string) {
    startRemoveNotToday(async () => {
      const { error } = await removeNotTodayItem(id)
      if (error) { toast.error(error); return }
      setNotTodayItems((prev) => prev.filter((item) => item.id !== id))
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
    <>
      {/* Topbar */}
      <div className="sc-topbar">
        <div className="sc-topbar-left">
          <span className="sc-topbar-title">Today</span>
          <span className="sc-topbar-sub">{todayLabel()}</span>
        </div>
        <div className="sc-topbar-actions">
          <Target size={16} style={{ color: 'var(--sc-muted)' }} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="sc-content">
        <div className="sc-grid-main">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="sc-grid-col">

            {/* No plan notice */}
            {!plan && (
              <div className="sc-card" style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>
                  No weekly plan found. Start your week on{' '}
                  <a href="/dashboard/weekly-plan" style={{ color: 'var(--sc-teal)' }}>
                    the weekly plan page
                  </a>
                  .
                </p>
              </div>
            )}

            {/* Main focus card */}
            {!focusCommitment ? (
              <div className="sc-card" style={{ marginBottom: 16, textAlign: 'center', padding: '40px 20px' }}>
                <p className="sc-section-label" style={{ marginTop: 0 }}>No focus set for this week</p>
                <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 16 }}>
                  Set your main focus on the weekly plan page.
                </p>
                <a
                  href="/dashboard/weekly-plan"
                  className="sc-btn sc-btn-primary"
                  style={{ display: 'inline-flex' }}
                >
                  Go to weekly plan
                </a>
              </div>
            ) : (
              <div
                className="sc-focus-card"
                style={{ marginBottom: 16 }}
              >
                {/* Focus header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <p
                      className="sc-card-label"
                      style={{ color: 'var(--sc-teal)', marginBottom: 6 }}
                    >
                      TODAY&apos;S FOCUS
                    </p>
                    <h2 className="sc-focus-title">
                      {focusCommitment.title}
                    </h2>
                    {focusCommitment.next_action && (
                      <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 3 }}>
                        → {focusCommitment.next_action}
                      </p>
                    )}
                  </div>
                  {log && (
                    <span
                      className="sc-badge"
                      style={{
                        flexShrink: 0,
                        backgroundColor: log.status === 'done' ? 'var(--sc-teal-10)' : 'rgba(59,130,246,0.10)',
                        color: log.status === 'done' ? '#007a6b' : '#185FA5',
                      }}
                    >
                      {log.status.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <hr style={{ border: 'none', borderTop: '0.5px solid var(--sc-border)', margin: '0 0 14px 0' }} />

                {/* Outcome input */}
                <div className="sc-field">
                  <label className="sc-label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Today&apos;s one outcome
                  </label>
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="What will be done by end of day?"
                    className="sc-input"
                    style={{ fontSize: 15, padding: '10px 12px' }}
                  />
                </div>

                {/* Status pills */}
                <div style={{ marginBottom: 16 }}>
                  <p className="sc-label">Status</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className="sc-badge"
                        style={{
                          cursor: 'pointer',
                          border: `0.5px solid ${status === opt.value ? opt.colour : 'var(--sc-border)'}`,
                          backgroundColor: status === opt.value ? `${opt.colour}1A` : 'transparent',
                          color: status === opt.value ? opt.colour : 'var(--sc-muted)',
                          padding: '5px 12px',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleLogEOD}
                    disabled={isLogging}
                    className="sc-btn sc-btn-primary"
                  >
                    {isLogging ? 'Logging...' : log ? 'Update log' : 'Log day'}
                  </button>
                  {otherCommitments.length > 0 && (
                    <div style={{ position: 'relative' }} className="group">
                      <button
                        type="button"
                        className="sc-btn sc-btn-ghost"
                      >
                        <RefreshCw size={13} />
                        Request switch
                      </button>
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: 4,
                          width: 220,
                          borderRadius: 'var(--sc-r)',
                          border: '0.5px solid var(--sc-border)',
                          backgroundColor: 'var(--sc-surface)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          zIndex: 20,
                        }}
                        className="hidden group-focus-within:block group-hover:block"
                      >
                        {otherCommitments.slice(0, 6).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => openSwitchChallenge(c)}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              fontSize: 13,
                              color: 'var(--sc-text)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            className="hover:bg-[var(--sc-bg)]"
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

            {/* Not today */}
            <div className="sc-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <p className="sc-section-heading" style={{ marginBottom: 0 }}>NOT TODAY</p>
                {(notTodayItems.length + stopItems.length) > 0 && (
                  <span
                    className="sc-badge"
                    style={{ fontSize: 10, padding: '2px 7px', backgroundColor: 'var(--sc-bg)', color: 'var(--sc-muted)' }}
                  >
                    {notTodayItems.length + stopItems.length}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 10 }}>
                These commitments and items are blocked for today.
              </p>

              {(stopItems.length > 0 || notTodayItems.length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {stopItems.map((item) => (
                    <span
                      key={item.id}
                      className="sc-badge sc-badge-slate"
                      style={{ textDecoration: 'line-through' }}
                    >
                      {item.description}
                    </span>
                  ))}
                  {notTodayItems.map((item) => (
                    <span
                      key={item.id}
                      className="sc-badge"
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.08)',
                        border: '0.5px solid rgba(239,68,68,0.2)',
                        color: '#EF4444',
                      }}
                    >
                      {item.description}
                      <button
                        type="button"
                        onClick={() => handleRemoveNotToday(item.id)}
                        disabled={isRemovingNotToday}
                        aria-label={`Remove ${item.description}`}
                        style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.7, lineHeight: 0 }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={newNotToday}
                  onChange={(e) => setNewNotToday(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddNotToday() }}
                  placeholder="Block something for today..."
                  className="sc-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddNotToday}
                  disabled={isAddingNotToday}
                  className="sc-btn sc-btn-ghost sc-btn-icon"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Follow-ups due */}
            {followups.length > 0 && (
              <div className="sc-card">
                <p className="sc-section-heading">FOLLOW-UPS DUE TODAY</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {followups.map((f) => (
                    <div
                      key={f.id}
                      className={`sc-followup-card${isOverdue(f.due_date) ? ' overdue' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleCompleteFollowup(f.id)}
                        disabled={isCompletingFollowup}
                        style={{ color: 'var(--sc-border)', flexShrink: 0, cursor: 'pointer', background: 'none', border: 'none', lineHeight: 0 }}
                      >
                        <Circle size={15} />
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: 'var(--sc-text)' }}>{f.title}</p>
                        {f.due_date && (
                          <p style={{ fontSize: 11, color: isOverdue(f.due_date) ? '#EF4444' : 'var(--sc-muted)' }}>
                            {isOverdue(f.due_date) ? 'Overdue — ' : 'Due '}{f.due_date}
                          </p>
                        )}
                      </div>
                      {isOverdue(f.due_date) && (
                        <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column — context panel ────────────────── */}
          <ContextPanel>
            {/* Stop list */}
            {stopItems.length > 0 && (
              <ContextBlock title="Stop list this week">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stopItems.map((item) => (
                    <p
                      key={item.id}
                      style={{ fontSize: 12, color: 'var(--sc-muted)', textDecoration: 'line-through' }}
                    >
                      {item.description}
                    </p>
                  ))}
                </div>
              </ContextBlock>
            )}

            {/* Day status summary */}
            <ContextBlock title="Today">
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 4 }}>Focus logged</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: log ? 'var(--sc-teal)' : 'var(--sc-text)' }}>
                  {log ? log.status.replace('_', ' ') : 'Not yet logged'}
                </p>
              </div>
              {log?.notes && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 4 }}>Today&apos;s outcome</p>
                  <p style={{ fontSize: 12, color: 'var(--sc-text-2)', lineHeight: 1.4 }}>{log.notes}</p>
                </div>
              )}
            </ContextBlock>

            {/* Follow-ups count */}
            {followups.length > 0 && (
              <ContextBlock>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 4 }}>Follow-ups due today</p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: followups.some(f => isOverdue(f.due_date)) ? 'var(--sc-error)' : 'var(--sc-text)',
                  }}
                >
                  {followups.length}
                </p>
              </ContextBlock>
            )}

            {/* Weekly plan link */}
            <ContextBlock>
              <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 10 }}>
                Manage your week&apos;s focus and stop list on the weekly plan page.
              </p>
              <a
                href="/dashboard/weekly-plan"
                style={{ fontSize: 12, color: 'var(--sc-teal)', fontWeight: 500 }}
              >
                Weekly Plan →
              </a>
            </ContextBlock>
          </ContextPanel>

        </div>
      </div>

      {/* Switch challenge modal */}
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
    </>
  )
}
