'use client'

import { useTransition } from 'react'
import { resetOnboarding } from '@/lib/actions/onboarding-reset'

export function ResetButton() {
  const [isPending, startTransition] = useTransition()

  function handleReset() {
    if (!window.confirm('This will soft-delete all your commitments and weekly plans, then restart onboarding. Continue?')) return
    startTransition(async () => {
      await resetOnboarding()
    })
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isPending}
      className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
      style={{ backgroundColor: '#EF4444', color: '#fff' }}
    >
      {isPending ? 'Resetting...' : 'Reset and restart onboarding'}
    </button>
  )
}
