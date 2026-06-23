'use client'

import { useState, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import AuthBrandPanel from './auth-brand-panel'

type Mode = 'password' | 'email-link'

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

const inputBase: React.CSSProperties = {
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

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '11px 16px',
  background: '#00C2A8',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  transition: 'background 0.12s',
  fontFamily: 'inherit',
}

const ghostBtn: React.CSSProperties = {
  width: '100%',
  padding: '10px 16px',
  background: 'transparent',
  border: '0.5px solid #E2E8F0',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#64748B',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'border-color 0.12s',
}

const divider = <div style={{ margin: '20px 0', borderTop: '0.5px solid #E2E8F0' }} />

const signupFooter = (
  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'center' }}>
    New to SoloChief?{' '}
    <Link href="/auth/signup" style={{ color: '#00C2A8', textDecoration: 'none', fontWeight: 500 }}>
      Create an account
    </Link>
  </p>
)

function FieldError({ msg }: { msg: string }) {
  return (
    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#EF4444', lineHeight: 1.4 }}>{msg}</p>
  )
}

function SigninFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawError = searchParams.get('error')

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [emailLinkLoading, setEmailLinkLoading] = useState(false)
  const [emailLinkSent, setEmailLinkSent] = useState(false)

  const [authError, setAuthError] = useState<string>(
    rawError ? (ERROR_MESSAGES[rawError] ?? 'Something went wrong. Please try again.') : '',
  )
  const [emailFieldError, setEmailFieldError] = useState('')
  const [passwordFieldError, setPasswordFieldError] = useState('')

  const emailRef = useRef<HTMLInputElement>(null)

  function clearErrors() {
    setAuthError('')
    setEmailFieldError('')
    setPasswordFieldError('')
  }

  function switchMode(next: Mode) {
    setMode(next)
    setEmailLinkSent(false)
    clearErrors()
    setTimeout(() => emailRef.current?.focus(), 50)
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    let hasError = false
    if (!email.trim()) { setEmailFieldError('Enter your email address.'); hasError = true }
    else setEmailFieldError('')
    if (!password) { setPasswordFieldError('Enter your password.'); hasError = true }
    else setPasswordFieldError('')
    if (hasError) return

    setLoading(true)
    setAuthError('')
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (signInError) {
      setAuthError('We could not sign you in with those details. Check your email and password, or use a secure email link.')
    } else {
      router.push('/dashboard')
    }
  }

  async function handleSendEmailLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setEmailFieldError('Enter your email address to receive a secure sign-in link.')
      return
    }
    setEmailFieldError('')
    setEmailLinkLoading(true)
    setAuthError('')
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    setEmailLinkLoading(false)
    if (otpError && !otpError.message.toLowerCase().includes('rate limit')) {
      setAuthError(otpError.message)
    } else {
      setEmailLinkSent(true)
    }
  }

  // ── Email-link success ──────────────────────────────────────────────
  if (mode === 'email-link' && emailLinkSent) {
    return (
      <>
        <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 500, color: '#0D0D0D', letterSpacing: '-0.3px' }}>
          Check your email
        </h2>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '14px', marginBottom: '20px',
          background: 'rgba(0,194,168,0.06)', borderRadius: '8px',
          border: '0.5px solid rgba(0,194,168,0.2)',
        }}>
          <CheckCircle2 size={15} color="#00C2A8" style={{ marginTop: '1px', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
            We sent a secure sign-in link to{' '}
            <strong style={{ color: '#0D0D0D' }}>{email}</strong>.
            Open it to continue to SoloChief.
          </p>
        </div>
        <button
          type="button"
          style={ghostBtn}
          onClick={() => { setEmailLinkSent(false); setEmail(''); setTimeout(() => emailRef.current?.focus(), 50) }}
        >
          Use a different email
        </button>
        {divider}
        {signupFooter}
      </>
    )
  }

  // ── Email-link form ─────────────────────────────────────────────────
  if (mode === 'email-link') {
    return (
      <>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 500, color: '#0D0D0D', letterSpacing: '-0.3px' }}>
          Sign in with email link
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
          Enter your email and we will send you a secure link to access SoloChief.
        </p>

        <form onSubmit={handleSendEmailLink} noValidate>
          <div style={{ marginBottom: emailFieldError ? 4 : 20 }}>
            <label style={labelStyle}>Email address</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailFieldError('') }}
              placeholder="your@email.com"
              autoFocus
              style={{ ...inputBase, borderColor: emailFieldError ? '#EF4444' : '#E2E8F0' }}
              onFocus={e => { e.target.style.borderColor = emailFieldError ? '#EF4444' : '#00C2A8' }}
              onBlur={e => { e.target.style.borderColor = emailFieldError ? '#EF4444' : '#E2E8F0' }}
            />
            {emailFieldError && <FieldError msg={emailFieldError} />}
          </div>

          {authError && (
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#EF4444', lineHeight: 1.4 }}>{authError}</p>
          )}

          <button type="submit" disabled={emailLinkLoading} style={{ ...primaryBtn, background: emailLinkLoading ? '#94A3B8' : '#00C2A8', cursor: emailLinkLoading ? 'not-allowed' : 'pointer' }}>
            {emailLinkLoading ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>

        <div style={{ margin: '16px 0', borderTop: '0.5px solid #E2E8F0' }} />

        <button type="button" style={ghostBtn} onClick={() => switchMode('password')}>
          Use password instead
        </button>

        {divider}
        {signupFooter}
      </>
    )
  }

  // ── Password form (default) ─────────────────────────────────────────
  return (
    <>
      <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 500, color: '#0D0D0D', letterSpacing: '-0.3px' }}>
        Welcome back
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
        Sign in to continue managing your commitments.
      </p>

      <form onSubmit={handlePasswordSignIn} noValidate>
        <div style={{ marginBottom: emailFieldError ? 4 : 12 }}>
          <label style={labelStyle}>Email address</label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailFieldError('') }}
            placeholder="your@email.com"
            autoFocus
            style={{ ...inputBase, borderColor: emailFieldError ? '#EF4444' : '#E2E8F0' }}
            onFocus={e => { e.target.style.borderColor = emailFieldError ? '#EF4444' : '#00C2A8' }}
            onBlur={e => { e.target.style.borderColor = emailFieldError ? '#EF4444' : '#E2E8F0' }}
          />
          {emailFieldError && <FieldError msg={emailFieldError} />}
        </div>

        <div style={{ marginBottom: passwordFieldError ? 4 : 0 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordFieldError('') }}
              placeholder="Your password"
              style={{ ...inputBase, paddingRight: '40px', borderColor: passwordFieldError ? '#EF4444' : '#E2E8F0' }}
              onFocus={e => { e.target.style.borderColor = passwordFieldError ? '#EF4444' : '#00C2A8' }}
              onBlur={e => { e.target.style.borderColor = passwordFieldError ? '#EF4444' : '#E2E8F0' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8',
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {passwordFieldError && <FieldError msg={passwordFieldError} />}
        </div>

        <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: passwordFieldError ? '4px' : '4px' }}>
          <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: '#64748B', textDecoration: 'none' }}>
            Forgot your password?
          </Link>
        </div>

        {authError && (
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#EF4444', lineHeight: 1.4 }}>{authError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ ...primaryBtn, background: loading ? '#94A3B8' : '#00C2A8', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={15} /></>}
        </button>
      </form>

      {divider}

      <button type="button" style={ghostBtn} onClick={() => switchMode('email-link')}>
        Sign in with a secure email link
      </button>

      {divider}
      {signupFooter}
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
