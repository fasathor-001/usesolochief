'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sc-background)' }}>
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--sc-primary)' }}>
            SoloChief
          </h1>
          <p style={{ color: 'var(--sc-muted)' }}>Your command centre for getting things done</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8" style={{ borderColor: 'var(--sc-border)' }}>
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--sc-primary)' }}>
                Check your email
              </h2>
              <p style={{ color: 'var(--sc-muted)' }}>
                We&apos;ve sent a magic link to <strong>{email}</strong>. Click the link to sign in.
              </p>
              <button
                className="mt-4 text-sm underline"
                style={{ color: 'var(--sc-accent)' }}
                onClick={() => setSent(false)}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--sc-primary)' }}>
                Sign in
              </h2>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sc-text)' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--sc-border)',
                      color: 'var(--sc-text)',
                      '--tw-ring-color': 'var(--sc-accent)',
                    } as React.CSSProperties}
                  />
                </div>
                {error && (
                  <p className="text-sm" style={{ color: 'var(--sc-error)' }}>{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full text-white font-medium py-2"
                  style={{ backgroundColor: 'var(--sc-accent)', borderColor: 'var(--sc-accent)' }}
                >
                  {loading ? 'Sending link…' : 'Send magic link'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm" style={{ color: 'var(--sc-muted)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" style={{ color: 'var(--sc-accent)' }} className="font-medium">
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
