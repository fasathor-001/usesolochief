import { createClient } from '@/lib/supabase/server'
import { getPreferences } from '@/lib/actions/preferences'
import { getCurrentPlan } from '@/lib/actions/billing'
import { SettingsClient } from '@/components/settings/settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [preferences, profileRes, currentPlan] = await Promise.all([
    getPreferences(),
    supabase
      .from('profiles')
      .select('full_name, created_at')
      .eq('user_id', user!.id)
      .single(),
    getCurrentPlan(),
  ])

  return (
    <SettingsClient
      preferences={preferences}
      userEmail={user?.email ?? null}
      profile={profileRes.data}
      currentPlan={currentPlan}
    />
  )
}
