'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { submitFeedback } from '@/lib/actions/feedback'

const FEEDBACK_TYPES = [
  { value: 'bug',                  label: 'Bug' },
  { value: 'feature_request',      label: 'Feature request' },
  { value: 'confusing_experience', label: 'Confusing experience' },
  { value: 'billing_payment',      label: 'Billing / payment' },
  { value: 'other',                label: 'Other' },
]

export function FeedbackForm() {
  const pathname = usePathname()
  const [type, setType] = useState('')
  const [message, setMessage] = useState('')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !message.trim()) return
    setSubmitStatus('submitting')
    setErrorMsg(null)
    try {
      await submitFeedback({ type, message: message.trim(), page: pathname })
      setSubmitStatus('success')
      setType('')
      setMessage('')
    } catch {
      setSubmitStatus('error')
      setErrorMsg('We could not send your feedback. Please try again.')
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="sc-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 6 }}>
          Thanks — your feedback has been sent.
        </p>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 20, lineHeight: 1.5 }}>
          We read all feedback and use it to improve SoloChief.
        </p>
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className="sc-btn sc-btn-secondary sc-btn-sm"
        >
          Send more feedback
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="sc-card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--sc-muted)',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Type
        </label>
        <select
          required
          value={type}
          onChange={e => setType(e.target.value)}
          className="sc-input"
          style={{ width: '100%', fontSize: 14, height: 40 }}
        >
          <option value="">Select a type…</option>
          {FEEDBACK_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--sc-muted)',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Message
        </label>
        <textarea
          required
          rows={5}
          placeholder="Tell us what happened or what you'd like to see…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="sc-input"
          style={{
            width: '100%',
            fontSize: 14,
            resize: 'vertical',
            padding: '10px 12px',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {errorMsg && (
        <p style={{ fontSize: 13, color: 'var(--sc-error, #EF4444)', marginBottom: 12 }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitStatus === 'submitting' || !type || !message.trim()}
        className="sc-btn sc-btn-primary"
      >
        {submitStatus === 'submitting' ? 'Sending…' : 'Send feedback'}
      </button>
    </form>
  )
}
