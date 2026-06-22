'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'The sign-in link was invalid or has expired. Please request a new one.',
}

function LoginContent() {
  const searchParams = useSearchParams()
  const rawError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(
    rawError ? (ERROR_MESSAGES[rawError] ?? 'Something went wrong. Please try again.') : null
  )

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: supabaseError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (supabaseError) {
      setError(supabaseError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'var(--sc-teal-10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sc-teal)" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 8 }}>
          Check your email
        </h2>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)', lineHeight: 1.55 }}>
          A magic link was sent to <strong style={{ color: 'var(--sc-text)' }}>{email}</strong>. Click the link to sign in.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          style={{
            marginTop: 16,
            fontSize: 13,
            color: 'var(--sc-teal)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 20 }}>
        Sign in
      </h2>
      <form onSubmit={handleMagicLink}>
        <div className="sc-field">
          <label className="sc-label">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="sc-input"
          />
        </div>
        {error && (
          <p style={{ fontSize: 12, color: 'var(--sc-error)', marginBottom: 12 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !email}
          className="sc-btn sc-btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
        >
          {loading ? 'Sending link...' : 'Send magic link'}
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--sc-muted)' }}>
        No account?{' '}
        <Link href="/auth/signup" style={{ color: 'var(--sc-teal)', fontWeight: 500 }}>
          Sign up
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--sc-midnight)',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.2px' }}>
            SoloChief <span style={{ color: 'var(--sc-teal)' }}>AI</span>
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Your command centre for getting things done
          </p>
        </div>

        {/* Card */}
        <div
          className="sc-card"
          style={{ borderRadius: 'var(--sc-radius-lg)', padding: '28px 24px' }}
        >
          <Suspense fallback={<div style={{ height: 160 }} />}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
