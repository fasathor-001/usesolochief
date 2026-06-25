import { createClient } from '@/lib/supabase/server'
import { ChatClient } from '@/components/chat/chat-client'
import { getAIChatLimit } from '@/lib/plan-limits'

function monthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export default async function AIChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialMessages: { id: string; role: 'user' | 'assistant'; content: string }[] = []
  let mainFocus: string | null = null
  let overdueCount = 0
  let dueTodayCount = 0
  let plan = 'free'
  let chatUsedThisMonth = 0

  if (user) {
    const today = new Date().toISOString().split('T')[0]

    const [historyResult, planResult, followupsResult, profileResult, usageResult] = await Promise.all([
      supabase
        .from('ai_messages')
        .select('id, role, content')
        .eq('user_id', user.id)
        .in('role', ['user', 'assistant'])
        .order('created_at', { ascending: false })
        .limit(20),

      supabase
        .from('weekly_plans')
        .select('main_focus_commitment_id')
        .eq('user_id', user.id)
        .not('locked_at', 'is', null)
        .order('week_start', { ascending: false })
        .limit(1),

      supabase
        .from('followups')
        .select('due_date')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .is('deleted_at', null)
        .lte('due_date', today),

      supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single(),

      supabase
        .from('ai_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', monthStart()),
    ])

    initialMessages = ((historyResult.data ?? []).reverse() as { id: string; role: 'user' | 'assistant'; content: string }[])

    const focusId = planResult.data?.[0]?.main_focus_commitment_id
    if (focusId) {
      const { data: commit } = await supabase
        .from('commitments')
        .select('title')
        .eq('id', focusId)
        .single()
      mainFocus = commit?.title ?? null
    }

    const followups = followupsResult.data ?? []
    overdueCount = followups.filter(f => f.due_date < today).length
    dueTodayCount = followups.filter(f => f.due_date === today).length

    plan = profileResult.data?.plan ?? 'free'
    chatUsedThisMonth = usageResult.count ?? 0
  }

  const chatLimit = getAIChatLimit(plan)

  return (
    <ChatClient
      initialMessages={initialMessages}
      mainFocus={mainFocus}
      overdueCount={overdueCount}
      dueTodayCount={dueTodayCount}
      plan={plan}
      chatUsedThisMonth={chatUsedThisMonth}
      chatLimit={chatLimit}
    />
  )
}
