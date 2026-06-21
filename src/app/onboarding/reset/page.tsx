'use client'

// Development only — remove before launch

import { useTransition } from 'react'
import { resetOnboarding } from '@/lib/actions/onboarding-reset'

export default function OnboardingResetPage() {
  const [isPending, startTransition] = useTransition()

  function handleReset() {
    if (!window.confirm('This will soft-delete all your commitments and weekly plans, then restart onboarding. Continue?')) return
    startTransition(async () => {
      await resetOnboarding()
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--sc-background)' }}
    >
      <div className="w-full max-w-sm text-center">
        <p
          className="text-xs font-medium uppercase tracking-widest mb-4"
          style={{ color: '#EF4444' }}
        >
          Development only
        </p>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--sc-text)' }}>
          Reset Onboarding
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--sc-muted)' }}>
          Soft-deletes all commitments and weekly plans for the current account, then
          redirects to the onboarding flow. Use this to test onboarding without creating
          a new email address.
        </p>
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#EF4444', color: '#fff' }}
        >
          {isPending ? 'Resetting...' : 'Reset and restart onboarding'}
        </button>
        <a
          href="/dashboard"
          className="block mt-4 text-sm"
          style={{ color: 'var(--sc-muted)' }}
        >
          Cancel — go to dashboard
        </a>
      </div>
    </div>
  )
}
