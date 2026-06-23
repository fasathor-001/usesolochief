'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import AuthBrandPanel from '@/components/auth/auth-brand-panel'

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
  }

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

          {sent ? (
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
                We sent a password reset link to <strong style={{ color: '#0D0D0D' }}>{email}</strong>.{' '}
                The link expires in 60 minutes.
              </p>
              <Link href="/auth/login" style={{ fontSize: '13px', color: '#00C2A8', textDecoration: 'none' }}>
                Back to sign in
              </Link>
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
                Reset your password
              </h2>
              <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                Enter your email and we will send you a link to reset your password.
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
                    style={inputStyle}
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
                      Send reset link
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ margin: '24px 0', borderTop: '0.5px solid #E2E8F0' }} />

              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', textAlign: 'center' }}>
                <Link href="/auth/login" style={{ color: '#00C2A8', textDecoration: 'none', fontWeight: 500 }}>
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
