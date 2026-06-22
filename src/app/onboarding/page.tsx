import { OnboardingClient } from '@/components/onboarding/onboarding-client'

type Step = 1 | 2 | 3 | 4

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  const params = await searchParams
  const raw = parseInt(params.step ?? '1', 10)
  const initialStep = ([1, 2, 3, 4].includes(raw) ? raw : 1) as Step

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-6"
      style={{ backgroundColor: 'var(--sc-bg)' }}
    >
      <OnboardingClient initialStep={initialStep} />
    </div>
  )
}
