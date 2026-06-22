import { createClient } from '@/lib/supabase/server'
import { getFollowUps } from '@/lib/actions/follow-ups'
import { FollowUpsClient } from '@/components/follow-ups/follow-ups-client'
import type { Commitment } from '@/types/database'

export default async function FollowUpsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [followupsResult, commitmentsResult] = await Promise.all([
    getFollowUps(),
    user
      ? supabase
          .from('commitments')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('priority')
      : Promise.resolve({ data: null }),
  ])

  if (followupsResult.error) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: '#EF4444' }}>Failed to load follow-ups: {followupsResult.error}</p>
      </div>
    )
  }

  return (
    <FollowUpsClient
      initialFollowups={followupsResult.data ?? []}
      commitments={(commitmentsResult.data ?? []) as Commitment[]}
    />
  )
}
