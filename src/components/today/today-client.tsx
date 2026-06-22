'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Circle, AlertCircle, RefreshCw, Plus, X, Target } from 'lucide-react'
import { upsertDailyLog, addNotTodayItem, removeNotTodayItem, completeFollowup } from '@/lib/actions/today'
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

      {/* Content */}
      <div className="sc-content sc-content-narrow">
        {/* No plan */}
        {!plan && (
          <div className="sc-card" style={{ marginBottom: 20 }}>
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
          <div className="sc-card" style={{ marginBottom: 20, textAlign: 'center', padding: '40px 20px' }}>
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
            className="sc-card"
            style={{
              borderColor: 'rgba(0,194,168,0.25)',
              marginBottom: 20,
            }}
          >
            {/* Focus header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <p
                  className="sc-card-label"
                  style={{ color: 'var(--sc-teal)', marginBottom: 6 }}
                >
                  TODAY&apos;S FOCUS
                </p>
                <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--sc-text)', letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                  {focusCommitment.title}
                </h2>
                {focusCommitment.next_action && (
                  <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginTop: 4 }}>
                    Next: {focusCommitment.next_action}
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

            {/* Outcome input */}
            <div className="sc-field">
              <label className="sc-label">Today&apos;s one outcome</label>
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What will be done by end of day?"
                className="sc-input"
                style={{ fontSize: 14 }}
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
                      borderRadius: 'var(--sc-radius)',
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
        <div className="sc-card" style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>
              Not today{notTodayItems.length > 0 ? ` · ${notTodayItems.length + stopItems.length}` : ''}
            </p>
            <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 2 }}>
              Stop list and commitments blocked for today.
            </p>
          </div>

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
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 12 }}>
              Follow-ups due today
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {followups.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--sc-radius)',
                    border: `0.5px solid ${isOverdue(f.due_date) ? 'rgba(239,68,68,0.25)' : 'var(--sc-border)'}`,
                    backgroundColor: 'var(--sc-bg)',
                  }}
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
