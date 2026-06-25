'use server'

import { createClient } from '@/lib/supabase/server'

function monthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export async function getChatUsageThisMonth(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('ai_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', monthStart())
  return count ?? 0
}

export async function getReviewSummaryUsageThisMonth(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('summary', 'is', null)
    .gte('completed_at', monthStart())
  return count ?? 0
}
