'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

interface SigninFormInnerProps {
  initialError?: string
}

function SigninFormInner({ initialError = '' }: SigninFormInnerProps) {
  const router = useRouter()
  const safeInitialError = typeof initialError === 'string' ? initialError : ''

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [emailLinkLoading, setEmailLinkLoading] = useState(false)
  const [emailLinkSent, setEmailLinkSent] = useState(false)

  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const [authError, setAuthError] = useState<string>(
    safeInitialError ? (ERROR_MESSAGES[safeInitialError] ?? 'Something went wrong. Please try again.') : '',
  )
  const [emailFieldError, setEmailFieldError] = useState('')
  const [passwordFieldError, setPasswordFieldError] = useState('')

  const emailRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)

  function clearErrors() {
    setAuthError('')
    setEmailFieldError('')
    setPasswordFieldError('')
    setCodeError('')
  }

  function switchMode(next: Mode) {
    setMode(next)
    setEmailLinkSent(false)
    setCode('')
    setResendSent(false)
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
      const errorMsg = typeof signInError.message === 'string' ? signInError.message : 'We could not sign you in with those details. Check your email and password, or use a secure email link.'
      setAuthError(errorMsg)
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
    console.log('[Auth] Sending magic link for email:', email.trim())
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    })
    setEmailLinkLoading(false)
    if (otpError) {
      console.error('[Auth] Magic link send failed:', {
        error: otpError,
        message: otpError.message,
        status: otpError.status,
        email: email.trim(),
      })
      const otpMsg = typeof otpError.message === 'string' ? otpError.message : ''
      if (otpMsg.toLowerCase().includes('rate limit')) {
        // Still show code entry — a previous email was likely sent
        setEmailLinkSent(true)
        setCode('')
        setResendSent(false)
        setCodeError('You have requested several sign-in emails recently. Check your inbox for the most recent one.')
        setTimeout(() => codeRef.current?.focus(), 50)
      } else {
        setAuthError('We could not send a sign-in email. Please try again.')
      }
    } else {
      console.log('[Auth] Magic link sent successfully to:', email.trim())
      setEmailLinkSent(true)
      setCode('')
      setResendSent(false)
      setTimeout(() => codeRef.current?.focus(), 50)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) { setCodeError('Enter the verification code from your email.'); return }
    if (trimmed.length !== 6) { setCodeError('The code should be 6 digits.'); return }
    setVerifyLoading(true)
    setCodeError('')
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: trimmed,
      type: 'email',
    })
    setVerifyLoading(false)
    if (verifyError) {
      const verifyMsg = typeof verifyError.message === 'string' ? verifyError.message : 'That code did not work. Check the code and try again, or request a new email.'
      setCodeError(verifyMsg)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleResend() {
    setResendLoading(true)
    setResendSent(false)
    setCodeError('')
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    })
    setResendLoading(false)
    setResendSent(true)
    setCode('')
    setTimeout(() => codeRef.current?.focus(), 50)
  }

  // ── Email-link: code entry ──────────────────────────────────────────
  if (mode === 'email-link' && emailLinkSent) {
    return (
      <>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 500, color: '#0D0D0D', letterSpacing: '-0.3px' }}>
          Check your email
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
          We sent a secure sign-in link and code to{' '}
          <strong style={{ color: '#0D0D0D' }}>{email}</strong>.
          Open the link or enter the code below to continue.
        </p>

        <form onSubmit={handleVerifyCode} noValidate>
          <div style={{ marginBottom: codeError ? 4 : 20 }}>
            <label style={labelStyle}>Verification code</label>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setCodeError('') }}
              placeholder="000000"
              autoFocus
              style={{
                ...inputBase,
                fontSize: '22px',
                letterSpacing: '0.25em',
                textAlign: 'center',
                borderColor: codeError ? '#EF4444' : '#E2E8F0',
              }}
              onFocus={e => { e.target.style.borderColor = codeError ? '#EF4444' : '#00C2A8' }}
              onBlur={e => { e.target.style.borderColor = codeError ? '#EF4444' : '#E2E8F0' }}
            />
            {codeError && <FieldError msg={codeError} />}
          </div>

          <button
            type="submit"
            disabled={verifyLoading}
            style={{ ...primaryBtn, background: verifyLoading ? '#94A3B8' : '#00C2A8', cursor: verifyLoading ? 'not-allowed' : 'pointer' }}
          >
            {verifyLoading ? 'Verifying…' : 'Verify code'}
          </button>
        </form>

        <div style={{ margin: '16px 0', borderTop: '0.5px solid #E2E8F0' }} />

        {resendSent && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#00C2A8' }}>
              We sent a new sign-in email to {email}.
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
              Use the latest code we sent. Older codes may no longer work.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            style={{ ...ghostBtn, opacity: resendLoading ? 0.6 : 1, cursor: resendLoading ? 'not-allowed' : 'pointer' }}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending…' : 'Resend email'}
          </button>
          <button
            type="button"
            style={ghostBtn}
            onClick={() => {
              setEmailLinkSent(false)
              setEmail('')
              setCode('')
              setCodeError('')
              setResendSent(false)
              setTimeout(() => emailRef.current?.focus(), 50)
            }}
          >
            Use a different email
          </button>
          <button type="button" style={ghostBtn} onClick={() => switchMode('password')}>
            Use password instead
          </button>
        </div>

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

interface SigninFormProps {
  initialError?: string
}

export default function SigninForm({ initialError = '' }: SigninFormProps) {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 500,
              color: '#0F1B2D',
              letterSpacing: '-0.1px',
            }}>
              SoloChief <span style={{ color: '#00C2A8' }}>AI</span>
            </p>
            <a href="https://usesolochief.com" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>
              ← Back to site
            </a>
          </div>

          <SigninFormInner initialError={initialError} />
        </div>
      </div>
    </div>
  )
}
