import { OnboardingClient } from '@/components/onboarding/onboarding-client'

export default function OnboardingPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-6"
      style={{ backgroundColor: 'var(--sc-background)' }}
    >
      <OnboardingClient />
    </div>
  )
}
