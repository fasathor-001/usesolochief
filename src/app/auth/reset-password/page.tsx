'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import AuthBrandPanel from '@/components/auth/auth-brand-panel'

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

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  color: '#94A3B8',
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || !confirmPassword) return

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message || 'Failed to update password. Please try again.')
      } else {
        router.replace('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !password || !confirmPassword

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

          {!ready ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: '14px', color: '#64748B' }}>Verifying your reset link…</p>
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
                Set a new password
              </h2>
              <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                Choose a new password for your account.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>New password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoFocus
                      required
                      style={{ ...inputStyle, paddingRight: '40px' }}
                      onFocus={e => (e.target.style.borderColor = '#00C2A8')}
                      onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} style={eyeBtnStyle}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Confirm new password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                      style={{ ...inputStyle, paddingRight: '40px' }}
                      onFocus={e => (e.target.style.borderColor = '#00C2A8')}
                      onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} style={eyeBtnStyle}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
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
                  {loading ? 'Updating...' : (
                    <>
                      Set new password
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
