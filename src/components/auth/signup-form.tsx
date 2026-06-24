'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import AuthBrandPanel from './auth-brand-panel'

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#64748B',
  marginBottom: '5px',
}

export default function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password) return
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      return
    }

    setConfirmationSent(true)
  }

  const isDisabled = loading || !fullName.trim() || !email.trim() || !password

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

          {confirmationSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '52px', height: '52px',
                background: 'rgba(0,194,168,0.10)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle2 size={24} color="#00C2A8" />
              </div>
              <h2 style={{
                margin: '0 0 8px',
                fontSize: '20px', fontWeight: 500, color: '#0D0D0D',
              }}>
                Check your email
              </h2>
              <p style={{
                margin: '0 0 16px',
                fontSize: '14px', color: '#64748B', lineHeight: 1.6,
              }}>
                We sent a confirmation link to{' '}
                <strong style={{ color: '#0D0D0D' }}>{email}</strong>.
                Click it to activate your account and get started.
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                The link expires in 60 minutes. Check your spam folder if you do not see it.
              </p>
              <button
                onClick={() => { setConfirmationSent(false); setEmail(''); setPassword(''); setFullName('') }}
                style={{
                  marginTop: '20px',
                  background: 'none', border: 'none',
                  fontSize: '13px', color: '#00C2A8',
                  cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                }}
              >
                Wrong email? Try again
              </button>
            </div>
          ) : (
            <>
              <h2 style={{
                margin: '0 0 8px',
                fontSize: '22px',
                fontWeight: 500,
                color: '#0D0D0D',
                letterSpacing: '-0.3px',
              }}>
                Create your account
              </h2>
              <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                Start with your commitments. No setup complexity.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    required
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#00C2A8')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#00C2A8')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
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

                {typeof error === 'string' && error.length > 0 && (
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
                  {loading ? 'Creating account...' : (
                    <>
                      Create account
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ margin: '24px 0', borderTop: '0.5px solid #E2E8F0' }} />

              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ color: '#00C2A8', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in
                </Link>
              </p>

              <p style={{
                margin: '20px 0 0',
                fontSize: '11px',
                color: '#94A3B8',
                textAlign: 'center',
                lineHeight: 1.5,
              }}>
                By creating an account you agree to our{' '}
                <a href="/terms" style={{ color: '#64748B', textDecoration: 'none' }}>Terms</a>
                {' '}and{' '}
                <a href="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
