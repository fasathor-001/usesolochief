import { getTodayData } from '@/lib/actions/today'
import { TodayClient } from '@/components/today/today-client'

export default async function TodayPage() {
  const { data, error } = await getTodayData()

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: 'var(--sc-error)' }}>
          Failed to load today&apos;s data: {error}
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>
          Unable to load today&apos;s focus. Please refresh.
        </p>
      </div>
    )
  }

  return (
    <TodayClient
      plan={data.plan}
      focusCommitment={data.focusCommitment}
      todayLog={data.todayLog}
      notTodayItems={data.notTodayItems}
      followupsDue={data.followupsDue}
      stopItems={data.stopItems}
      allCommitments={data.allCommitments}
    />
  )
}
