import { createClient } from '@/lib/supabase/server'
import { ChatClient } from '@/components/chat/chat-client'

export default async function AIChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialMessages: { id: string; role: 'user' | 'assistant'; content: string }[] = []

  if (user) {
    const { data: history } = await supabase
      .from('ai_messages')
      .select('id, role, content')
      .eq('user_id', user.id)
      .in('role', ['user', 'assistant'])
      .order('created_at', { ascending: false })
      .limit(20)

    initialMessages = ((history ?? []).reverse() as { id: string; role: 'user' | 'assistant'; content: string }[])
  }

  return (
    <div className="h-full flex flex-col">
      <ChatClient initialMessages={initialMessages} />
    </div>
  )
}
