'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitFeedback(data: {
  type: string
  message: string
  page?: string
}): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    email: user.email ?? '',
    type: data.type,
    message: data.message,
    page: data.page ?? null,
  })

  if (error) {
    console.error('[feedback] submit failed for user:', user.id)
    throw new Error('Failed to submit feedback')
  }
}
