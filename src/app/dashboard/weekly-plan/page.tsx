import { getOrCreateWeeklyPlan } from '@/lib/actions/weekly-plan'
import { WeeklyPlanClient } from '@/components/weekly-plan/weekly-plan-client'

export default async function WeeklyPlanPage() {
  const { data, error } = await getOrCreateWeeklyPlan()

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: 'var(--sc-error)' }}>
          Failed to load weekly plan: {error}
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>
          Unable to load weekly plan. Please refresh.
        </p>
      </div>
    )
  }

  return (
    <WeeklyPlanClient
      plan={data.plan}
      outcomes={data.outcomes}
      commitments={data.commitments}
      stopItems={data.stopItems}
      followups={data.followups}
    />
  )
}
