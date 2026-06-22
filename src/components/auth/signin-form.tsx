'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import AuthBrandPanel from './auth-brand-panel'

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'The sign-in link was invalid or has expired. Please try again.',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#64748B',
  marginBottom: '5px',
}

const inputStyle: React.CSSProperties = {
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
}

function SigninFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>(
    rawError ? (ERROR_MESSAGES[rawError] ?? 'Something went wrong. Please try again.') : '',
  )
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }
    setMagicLinkLoading(true)
    setError('')

    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    setMagicLinkLoading(false)

    if (otpError && !otpError.message.toLowerCase().includes('rate limit')) {
      setError(otpError.message)
    } else {
      setMagicLinkSent(true)
    }
  }

  const isDisabled = loading || !email.trim() || !password

  return (
    <>
      <h2 style={{
        margin: '0 0 8px',
        fontSize: '22px',
        fontWeight: 500,
        color: '#0D0D0D',
        letterSpacing: '-0.3px',
      }}>
        Welcome back
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
        Sign in to continue managing your commitments.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoFocus
            required
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#00C2A8')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>

        <div style={{ marginBottom: '4px' }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
              style={{ ...inputStyle, paddingRight: '40px' }}
              onFocus={e => (e.target.style.borderColor = '#00C2A8')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#94A3B8',
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: '#64748B', textDecoration: 'none' }}>
            Forgot your password?
          </Link>
        </div>

        {error && (
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#EF4444', lineHeight: 1.4 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: isDisabled ? '#94A3B8' : '#00C2A8',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.12s',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Signing in...' : (
            <>
              Sign in
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <div style={{ margin: '20px 0', borderTop: '0.5px solid #E2E8F0' }} />

      <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94A3B8' }}>
        Or sign in with a secure email link:
      </p>

      {magicLinkSent ? (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '12px',
          background: 'rgba(0,194,168,0.06)',
          borderRadius: '8px',
          border: '0.5px solid rgba(0,194,168,0.2)',
        }}>
          <CheckCircle2 size={15} color="#00C2A8" style={{ marginTop: '1px', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
            Check your email — we sent a secure sign-in link to <strong style={{ color: '#0D0D0D' }}>{email}</strong>.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleMagicLink}
          disabled={magicLinkLoading}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'transparent',
            border: '0.5px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748B',
            cursor: magicLinkLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'border-color 0.12s',
          }}
        >
          {magicLinkLoading ? 'Sending...' : 'Send sign-in link'}
        </button>
      )}

      <div style={{ margin: '20px 0', borderTop: '0.5px solid #E2E8F0' }} />

      <p style={{ margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'center' }}>
        New to SoloChief?{' '}
        <Link href="/auth/signup" style={{ color: '#00C2A8', textDecoration: 'none', fontWeight: 500 }}>
          Create an account
        </Link>
      </p>
    </>
  )
}

export default function SigninForm() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <AuthBrandPanel />

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
          <p style={{
            margin: '0 0 40px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#0F1B2D',
            letterSpacing: '-0.1px',
          }}>
            SoloChief <span style={{ color: '#00C2A8' }}>AI</span>
          </p>

          <Suspense fallback={<div style={{ height: 320 }} />}>
            <SigninFormInner />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
