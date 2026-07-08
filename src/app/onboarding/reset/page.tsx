import { redirect } from 'next/navigation'
import { ResetButton } from './reset-button'

export default function OnboardingResetPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--sc-background)' }}
    >
      <div className="w-full max-w-sm">
        {/* Warning banner */}
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-lg border mb-8 text-sm"
          style={{ borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
        >
          <span className="shrink-0">⚠</span>
          <span>Development only — this page resets all your data permanently.</span>
        </div>

        <div className="text-center">
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

          <ResetButton />

          <a
            href="/dashboard"
            className="block mt-4 text-sm"
            style={{ color: 'var(--sc-muted)' }}
          >
            Cancel — go to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
