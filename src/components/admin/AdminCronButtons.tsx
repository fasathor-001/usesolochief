'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

type CronType = 'monday-plan-email' | 'friday-review-email' | 'followup-reminders-email'

const CRON_JOBS: { type: CronType; label: string }[] = [
  { type: 'monday-plan-email',       label: 'Monday plan email' },
  { type: 'friday-review-email',     label: 'Friday review email' },
  { type: 'followup-reminders-email', label: 'Follow-up reminders' },
]

export function AdminCronButtons() {
  const [status, setStatus] = useState<Record<string, 'idle' | 'loading' | 'ok' | 'error'>>({})

  async function trigger(type: CronType) {
    setStatus(s => ({ ...s, [type]: 'loading' }))
    try {
      const res = await fetch(`/api/admin/trigger-cron/${type}`, { method: 'POST' })
      setStatus(s => ({ ...s, [type]: res.ok ? 'ok' : 'error' }))
    } catch {
      setStatus(s => ({ ...s, [type]: 'error' }))
    }
    setTimeout(() => setStatus(s => ({ ...s, [type]: 'idle' })), 4000)
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {CRON_JOBS.map(job => {
        const st = status[job.type] ?? 'idle'
        return (
          <button
            key={job.type}
            type="button"
            onClick={() => trigger(job.type)}
            disabled={st === 'loading'}
            className="sc-btn sc-btn-secondary sc-btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {st === 'loading' ? (
              <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
            ) : st === 'ok' ? (
              <CheckCircle2 size={12} style={{ color: 'var(--sc-success, #10B981)' }} />
            ) : st === 'error' ? (
              <AlertCircle size={12} style={{ color: 'var(--sc-error, #EF4444)' }} />
            ) : null}
            {st === 'loading' ? 'Running…' : st === 'ok' ? 'Done' : st === 'error' ? 'Failed' : job.label}
          </button>
        )
      })}
    </div>
  )
}
