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
import { PageHeader } from '@/components/ui/solochief/PageHeader'
import { ContextPanel, ContextBlock } from '@/components/ui/solochief/ContextPanel'

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

function formatDue(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
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
  if (overdue.length > 0)     groups.push({ label: 'Overdue',       headerColour: '#EF4444',          items: overdue })
  if (dueToday.length > 0)    groups.push({ label: 'Due today',     headerColour: '#F59E0B',          items: dueToday })
  if (dueThisWeek.length > 0) groups.push({ label: 'Due this week', headerColour: 'var(--sc-text)',   items: dueThisWeek })
  if (upcoming.length > 0)    groups.push({ label: 'Upcoming',      headerColour: 'var(--sc-muted)',  items: upcoming })
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

  const commitmentMap = new Map(commitments.map(c => [c.id, c.title]))

  const today = todayString()
  const overdueCount = followups.filter(f => f.due_date && f.due_date < today).length
  const dueThisWeekCount = followups.filter(f => f.due_date && f.due_date >= today && f.due_date <= weekEndString()).length
  const totalOpen = followups.length

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

    <div className="sc-content sc-page-container">
      <PageHeader
        title="Follow-ups"
        subtitle="Commitments waiting on someone or something."
        action={
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="sc-btn sc-btn-primary sc-btn-sm"
          >
            <Plus size={14} />
            Add follow-up
          </button>
        }
      />

      <div className="sc-grid-main">

        {/* Left column */}
        <div className="sc-grid-col">

          {/* Empty state */}
          {followups.length === 0 && (
            <div
              className="sc-card"
              style={{ textAlign: 'center', padding: '48px 24px' }}
            >
              <Bell size={28} className="mx-auto mb-3" style={{ color: 'var(--sc-muted)' }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>No open follow-ups.</p>
              <p style={{ fontSize: 13, color: 'var(--sc-muted)', lineHeight: 1.6 }}>Good. Keep it that way.</p>
            </div>
          )}

          {/* Grouped sections */}
          <div className="space-y-8">
            {groups.map(({ label, headerColour, items }) => (
              <section key={label}>
                <h2
                  className="sc-section-heading"
                  style={{ color: headerColour, marginBottom: 12 }}
                >
                  {label}
                </h2>
                <div className="space-y-2">
                  {items.map((f) => {
                    const isOverdue = f.due_date ? f.due_date < today : false
                    const overdueDays = f.due_date && isOverdue ? daysOverdue(f.due_date) : 0
                    const relatedTitle = f.commitment_id ? (commitmentMap.get(f.commitment_id) ?? null) : null

                    return (
                      <div
                        key={f.id}
                        className={`sc-followup-card${isOverdue ? ' overdue' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          {/* Title + urgency */}
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

                          {/* Metadata row */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {f.contact_name && (
                              <span className="text-xs" style={{ color: 'var(--sc-muted)' }}>
                                {f.contact_name}
                              </span>
                            )}
                            {f.due_date && (
                              <span className="text-xs flex items-center gap-1" style={{ color: isOverdue ? '#EF4444' : 'var(--sc-muted)' }}>
                                {isOverdue && <AlertCircle size={11} />}
                                {isOverdue ? `${overdueDays}d overdue` : `Due ${formatDue(f.due_date)}`}
                              </span>
                            )}
                            {relatedTitle && (
                              <span className="text-xs" style={{ color: 'var(--sc-hint)' }}>
                                {relatedTitle}
                              </span>
                            )}
                          </div>

                          {/* Next action */}
                          {f.next_action && (
                            <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ color: 'var(--sc-teal)', fontWeight: 600, flexShrink: 0 }}>→</span>
                              {f.next_action}
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

        </div>

        {/* Right column */}
        <div>
          <ContextPanel>
            <ContextBlock title="Follow-up health">
              <div className="sc-metric-row">
                <span
                  className="sc-metric-label"
                  style={{ color: overdueCount > 0 ? '#EF4444' : undefined }}
                >
                  Overdue
                </span>
                <span
                  className="sc-metric-value"
                  style={{ color: overdueCount > 0 ? '#EF4444' : undefined }}
                >
                  {overdueCount}
                </span>
              </div>
              <div className="sc-metric-row">
                <span className="sc-metric-label">Due this week</span>
                <span className="sc-metric-value">{dueThisWeekCount}</span>
              </div>
              <div className="sc-metric-row">
                <span className="sc-metric-label" style={{ fontWeight: 500, color: 'var(--sc-text-2)' }}>Total open</span>
                <span className="sc-metric-value">{totalOpen}</span>
              </div>
            </ContextBlock>

            <ContextBlock>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--sc-muted)' }}>
                Follow-ups are commitments waiting on someone or something. Keep them visible until the loop is closed.
              </p>
            </ContextBlock>
          </ContextPanel>
        </div>

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
