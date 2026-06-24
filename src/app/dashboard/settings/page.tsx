import { createClient } from '@/lib/supabase/server'
import { getPreferences } from '@/lib/actions/preferences'
import { getCurrentPlan } from '@/lib/actions/billing'
import { SettingsClient } from '@/components/settings/settings-client'
import { getUserAgentStates } from '@/lib/actions/mdp'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [preferences, profileRes, currentPlan, notifRes, agentStates] = await Promise.all([
    getPreferences(),
    supabase
      .from('profiles')
      .select('full_name, created_at, plan_expires_at, plan_cancelled_at, whatsapp_number, whatsapp_verified')
      .eq('user_id', user!.id)
      .single(),
    getCurrentPlan(),
    supabase
      .from('notification_preferences')
      .select('whatsapp_notifications_enabled')
      .eq('user_id', user!.id)
      .maybeSingle(),
    getUserAgentStates(user!.id),
  ])

  // A user has a password if they have an email identity (created via signUp with password).
  // Magic-link-only accounts also get an email identity in Supabase, but in SoloChief all
  // accounts created through normal signup have a password. Admin-invited or OTP-only accounts
  // won't have an email identity at all, so this check is the best available heuristic.
  const hasPasswordProvider = user?.identities?.some(i => i.provider === 'email') ?? false

  return (
    <SettingsClient
      preferences={preferences}
      userEmail={user?.email ?? null}
      profile={profileRes.data}
      currentPlan={currentPlan}
      hasPasswordProvider={hasPasswordProvider}
      whatsappNumber={profileRes.data?.whatsapp_number ?? null}
      whatsappVerified={profileRes.data?.whatsapp_verified ?? false}
      whatsappNotificationsEnabled={notifRes.data?.whatsapp_notifications_enabled ?? true}
      agentStates={agentStates}
    />
  )
}
