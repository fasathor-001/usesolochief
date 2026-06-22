'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { completeReview, redirectAfterReview } from '@/lib/actions/reviews'
import type {
  WeeklyPlan, WeeklyOutcome, Followup, ParkingLotItem, Commitment, Review,
} from '@/types/database'

interface ReviewClientProps {
  plan: WeeklyPlan | null
  outcomes: WeeklyOutcome[]
  overdueFollowups: Followup[]
  parkingItemsThisWeek: ParkingLotItem[]
  commitments: Commitment[]
  existingReview: Review | null
  weekRange: string
}

function formatDate(str: string | null): string {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00Z')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function ReviewClient({
  plan,
  outcomes,
  overdueFollowups,
  parkingItemsThisWeek,
  commitments,
  existingReview,
  weekRange,
}: ReviewClientProps) {
  const [shippedText, setShippedText] = useState(existingReview?.shipped_text ?? '')
  const [slippedText, setSlippedText] = useState(existingReview?.slipped_text ?? '')
  const [wronglyTouchedText, setWronglyTouchedText] = useState(existingReview?.wrongly_touched_text ?? '')
  const [belowLevelText, setBelowLevelText] = useState(existingReview?.below_level_text ?? '')
  const [nextWeekFocusId, setNextWeekFocusId] = useState(existingReview?.next_week_focus_commitment_id ?? '')
  const [stopListChange, setStopListChange] = useState(existingReview?.next_week_stop_list_change ?? '')
  const [energyRating, setEnergyRating] = useState<number | null>(existingReview?.energy_rating ?? null)
  const [focusRating, setFocusRating] = useState<number | null>(existingReview?.focus_rating ?? null)
  const [outcomeResults, setOutcomeResults] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const o of outcomes) {
      initial[o.id] = o.achieved ?? false
    }
    return initial
  })
  const [dismissedFollowups, setDismissedFollowups] = useState<Set<string>>(new Set())

  const [isPending, startTransition] = useTransition()
  const alreadyComplete = !!existingReview?.completed_at

  function handleComplete() {
    if (!plan) { toast.error('No weekly plan found for this week'); return }

    startTransition(async () => {
      const { error } = await completeReview({
        weeklyPlanId: plan.id,
        shippedText,
        slippedText,
        wronglyTouchedText,
        belowLevelText,
        nextWeekFocusCommitmentId: nextWeekFocusId || null,
        nextWeekStopListChange: stopListChange,
        outcomeResults: outcomes.map(o => ({ outcomeId: o.id, achieved: outcomeResults[o.id] ?? false })),
        dismissedFollowupIds: Array.from(dismissedFollowups),
        energyRating,
        focusRating,
      })

      if (error) { toast.error(error); return }

      toast.success('Week reviewed. Monday plan draft is ready.')
      await redirectAfterReview()
    })
  }

  if (alreadyComplete) {
    return (
      <>
        <div className="sc-topbar">
          <div className="sc-topbar-left">
            <span className="sc-topbar-title">Friday Review</span>
            <span className="sc-topbar-sub">Week of {weekRange}</span>
          </div>
        </div>
        <div className="sc-content sc-content-narrow">
          <div
            className="sc-card"
            style={{ borderColor: 'rgba(0,194,168,0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckCircle size={16} style={{ color: 'var(--sc-teal)' }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-teal)' }}>Week reviewed</p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>
              Review complete for {weekRange}. Monday plan is ready.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Topbar */}
      <div className="sc-topbar">
        <div className="sc-topbar-left">
          <span className="sc-topbar-title">Friday Review</span>
          <span className="sc-topbar-sub">Week of {weekRange} · Close the loop.</span>
        </div>
      </div>

    <div className="sc-content sc-content-narrow">

      <div className="space-y-8">
        {/* Weekly outcomes summary */}
        {outcomes.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
              Weekly outcomes set
            </h2>
            <div className="space-y-2">
              {outcomes.map((o, i) => (
                <div
                  key={o.id}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer"
                  style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
                  onClick={() => setOutcomeResults(prev => ({ ...prev, [o.id]: !prev[o.id] }))}
                >
                  <button
                    type="button"
                    className="shrink-0 transition-colors"
                    style={{ color: outcomeResults[o.id] ? 'var(--sc-accent)' : 'var(--sc-border)' }}
                  >
                    {outcomeResults[o.id] ? <CheckCircle size={16} /> : <Circle size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--sc-text)' }}>
                      {i + 1}. {o.description}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: outcomeResults[o.id] ? 'rgba(0,194,168,0.12)' : 'rgba(239,68,68,0.08)',
                      color: outcomeResults[o.id] ? 'var(--sc-accent)' : '#EF4444',
                    }}
                  >
                    {outcomeResults[o.id] ? 'Done' : 'Slipped'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ratings */}
        <section>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
            Week rating
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Energy this week', value: energyRating, set: setEnergyRating },
              { label: 'Focus this week', value: focusRating, set: setFocusRating },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <p className="text-xs mb-2" style={{ color: 'var(--sc-muted)' }}>{label}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set(n)}
                      className="w-8 h-8 rounded text-xs font-medium transition-all"
                      style={{
                        backgroundColor: value === n ? 'var(--sc-accent)' : 'var(--sc-surface)',
                        border: `1px solid ${value === n ? 'var(--sc-accent)' : 'var(--sc-border)'}`,
                        color: value === n ? '#fff' : 'var(--sc-muted)',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1 — What shipped */}
        <ReviewSection
          label="Section 1 — What actually got done this week?"
          value={shippedText}
          onChange={setShippedText}
          placeholder="Describe what shipped, was completed, or moved forward..."
        />

        {/* Section 2 — What slipped */}
        <ReviewSection
          label="Section 2 — What did not get done that should have?"
          value={slippedText}
          onChange={setSlippedText}
          placeholder="Be honest. What was planned but did not happen?"
        />

        {/* Section 3 — Wrongly touched */}
        <ReviewSection
          label="Section 3 — What did you work on that was not planned?"
          value={wronglyTouchedText}
          onChange={setWronglyTouchedText}
          placeholder="What pulled you away from your focus? No judgement — just data."
        />

        {/* Section 4 — Missed follow-ups */}
        {overdueFollowups.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
              Section 4 — Missed follow-ups
            </h2>
            <p className="text-xs mb-3" style={{ color: 'var(--sc-muted)' }}>
              These follow-ups are overdue. Confirm or dismiss each.
            </p>
            <div className="space-y-2">
              {overdueFollowups.map(f => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ borderColor: 'rgba(239,68,68,0.2)', backgroundColor: 'var(--sc-surface)' }}
                >
                  <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                  <p className="flex-1 text-sm" style={{ color: 'var(--sc-text)' }}>{f.title}</p>
                  {f.due_date && (
                    <span className="text-xs" style={{ color: '#EF4444' }}>Due {formatDate(f.due_date)}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDismissedFollowups(prev => {
                      const next = new Set(prev)
                      if (next.has(f.id)) next.delete(f.id)
                      else next.add(f.id)
                      return next
                    })}
                    className="text-xs px-2.5 py-1 rounded border transition-colors"
                    style={{
                      borderColor: dismissedFollowups.has(f.id) ? 'var(--sc-accent)' : 'var(--sc-border)',
                      color: dismissedFollowups.has(f.id) ? 'var(--sc-accent)' : 'var(--sc-muted)',
                    }}
                  >
                    {dismissedFollowups.has(f.id) ? 'Noted ✓' : 'Dismiss'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5 — What got parked */}
        {parkingItemsThisWeek.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
              Section 5 — What got parked this week
            </h2>
            <p className="text-xs mb-3" style={{ color: 'var(--sc-muted)' }}>
              {parkingItemsThisWeek.length} idea{parkingItemsThisWeek.length !== 1 ? 's' : ''} parked.
            </p>
            <div className="space-y-1.5">
              {parkingItemsThisWeek.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--sc-surface)', border: '1px solid var(--sc-border)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--sc-text)' }}>{item.title}</span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--sc-muted)' }}>{item.category.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6 — Below your level */}
        <ReviewSection
          label="Section 6 — What work this week was below your level or should not have been yours to do?"
          value={belowLevelText}
          onChange={setBelowLevelText}
          placeholder="Admin tasks, low-value work, things that should be delegated or automated..."
        />

        {/* Section 7 — Next week intention */}
        <section>
          <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
            Section 7 — Next week intention
          </h2>
          <div className="space-y-3 mt-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                What should be the main focus next week?
              </label>
              <select
                value={nextWeekFocusId}
                onChange={e => setNextWeekFocusId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              >
                <option value="">Select a commitment...</option>
                {commitments.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                Any changes to the stop list?
              </label>
              <input
                type="text"
                value={stopListChange}
                onChange={e => setStopListChange(e.target.value)}
                placeholder="Add or remove something from the stop list..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              />
            </div>
          </div>
        </section>

        {/* Complete Review button */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--sc-border)' }}>
          <button
            type="button"
            onClick={handleComplete}
            disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
          >
            {isPending ? 'Completing review...' : 'Complete Review →'}
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

function ReviewSection({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--sc-muted)' }}>
        {label}
      </h2>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-y mt-2"
        style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
      />
    </section>
  )
}
