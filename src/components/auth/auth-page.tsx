'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'The sign-in link was invalid or has expired. Please request a new one.',
}

interface AuthPageProps {
  mode: 'signin' | 'signup'
}

function AuthForm({ mode }: AuthPageProps) {
  const searchParams = useSearchParams()
  const rawError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string>(
    rawError ? (ERROR_MESSAGES[rawError] ?? 'Something went wrong. Please try again.') : '',
  )

  const isSignup = mode === 'signup'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`

    const { error: supabaseError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
        ...(isSignup ? { shouldCreateUser: true } : {}),
      },
    })

    setLoading(false)
    if (supabaseError) {
      // Rate-limit responses still send the email — treat them as success
      if (
        supabaseError.message.toLowerCase().includes('rate limit') ||
        supabaseError.message.toLowerCase().includes('already sent')
      ) {
        setSent(true)
      } else {
        setError(supabaseError.message)
      }
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px',
          background: 'rgba(0,194,168,0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <CheckCircle2 size={24} color="#00C2A8" />
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 500, color: '#0D0D0D' }}>
          Check your email
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
          We sent a magic link to <strong style={{ color: '#0D0D0D' }}>{email}</strong>.{' '}
          The link expires in 60 minutes — check your spam folder if you do not see it.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '13px',
            color: '#00C2A8',
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          Wrong email? Try again
        </button>
      </div>
    )
  }

  return (
    <>
      <h2 style={{
        margin: '0 0 8px',
        fontSize: '22px',
        fontWeight: 500,
        color: '#0D0D0D',
        letterSpacing: '-0.3px',
      }}>
        {isSignup ? 'Get started' : 'Welcome back'}
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
        {isSignup
          ? 'Enter your email and we will send you a magic link to get started.'
          : 'Enter your email and we will send you a magic link to sign in.'}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: '#64748B',
            marginBottom: '5px',
          }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoFocus
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '0.5px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#0D0D0D',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.12s',
            }}
            onFocus={e => (e.target.style.borderColor = '#00C2A8')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>

        {error && (
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#EF4444', lineHeight: 1.4 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: loading || !email.trim() ? '#94A3B8' : '#00C2A8',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.12s',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Sending...' : (
            <>
              {isSignup ? 'Get started' : 'Send magic link'}
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <div style={{ margin: '24px 0', borderTop: '0.5px solid #E2E8F0' }} />

      <p style={{ margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'center' }}>
        {isSignup ? (
          <>Already have an account?{' '}<Link href="/auth/login" style={{ color: '#00C2A8', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link></>
        ) : (
          <>New to SoloChief?{' '}<Link href="/auth/signup" style={{ color: '#00C2A8', textDecoration: 'none', fontWeight: 500 }}>Get started</Link></>
        )}
      </p>

      <p style={{
        margin: '20px 0 0',
        fontSize: '11px',
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        By continuing you agree to our{' '}
        <a href="/terms" style={{ color: '#64748B', textDecoration: 'none' }}>Terms</a>
        {' '}and{' '}
        <a href="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>.
      </p>
    </>
  )
}

export default function AuthPage({ mode }: AuthPageProps) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* LEFT PANEL — Brand */}
      <div
        className="sc-auth-brand"
        style={{
          flex: '0 0 55%',
          background: '#0F1B2D',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
        }}
      >
        {/* Logo */}
        <div>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#fff', letterSpacing: '-0.2px' }}>
            SoloChief <span style={{ color: '#00C2A8' }}>AI</span>
          </p>
        </div>

        {/* Centre content */}
        <div>
          <h1 style={{
            margin: '0 0 20px',
            fontSize: '36px',
            fontWeight: 500,
            color: '#fff',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            maxWidth: '480px',
          }}>
            Your personal Chief of Staff for commitments, focus, and follow-ups.
          </h1>

          <p style={{
            margin: '0 0 40px',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            maxWidth: '420px',
          }}>
            For anyone managing too many open loops across work and life — regardless of what you do or where you are in life.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'What deserves your attention today',
              'What can wait until later',
              'What must not slip through the cracks',
            ].map(line => (
              <div key={line} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '7px', height: '7px',
                  borderRadius: '50%',
                  background: '#00C2A8',
                  flexShrink: 0,
                }} />
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.6,
            fontStyle: 'italic',
            maxWidth: '400px',
          }}>
            &ldquo;Most productivity tools help you organise more work. SoloChief helps you decide what deserves attention &mdash; and what should wait.&rdquo;
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div
        className="sc-auth-form"
        style={{
          flex: '0 0 45%',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Small logo */}
          <p style={{
            margin: '0 0 40px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#0F1B2D',
            letterSpacing: '-0.1px',
          }}>
            SoloChief <span style={{ color: '#00C2A8' }}>AI</span>
          </p>

          <Suspense fallback={<div style={{ height: 240 }} />}>
            <AuthForm mode={mode} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
