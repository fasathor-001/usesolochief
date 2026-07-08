export interface ProfileWithPlan {
  plan: string | null
  whatsapp_trial_ends_at?: string | null
}

export function hasWhatsAppAccess(profile: ProfileWithPlan): boolean {
  if (!profile) return false

  const plan = profile.plan
  if (plan === 'pro' || plan === 'operator') return true

  if (profile.whatsapp_trial_ends_at) {
    const trialEndsAt = new Date(profile.whatsapp_trial_ends_at)
    return trialEndsAt > new Date()
  }

  return false
}
