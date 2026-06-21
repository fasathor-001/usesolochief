'use server'

// Development only — remove before launch

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function resetOnboarding(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Soft-delete all commitments
  await supabase
    .from('commitments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('deleted_at', null)

  // Delete all weekly plans for this user
  await supabase
    .from('weekly_plans')
    .delete()
    .eq('user_id', user.id)

  // Clear onboarded_at so the profile is clean
  await supabase
    .from('profiles')
    .update({ onboarded_at: null })
    .eq('user_id', user.id)

  redirect('/onboarding')
}
