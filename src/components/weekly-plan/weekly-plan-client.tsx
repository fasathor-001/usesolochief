'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  updateWeeklyPlan,
  lockWeeklyPlan,
  upsertWeeklyOutcome,
  addStopListItem,
  removeStopListItem,
} from '@/lib/actions/weekly-plan'
import type { WeeklyPlan, WeeklyOutcome, Commitment, StopListItem, Followup } from '@/types/database'
import { Lock, X, Plus, CheckCircle } from 'lucide-react'
import { ContextPanel, ContextBlock } from '@/components/ui/solochief/ContextPanel'
import { PageHeader } from '@/components/ui/solochief/PageHeader'

interface WeeklyPlanClientProps {
  plan: WeeklyPlan
  outcomes: WeeklyOutcome[]
  commitments: Commitment[]
  stopItems: StopListItem[]
  followups: Followup[]
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00Z')
  const end = new Date(weekStart + 'T12:00:00Z')
  end.setUTCDate(start.getUTCDate() + 6)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const startStr = `${days[start.getUTCDay()]} ${start.getUTCDate()} ${months[start.getUTCMonth()]}`
  const endStr = `${days[end.getUTCDay()]} ${end.getUTCDate()} ${months[end.getUTCMonth()]} ${end.getUTCFullYear()}`
  return `${startStr} — ${endStr}`
}

export function WeeklyPlanClient({
  plan,
  outcomes: serverOutcomes,
  commitments,
  stopItems: serverStopItems,
  followups,
}: WeeklyPlanClientProps) {
  const [mainFocusId, setMainFocusId] = useState(plan.main_focus_commitment_id ?? '')
  const [overrideId, setOverrideId] = useState(plan.override_commitment_id ?? '')
  const [outcomeTexts, setOutcomeTexts] = useState<string[]>(() => {
    const existing = serverOutcomes.map((o) => o.description)
    while (existing.length < 3) existing.push('')
    return existing.slice(0, 3)
  })
  const [outcomeIds, setOutcomeIds] = useState<Array<string | undefined>>(
    () => {
      const ids: Array<string | undefined> = serverOutcomes.slice(0, 3).map((o) => o.id)
      while (ids.length < 3) ids.push(undefined)
      return ids
    }
  )
  const [stopItems, setStopItems] = useState<StopListItem[]>(serverStopItems)
  const [newStopItem, setNewStopItem] = useState('')
  const [locked, setLocked] = useState(!!plan.locked_at)
  const [isSaving, startSave] = useTransition()
  const [isLocking, startLock] = useTransition()
  const [isAddingStop, startAddStop] = useTransition()

  function handleOutcomeChange(index: number, value: string) {
    setOutcomeTexts((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function saveDraft() {
    startSave(async () => {
      const { error } = await updateWeeklyPlan(plan.id, {
        mainFocusCommitmentId: mainFocusId || null,
        overrideCommitmentId: overrideId || null,
      })
      if (error) { toast.error(error); return }

      const errors: string[] = []
      const newIds = [...outcomeIds]
      for (let i = 0; i < 3; i++) {
        const text = outcomeTexts[i]?.trim()
        if (!text) continue
        const { data, error: oErr } = await upsertWeeklyOutcome(plan.id, i, text, outcomeIds[i])
        if (oErr) { errors.push(oErr); continue }
        if (data) newIds[i] = data.id
      }
      setOutcomeIds(newIds)

      if (errors.length > 0) { toast.error(errors[0]); return }
      toast.success('Draft saved')
    })
  }

  function handleLock() {
    const filled = outcomeTexts.filter((t) => t.trim())
    if (filled.length !== 3) { toast.error('You must have exactly 3 outcomes before locking'); return }
    if (!mainFocusId) { toast.error('Set your main focus before locking'); return }

    startLock(async () => {
      await saveDraft()
      const { error } = await lockWeeklyPlan(plan.id)
      if (error) { toast.error(error); return }
      setLocked(true)
      toast.success('Weekly plan locked')
    })
  }

  function handleAddStop() {
    const desc = newStopItem.trim()
    if (!desc) return
    startAddStop(async () => {
      const { data, error } = await addStopListItem(desc)
      if (error) { toast.error(error); return }
      if (data) setStopItems((prev) => [...prev, data])
      setNewStopItem('')
    })
  }

  function handleRemoveStop(id: string) {
    startAddStop(async () => {
      const { error } = await removeStopListItem(id)
      if (error) { toast.error(error); return }
      setStopItems((prev) => prev.filter((s) => s.id !== id))
    })
  }

  const mainFocusOptions = commitments.filter((c) => !c.deleted_at)
  const overrideOptions = commitments.filter((c) => !c.deleted_at && c.id !== mainFocusId)
  const launchChecklists = commitments.filter((c) => c.stage === 'launch_checklist' && !c.deleted_at)
  const filledOutcomes = outcomeTexts.filter((t) => t.trim()).length

  return (
    <>
      {/* Topbar */}
      <div className="sc-topbar">
        <div />
        <div className="sc-topbar-actions" />
      </div>

    <div className="sc-content">
      <PageHeader
        title="Weekly Plan"
        subtitle={formatWeekRange(plan.week_start)}
        secondaryAction={
          <span
            className="sc-badge"
            style={{
              backgroundColor: locked ? 'var(--sc-teal-10)' : 'rgba(59,130,246,0.10)',
              color: locked ? '#007a6b' : '#185FA5',
            }}
          >
            {locked ? 'Active' : 'Draft'}
          </span>
        }
        action={!locked ? (
          <button
            type="button"
            onClick={handleLock}
            disabled={isLocking || isSaving}
            className="sc-btn sc-btn-primary sc-btn-sm"
          >
            <Lock size={13} />
            {isLocking ? 'Locking...' : 'Lock plan'}
          </button>
        ) : undefined}
      />
      <div className="sc-grid-main">
      <div className="sc-grid-col">
      <div className="space-y-8">
        {/* Section 1 — Focus */}
        <section>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
            This week&apos;s focus
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--sc-text)' }}>
                Main focus commitment
              </label>
              <Select
                value={mainFocusId || null}
                onValueChange={(v) => setMainFocusId(v ?? '')}
                disabled={locked}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your main focus...">
                    {(value: string | null) =>
                      value ? (mainFocusOptions.find((c) => c.id === value)?.title ?? value) : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {mainFocusOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id} label={c.title}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--sc-text)' }}>
                Approved override this week{' '}
                <span className="font-normal" style={{ color: 'var(--sc-muted)' }}>(optional)</span>
              </label>
              <Select
                value={overrideId || null}
                onValueChange={(v) => setOverrideId(v ?? '')}
                disabled={locked}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None">
                    {(value: string | null) =>
                      value ? (overrideOptions.find((c) => c.id === value)?.title ?? value) : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {overrideOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id} label={c.title}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Section 2 — Three Outcomes */}
        <section>
          <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
            Three outcomes
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--sc-muted)' }}>
            Exactly three. No more, no less. These are your commitments for the week.
          </p>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: outcomeTexts[i]?.trim() ? 'var(--sc-accent)' : 'var(--sc-border)',
                    color: outcomeTexts[i]?.trim() ? '#fff' : 'var(--sc-muted)',
                  }}
                >
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={outcomeTexts[i]}
                  onChange={(e) => handleOutcomeChange(i, e.target.value)}
                  disabled={locked}
                  placeholder={`Outcome ${i + 1}...`}
                  className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none disabled:opacity-60"
                  style={{
                    borderColor: 'var(--sc-border)',
                    backgroundColor: 'var(--sc-surface)',
                    color: 'var(--sc-text)',
                  }}
                />
              </div>
            ))}
          </div>
          {!locked && filledOutcomes !== 3 && filledOutcomes > 0 && (
            <p className="text-xs mt-2" style={{ color: '#F59E0B' }}>
              {filledOutcomes}/3 outcomes set. You need exactly 3 to lock.
            </p>
          )}
        </section>

        {/* Section 3 — Stop List */}
        <section>
          <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
            Stop list
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--sc-muted)' }}>
            What must not be touched this week.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {stopItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{ backgroundColor: 'var(--sc-surface)', border: '1px solid var(--sc-border)', color: 'var(--sc-text)' }}
              >
                {item.description}
                {!locked && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(item.id)}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--sc-muted)' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
            {stopItems.length === 0 && (
              <span className="text-xs" style={{ color: 'var(--sc-muted)' }}>
                Nothing added yet.
              </span>
            )}
          </div>
          {!locked && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newStopItem}
                onChange={(e) => setNewStopItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddStop() }}
                placeholder="Add to stop list..."
                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  borderColor: 'var(--sc-border)',
                  backgroundColor: 'var(--sc-surface)',
                  color: 'var(--sc-text)',
                }}
              />
              <button
                type="button"
                onClick={handleAddStop}
                disabled={isAddingStop}
                className="px-3 py-2 rounded-lg border text-sm transition-colors"
                style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Section 4 — Follow-ups this week */}
        {followups.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
              Follow-ups to close this week
            </h2>
            <div className="space-y-1.5">
              {followups.slice(0, 8).map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--sc-surface)' }}
                >
                  <CheckCircle size={14} style={{ color: 'var(--sc-border)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--sc-text)' }}>{f.title}</p>
                    {f.due_date && (
                      <p className="text-xs" style={{ color: 'var(--sc-muted)' }}>
                        Due {f.due_date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5 — Launch Checklists */}
        {launchChecklists.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
              Launch checklists in progress
            </h2>
            <div className="space-y-1.5">
              {launchChecklists.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--sc-surface)', border: '1px solid #F59E0B30' }}
                >
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: '#F59E0B20', color: '#F59E0B' }}
                  >
                    launch
                  </span>
                  <p className="text-sm" style={{ color: 'var(--sc-text)' }}>{c.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Save Draft button */}
        {!locked && (
          <div className="pt-2 border-t" style={{ borderColor: 'var(--sc-border)' }}>
            <button
              type="button"
              onClick={saveDraft}
              disabled={isSaving}
              className="sc-btn sc-btn-ghost"
            >
              {isSaving ? 'Saving...' : 'Save draft'}
            </button>
          </div>
        )}
      </div>
      </div>{/* sc-grid-col */}

      {/* ── Context panel: Planning Rules ──────── */}
      <ContextPanel>
        <ContextBlock title="Planning rules">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'One main focus commitment per week.',
              'Exactly three outcomes — no more, no less.',
              'Lock the plan by Monday morning.',
              'Stop list items are hard blocks — no exceptions.',
              'Override is for genuine emergencies only.',
            ].map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-teal)', flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', lineHeight: 1.5 }}>{rule}</p>
              </div>
            ))}
          </div>
        </ContextBlock>

        <ContextBlock title="Status">
          <div>
            <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 4 }}>Plan state</p>
            <span
              className="sc-badge"
              style={{
                backgroundColor: locked ? 'var(--sc-teal-10)' : 'rgba(59,130,246,0.10)',
                color: locked ? '#007a6b' : '#185FA5',
              }}
            >
              {locked ? 'Active — locked' : 'Draft — not locked'}
            </span>
          </div>
          {!locked && (
            <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 10, lineHeight: 1.5 }}>
              Fill in your focus, three outcomes, and stop list, then lock the plan.
            </p>
          )}
        </ContextBlock>
      </ContextPanel>

      </div>{/* sc-grid-main */}
    </div>
    </>
  )
}
