import { createClient } from '@/lib/supabase/server'
import { getPreferences } from '@/lib/actions/preferences'
import { SettingsClient } from '@/components/settings/settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [preferences, profileRes] = await Promise.all([
    getPreferences(),
    supabase
      .from('profiles')
      .select('full_name, created_at')
      .eq('user_id', user!.id)
      .single(),
  ])

  return (
    <SettingsClient
      preferences={preferences}
      userEmail={user?.email ?? null}
      profile={profileRes.data}
    />
  )
}
