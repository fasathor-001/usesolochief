'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, AlertCircle, Bell } from 'lucide-react'
import {
  createFollowUp,
  completeFollowUp,
  snoozeFollowUp,
  deleteFollowUp,
  type CreateFollowUpInput,
} from '@/lib/actions/follow-ups'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Followup, Commitment, FollowupUrgency } from '@/types/database'

interface FollowUpsClientProps {
  initialFollowups: Followup[]
  commitments: Commitment[]
}

const URGENCY_LABELS: Record<FollowupUrgency, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
}

const URGENCY_COLOURS: Record<FollowupUrgency, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  normal: '#3B82F6',
  low: '#64748B',
}

type FollowupGroup = {
  label: string
  headerColour: string
  items: Followup[]
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function weekEndString(): string {
  const d = new Date()
  const day = d.getDay()
  const daysUntilSunday = 7 - day
  d.setDate(d.getDate() + daysUntilSunday)
  return d.toISOString().split('T')[0]
}

function daysOverdue(dueDate: string): number {
  return Math.floor((new Date(todayString()).getTime() - new Date(dueDate).getTime()) / 86400000)
}

function groupFollowups(followups: Followup[]): FollowupGroup[] {
  const today = todayString()
  const weekEnd = weekEndString()

  const overdue: Followup[] = []
  const dueToday: Followup[] = []
  const dueThisWeek: Followup[] = []
  const upcoming: Followup[] = []

  for (const f of followups) {
    if (!f.due_date) { upcoming.push(f); continue }
    if (f.due_date < today) overdue.push(f)
    else if (f.due_date === today) dueToday.push(f)
    else if (f.due_date <= weekEnd) dueThisWeek.push(f)
    else upcoming.push(f)
  }

  const groups: FollowupGroup[] = []
  if (overdue.length > 0) groups.push({ label: 'OVERDUE', headerColour: '#EF4444', items: overdue })
  if (dueToday.length > 0) groups.push({ label: 'DUE TODAY', headerColour: '#F59E0B', items: dueToday })
  if (dueThisWeek.length > 0) groups.push({ label: 'DUE THIS WEEK', headerColour: 'var(--sc-text)', items: dueThisWeek })
  if (upcoming.length > 0) groups.push({ label: 'UPCOMING', headerColour: 'var(--sc-muted)', items: upcoming })
  return groups
}

export function FollowUpsClient({ initialFollowups, commitments }: FollowUpsClientProps) {
  const [followups, setFollowups] = useState<Followup[]>(initialFollowups)
  const [showAdd, setShowAdd] = useState(false)
  const [showSnooze, setShowSnooze] = useState<string | null>(null)
  const [snoozeDate, setSnoozeDate] = useState('')
  const [isPending, startTransition] = useTransition()

  // Add form state
  const [title, setTitle] = useState('')
  const [contactName, setContactName] = useState('')
  const [commitmentId, setCommitmentId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [urgency, setUrgency] = useState<FollowupUrgency>('normal')
  const [nextAction, setNextAction] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const today = todayString()
  const overdueCount = followups.filter(f => f.due_date && f.due_date < today).length
  const dueThisWeekCount = followups.filter(f => f.due_date && f.due_date >= today && f.due_date <= weekEndString()).length

  const completedThisMonth = 0 // not tracked client-side; would need separate query

  const groups = groupFollowups(followups)

  function resetForm() {
    setTitle(''); setContactName(''); setCommitmentId(''); setDueDate('')
    setUrgency('normal'); setNextAction(''); setFormNotes('')
  }

  function handleAdd() {
    if (!title.trim() || !dueDate) return
    const input: CreateFollowUpInput = {
      title: title.trim(),
      contactName: contactName.trim() || undefined,
      commitmentId: commitmentId || undefined,
      dueDate,
      urgency,
      nextAction: nextAction.trim() || undefined,
      notes: formNotes.trim() || undefined,
    }
    startTransition(async () => {
      const { data, error } = await createFollowUp(input)
      if (error) { toast.error(error); return }
      if (data) setFollowups(prev => [...prev, data])
      resetForm()
      setShowAdd(false)
      toast.success('Follow-up added')
    })
  }

  function handleComplete(id: string) {
    startTransition(async () => {
      const { error } = await completeFollowUp(id)
      if (error) { toast.error(error); return }
      setFollowups(prev => prev.filter(f => f.id !== id))
      toast.success('Follow-up complete')
    })
  }

  function handleSnooze(id: string) {
    if (!snoozeDate) return
    startTransition(async () => {
      const { data, error } = await snoozeFollowUp(id, snoozeDate)
      if (error) { toast.error(error); return }
      if (data) setFollowups(prev => prev.map(f => f.id === id ? data : f))
      setShowSnooze(null)
      setSnoozeDate('')
      toast.success('Follow-up snoozed')
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const { error } = await deleteFollowUp(id)
      if (error) { toast.error(error); return }
      setFollowups(prev => prev.filter(f => f.id !== id))
      toast.success('Follow-up deleted')
    })
  }

  return (
    <>
      {/* Topbar */}
      <div className="sc-topbar">
        <div className="sc-topbar-left">
          <span className="sc-topbar-title">Follow-ups</span>
          <span className="sc-topbar-sub">Things waiting on someone or something.</span>
        </div>
        <div className="sc-topbar-actions">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="sc-btn sc-btn-primary sc-btn-sm"
          >
            <Plus size={14} />
            Add follow-up
          </button>
        </div>
      </div>

    <div className="sc-content sc-content-narrow">
      {/* Stats */}
      <div className="sc-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="sc-stat">
          <p className={`sc-stat-value${overdueCount > 0 ? ' danger' : ''}`}>{overdueCount}</p>
          <p className="sc-stat-label">overdue</p>
        </div>
        <div className="sc-stat">
          <p className="sc-stat-value">{dueThisWeekCount}</p>
          <p className="sc-stat-label">due this week</p>
        </div>
        <div className="sc-stat">
          <p className="sc-stat-value">{completedThisMonth}</p>
          <p className="sc-stat-label">completed this month</p>
        </div>
      </div>

      {/* Empty state */}
      {followups.length === 0 && (
        <div
          className="p-8 rounded-xl border text-center"
          style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
        >
          <Bell size={32} className="mx-auto mb-3" style={{ color: 'var(--sc-muted)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--sc-text)' }}>No open follow-ups.</p>
          <p className="text-xs" style={{ color: 'var(--sc-muted)' }}>Good. Keep it that way.</p>
        </div>
      )}

      {/* Grouped sections */}
      <div className="space-y-8">
        {groups.map(({ label, headerColour, items }) => (
          <section key={label}>
            <h2
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: headerColour }}
            >
              {label}
            </h2>
            <div className="space-y-2">
              {items.map((f) => {
                const isOverdue = f.due_date ? f.due_date < today : false
                const overdueDays = f.due_date && isOverdue ? daysOverdue(f.due_date) : 0

                return (
                  <div
                    key={f.id}
                    className={`sc-followup-card${isOverdue ? ' overdue' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--sc-text)' }}>
                          {f.title}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${URGENCY_COLOURS[f.urgency ?? 'normal']}20`,
                            color: URGENCY_COLOURS[f.urgency ?? 'normal'],
                          }}
                        >
                          {URGENCY_LABELS[f.urgency ?? 'normal']}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {f.contact_name && (
                          <span className="text-xs" style={{ color: 'var(--sc-muted)' }}>
                            {f.contact_name}
                          </span>
                        )}
                        {f.due_date && (
                          <span className="text-xs flex items-center gap-1" style={{ color: isOverdue ? '#EF4444' : 'var(--sc-muted)' }}>
                            {isOverdue && <AlertCircle size={11} />}
                            {isOverdue ? `${overdueDays}d overdue` : `Due ${f.due_date}`}
                          </span>
                        )}
                      </div>
                      {f.next_action && (
                        <p className="text-xs mt-1" style={{ color: 'var(--sc-muted)' }}>
                          Next: {f.next_action}
                        </p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="shrink-0 p-1.5 rounded hover:bg-[var(--sc-border)] transition-colors"
                        style={{ color: 'var(--sc-muted)' }}
                      >
                        <MoreHorizontal size={15} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleComplete(f.id)}>
                          Mark complete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setShowSnooze(f.id); setSnoozeDate('') }}>
                          Snooze
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(f.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Add Follow-up Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent
          className="max-w-md"
          style={{ backgroundColor: 'var(--sc-background)', border: '1px solid var(--sc-border)' }}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--sc-text)' }}>Add follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                placeholder="What needs following up?"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>Person or company</label>
              <input
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Who is this with?"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>Due date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>Urgency</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as FollowupUrgency)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
                >
                  {(Object.entries(URGENCY_LABELS) as [FollowupUrgency, string][]).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>Related commitment</label>
              <select
                value={commitmentId}
                onChange={e => setCommitmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              >
                <option value="">None</option>
                {commitments.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>Next action</label>
              <input
                type="text"
                value={nextAction}
                onChange={e => setNextAction(e.target.value)}
                placeholder="What needs to happen next?"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { resetForm(); setShowAdd(false) }}
                className="flex-1 py-2 rounded-lg border text-sm transition-colors"
                style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isPending || !title.trim() || !dueDate}
                className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
              >
                {isPending ? 'Saving...' : 'Add follow-up'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>

      {/* Snooze Modal */}
      <Dialog open={!!showSnooze} onOpenChange={open => { if (!open) setShowSnooze(null) }}>
        <DialogContent
          className="max-w-xs"
          style={{ backgroundColor: 'var(--sc-background)', border: '1px solid var(--sc-border)' }}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--sc-text)' }}>Snooze until</DialogTitle>
          </DialogHeader>
          <input
            type="date"
            value={snoozeDate}
            onChange={e => setSnoozeDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none mt-2"
            style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
          />
          <button
            type="button"
            onClick={() => showSnooze && handleSnooze(showSnooze)}
            disabled={isPending || !snoozeDate}
            className="w-full mt-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
          >
            Snooze
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}
