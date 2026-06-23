'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { requestSwitch, decideSwitchRequest } from '@/lib/actions/today'
import type { Commitment } from '@/types/database'

const SWITCH_REASONS = [
  { id: 'production_broken', label: 'Production is broken', urgent: true },
  { id: 'revenue_critical', label: 'Revenue-critical issue', urgent: true },
  { id: 'legal_payment', label: 'Legal or payment urgent', urgent: true },
  { id: 'health_safety', label: 'Health or safety', urgent: true },
  { id: 'approved_override', label: 'This week\'s approved override', urgent: true },
  { id: 'not_urgent', label: 'Not urgent — cancel', urgent: false },
]

interface SwitchChallengeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fromCommitment: Commitment
  toCommitment: Commitment
  onApproved: () => void
}

export function SwitchChallengeModal({
  open,
  onOpenChange,
  fromCommitment,
  toCommitment,
  onApproved,
}: SwitchChallengeModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDecide() {
    if (!selectedReason) {
      setError('Please select a reason')
      return
    }
    const reason = SWITCH_REASONS.find((r) => r.id === selectedReason)
    if (!reason) return

    if (!reason.urgent) {
      onOpenChange(false)
      setSelectedReason(null)
      return
    }

    setError(null)
    startTransition(async () => {
      const { data: switchReq, error: reqErr } = await requestSwitch(
        fromCommitment.id,
        toCommitment.id,
        reason.label,
      )
      if (reqErr || !switchReq) {
        setError(reqErr ?? 'Failed to log switch request')
        return
      }
      await decideSwitchRequest(switchReq.id, 'approved', reason.label)
      onApproved()
      onOpenChange(false)
      setSelectedReason(null)
    })
  }

  const selectedIsUrgent = SWITCH_REASONS.find((r) => r.id === selectedReason)?.urgent

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) { setSelectedReason(null); setError(null) }
        onOpenChange(o)
      }}
    >
      <DialogContent
        style={{ backgroundColor: 'var(--sc-background)', border: '1px solid var(--sc-border)' }}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--sc-text)' }}>Before you switch...</DialogTitle>
          <p className="text-sm mt-1" style={{ color: 'var(--sc-muted)' }}>
            Today you set{' '}
            <span className="font-medium" style={{ color: 'var(--sc-text)' }}>
              {fromCommitment.title}
            </span>{' '}
            as your focus. You want to switch to{' '}
            <span className="font-medium" style={{ color: 'var(--sc-text)' }}>
              {toCommitment.title}
            </span>
            .
          </p>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--sc-text)' }}>
            Is this:
          </p>
        </DialogHeader>

        <div className="space-y-1.5 mt-1">
          {SWITCH_REASONS.map((reason) => (
            <label
              key={reason.id}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
              style={{
                borderColor: selectedReason === reason.id ? 'var(--sc-accent)' : 'var(--sc-border)',
                backgroundColor: selectedReason === reason.id
                  ? 'rgba(0,194,168,0.06)'
                  : reason.urgent ? 'var(--sc-surface)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="switchReason"
                value={reason.id}
                checked={selectedReason === reason.id}
                onChange={() => setSelectedReason(reason.id)}
                className="accent-[var(--sc-accent)] shrink-0"
              />
              <span
                className="text-sm"
                style={{
                  color: reason.urgent ? 'var(--sc-text)' : 'var(--sc-muted)',
                  fontWeight: reason.urgent ? undefined : 500,
                }}
              >
                {reason.label}
              </span>
            </label>
          ))}
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'var(--sc-error)' }}>{error}</p>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg border text-sm transition-colors"
            style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDecide}
            disabled={isPending || !selectedReason}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: selectedIsUrgent === false ? 'var(--sc-border)' : 'var(--sc-accent)',
              color: selectedIsUrgent === false ? 'var(--sc-muted)' : '#fff',
            }}
          >
            {isPending ? 'Processing...' : selectedIsUrgent === false ? 'Stay on focus' : 'Approve switch'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
