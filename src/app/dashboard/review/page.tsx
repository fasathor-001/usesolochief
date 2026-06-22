import { getReviewPageData } from '@/lib/actions/reviews'
import { ReviewClient } from '@/components/review/review-client'
import { getWeekStart } from '@/lib/utils/date-utils'

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00Z')
  const end = new Date(weekStart + 'T12:00:00Z')
  end.setUTCDate(start.getUTCDate() + 6)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[start.getUTCDay()]} ${start.getUTCDate()} ${months[start.getUTCMonth()]} — ${days[end.getUTCDay()]} ${end.getUTCDate()} ${months[end.getUTCMonth()]} ${end.getUTCFullYear()}`
}

export default async function FridayReviewPage() {
  const { data, error } = await getReviewPageData()

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: '#EF4444' }}>Failed to load review: {error}</p>
      </div>
    )
  }

  const weekStart = getWeekStart()
  const weekRange = formatWeekRange(weekStart)

  return (
    <ReviewClient
      plan={data.plan}
      outcomes={data.outcomes}
      overdueFollowups={data.overdueFollowups}
      parkingItemsThisWeek={data.parkingItemsThisWeek}
      commitments={data.commitments}
      existingReview={data.existingReview}
      weekRange={weekRange}
    />
  )
}
