'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserPreferences } from '@/types/database'

export async function getPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function upsertPreferences(preferences: Partial<{
  checkin_intensity: string
  preferred_channel: string
  communication_mode: string
  timezone: string
  working_day_start: string
  working_day_end: string
  quiet_hours_start: string
  quiet_hours_end: string
  switch_protection: string
  daily_focus_limit: string
  ai_interpretation: string
  advice_style: string
  show_confidence: boolean
  theme: string
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      { user_id: user.id, ...preferences, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function upsertProfile(profile: { full_name: string | null }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: profile.full_name, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
