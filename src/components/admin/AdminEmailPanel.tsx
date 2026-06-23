'use client'

import { useState } from 'react'
import { Send, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import type { AdminEmailStats } from '@/lib/actions/admin'

type CronType = 'monday-plan-email' | 'friday-review-email' | 'followup-reminders-email'

const EMAIL_TEMPLATES = [
  { label: 'Welcome email',             type: 'welcome' },
  { label: 'Monday plan email',         type: 'monday-plan-email' },
  { label: 'Friday review email',       type: 'friday-review-email' },
  { label: 'Follow-up reminders',       type: 'followup-reminders-email' },
  { label: 'Inactivity nudge',          type: 'inactivity-nudge' },
]

const CRON_JOBS: { label: string; type: CronType; description: string }[] = [
  { type: 'monday-plan-email',       label: 'Monday plan email',      description: 'Sends to users without weekly plans' },
  { type: 'friday-review-email',     label: 'Friday review email',    description: 'Sends to users without completed reviews' },
  { type: 'followup-reminders-email', label: 'Follow-up reminders',   description: 'Sends to users with due/overdue items' },
]

interface AdminEmailPanelProps {
  stats?: AdminEmailStats
}

export function AdminEmailPanel({ stats }: AdminEmailPanelProps) {
  const [testEmail, setTestEmail] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  const [cronStatus, setCronStatus] = useState<Record<string, 'idle' | 'loading' | 'ok' | 'error'>>({})

  async function sendTestEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!testEmail.trim()) return
    setTestSending(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail.trim() }),
      })
      const data = await res.json()
      setTestResult(res.ok ? { ok: true, message: 'Test email sent.' } : { ok: false, message: data.error ?? 'Send failed.' })
    } catch {
      setTestResult({ ok: false, message: 'Network error. Please try again.' })
    } finally {
      setTestSending(false)
    }
  }

  async function triggerCron(type: CronType) {
    setCronStatus(s => ({ ...s, [type]: 'loading' }))
    try {
      const res = await fetch(`/api/admin/trigger-cron/${type}`, { method: 'POST' })
      const data = await res.json()
      setCronStatus(s => ({ ...s, [type]: res.ok ? 'ok' : 'error' }))
      if (!res.ok) console.error('Cron trigger error:', data.error)
    } catch {
      setCronStatus(s => ({ ...s, [type]: 'error' }))
    }
    setTimeout(() => setCronStatus(s => ({ ...s, [type]: 'idle' })), 4000)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Email
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>Send test emails and trigger scheduled jobs.</p>
      </div>

      {/* Send test email */}
      <div className="sc-card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 4 }}>Send test email</p>
        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 14 }}>
          Sends a test message to confirm your Resend integration is working.
        </p>
        <form onSubmit={sendTestEmail} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="email"
            required
            placeholder="Recipient email address"
            value={testEmail}
            onChange={e => { setTestEmail(e.target.value); setTestResult(null) }}
            className="sc-input"
            style={{ flex: '1 1 240px', fontSize: 13, height: 36 }}
          />
          <button
            type="submit"
            disabled={testSending || !testEmail.trim()}
            className="sc-btn sc-btn-primary sc-btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36 }}
          >
            <Send size={13} />
            {testSending ? 'Sending…' : 'Send test'}
          </button>
        </form>
        {testResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
            fontSize: 12, color: testResult.ok ? 'var(--sc-success, #10B981)' : 'var(--sc-error, #EF4444)',
          }}>
            {testResult.ok ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {testResult.message}
          </div>
        )}
      </div>

      {/* Cron triggers and status */}
      <div className="sc-card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 4 }}>Scheduled email jobs</p>
        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 16 }}>
          Configured status and last sent. Manually trigger jobs — these send to real users.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CRON_JOBS.map(job => {
            const triggerStatus = cronStatus[job.type] ?? 'idle'
            let lastSent: string | null = null
            if (job.type === 'monday-plan-email') lastSent = stats?.lastMondayRun ?? null
            else if (job.type === 'friday-review-email') lastSent = stats?.lastFridayRun ?? null
            else if (job.type === 'followup-reminders-email') lastSent = stats?.lastFollowupRun ?? null

            return (
              <div
                key={job.type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '0.5px solid var(--sc-border)',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{job.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 2 }}>{job.description}</p>
                  {lastSent && (
                    <p style={{ fontSize: 10, color: 'var(--sc-muted)', marginTop: 4 }}>
                      Last sent: {new Date(lastSent).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => triggerCron(job.type)}
                  disabled={triggerStatus === 'loading'}
                  className="sc-btn sc-btn-secondary sc-btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {triggerStatus === 'loading' ? (
                    <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Running…</>
                  ) : triggerStatus === 'ok' ? (
                    <><CheckCircle2 size={12} style={{ color: 'var(--sc-success, #10B981)' }} /> Done</>
                  ) : triggerStatus === 'error' ? (
                    <><AlertCircle size={12} style={{ color: 'var(--sc-error, #EF4444)' }} /> Failed</>
                  ) : (
                    <>Trigger</>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Templates reference */}
      <div className="sc-card" style={{ padding: '20px 22px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 12 }}>Email templates</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {EMAIL_TEMPLATES.map((t, i) => (
            <div
              key={t.type}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < EMAIL_TEMPLATES.length - 1 ? '0.5px solid var(--sc-border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--sc-text-2)' }}>{t.label}</span>
              <code style={{ fontSize: 11, color: 'var(--sc-muted)' }}>{t.type}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
