import { PagePlaceholder } from '@/components/page-placeholder'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sc-background)' }}>
      <div className="w-full max-w-lg px-6">
        <PagePlaceholder
          title="Welcome to SoloChief"
          description="Coming soon — building now"
        />
      </div>
    </div>
  )
}
