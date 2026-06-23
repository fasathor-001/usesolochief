'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, RefreshCw } from 'lucide-react'

interface Props {
  plan: string
  firstName: string | null
}

const PRO_FEATURES = [
  'Unlimited commitments',
  'AI Chat with your full context',
  'AI planning assistance',
  'Weekly review intelligence',
  'Email reminders when enabled',
]

const OPERATOR_FEATURES = [
  'Everything in Pro',
  'WhatsApp Chief of Staff',
  'WhatsApp quick commands',
  'Daily check-ins',
  'Follow-up and review prompts through WhatsApp',
]

const MAX_POLLS = 10

export function BillingSuccessClient({ plan, firstName }: Props) {
  const router = useRouter()
  const [pollAttempt, setPollAttempt] = useState(0)
  const [pollTimedOut, setPollTimedOut] = useState(false)

  // Strip customer_session_token and any other Polar params from URL
  useEffect(() => {
    router.replace('/dashboard/billing/success', { scroll: false })
  }, [router])

  // If the webhook has not yet updated the plan, poll via server refresh
  useEffect(() => {
    if (plan !== 'free') return
    if (pollAttempt >= MAX_POLLS) { setPollTimedOut(true); return }

    const timer = setTimeout(() => {
      setPollAttempt(a => a + 1)
      router.refresh()
    }, 3000)

    return () => clearTimeout(timer)
  }, [plan, pollAttempt, router])

  const isPro = plan === 'pro'
  const isOperator = plan === 'operator'
  const isPaid = isPro || isOperator
  const planLabel = isOperator ? 'SoloChief Operator' : 'SoloChief Pro'
  const features = isOperator ? OPERATOR_FEATURES : PRO_FEATURES

  if (!isPaid) {
    return (
      <div className="sc-content sc-page-container">
        <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 48, textAlign: 'center' }}>
          {pollTimedOut ? (
            <>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 8 }}>
                Taking longer than expected.
              </p>
              <p style={{ fontSize: 13, color: 'var(--sc-text-2)', lineHeight: 1.5, marginBottom: 24 }}>
                Your payment was received. Plan activation can take a few seconds.
                Check Settings → Billing, or refresh the page.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { setPollAttempt(0); setPollTimedOut(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    border: '1px solid var(--sc-border)', background: 'var(--sc-surface)',
                    color: 'var(--sc-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} />
                  Try again
                </button>
                <Link
                  href="/dashboard/settings?section=billing"
                  style={{
                    display: 'inline-block', padding: '8px 14px', borderRadius: 8,
                    border: '1px solid var(--sc-border)', background: 'transparent',
                    color: 'var(--sc-text-2)', fontSize: 13, fontWeight: 400, textDecoration: 'none',
                  }}
                >
                  View billing
                </Link>
              </div>
            </>
          ) : (
            <>
              <RefreshCw size={22} style={{ color: 'var(--sc-teal)', marginBottom: 14 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 8 }}>
                Payment received.
              </p>
              <p style={{ fontSize: 13, color: 'var(--sc-text-2)' }}>
                We are confirming your plan. This usually takes a few seconds.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="sc-content sc-page-container">
      <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 32 }}>

        <div style={{ marginBottom: 28 }}>
          <CheckCircle size={28} style={{ color: 'var(--sc-teal)', marginBottom: 12 }} />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 8, letterSpacing: '-0.2px' }}>
            {firstName
              ? `${firstName}, you're upgraded to ${planLabel}.`
              : `You're upgraded to ${planLabel}.`}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sc-text-2)', lineHeight: 1.6 }}>
            Your plan is active. SoloChief is ready to help you manage commitments, focus, and
            follow-ups with your new features unlocked.
          </p>
        </div>

        <div
          className="sc-card"
          style={{ marginBottom: 20, borderColor: 'rgba(0,194,168,0.3)', background: 'rgba(0,194,168,0.04)' }}
        >
          <p className="sc-card-label" style={{ color: 'var(--sc-teal)', marginBottom: 10 }}>
            What&apos;s unlocked
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={13} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--sc-text-2)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link
            href="/dashboard/weekly-plan"
            style={{
              display: 'block', padding: '11px 16px', borderRadius: 8,
              background: 'var(--sc-teal)', color: '#fff',
              fontSize: 13, fontWeight: 600, textAlign: 'center', textDecoration: 'none',
            }}
          >
            Set this week&apos;s plan
          </Link>
          <Link
            href="/dashboard/chat"
            style={{
              display: 'block', padding: '10px 16px', borderRadius: 8,
              border: '1px solid var(--sc-border)', background: 'var(--sc-surface)',
              color: 'var(--sc-text)', fontSize: 13, fontWeight: 500,
              textAlign: 'center', textDecoration: 'none',
            }}
          >
            Ask SoloChief
          </Link>
          <Link
            href="/dashboard/settings?section=billing"
            style={{
              display: 'block', padding: '10px 16px', borderRadius: 8,
              border: '1px solid var(--sc-border)', background: 'transparent',
              color: 'var(--sc-text-2)', fontSize: 13, fontWeight: 400,
              textAlign: 'center', textDecoration: 'none',
            }}
          >
            Manage billing
          </Link>
        </div>

      </div>
    </div>
  )
}
