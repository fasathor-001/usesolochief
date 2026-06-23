'use client'

import { useState } from 'react'
import { Send, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

type CronType = 'monday-reminder' | 'friday-reminder' | 'overdue-followups'

const EMAIL_TEMPLATES = [
  { label: 'Welcome email',             type: 'welcome' },
  { label: 'Monday plan reminder',      type: 'monday-reminder' },
  { label: 'Friday review reminder',    type: 'friday-reminder' },
  { label: 'Overdue follow-ups nudge',  type: 'overdue-followup' },
  { label: 'Inactivity nudge',          type: 'inactivity-nudge' },
]

const CRON_JOBS: { label: string; type: CronType; description: string }[] = [
  { type: 'monday-reminder',   label: 'Monday plan reminder',   description: 'Sends to all users with email enabled' },
  { type: 'friday-reminder',   label: 'Friday review reminder', description: 'Sends to all users with email enabled' },
  { type: 'overdue-followups', label: 'Overdue follow-ups',     description: 'Checks all users for overdue items' },
]

export function AdminEmailPanel() {
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

      {/* Cron triggers */}
      <div className="sc-card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 4 }}>Trigger scheduled jobs</p>
        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 16 }}>
          Manually fire email cron jobs. These send to real users — use with care.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CRON_JOBS.map(job => {
            const status = cronStatus[job.type] ?? 'idle'
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
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{job.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 2 }}>{job.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerCron(job.type)}
                  disabled={status === 'loading'}
                  className="sc-btn sc-btn-secondary sc-btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {status === 'loading' ? (
                    <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Running…</>
                  ) : status === 'ok' ? (
                    <><CheckCircle2 size={12} style={{ color: 'var(--sc-success, #10B981)' }} /> Done</>
                  ) : status === 'error' ? (
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
