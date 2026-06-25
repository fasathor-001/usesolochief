import { createClient } from '@/lib/supabase/server'

export type OnboardingStep = 'consent' | 'quiet_hours' | 'briefing_time' | 'complete'

// Import message templates
import {
  consentMessage,
  quietHoursMessage,
  briefingTimeMessage,
  completeMessage,
  skippedMessage,
} from './templates'

/**
 * Handle an onboarding reply and advance the state machine.
 * Returns the message to send to the user.
 */
export async function handleOnboardingReply(
  userId: string,
  currentStep: OnboardingStep,
  body: string,
): Promise<string> {
  const supabase = await createClient()
  const reply = body.trim()
  const lower = reply.toLowerCase()

  // Consent step: expect 1 or 2
  if (currentStep === 'consent') {
    if (reply === '1') {
      // Advance to quiet_hours
      await supabase
        .from('profiles')
        .update({ whatsapp_onboarding_step: 'quiet_hours', whatsapp_consent_at: new Date().toISOString() })
        .eq('user_id', userId)

      return quietHoursMessage()
    } else if (reply === '2') {
      // Skip onboarding
      await supabase
        .from('profiles')
        .update({ whatsapp_onboarding_step: null })
        .eq('user_id', userId)

      return skippedMessage()
    }
    // Invalid reply
    return consentMessage()
  }

  // Quiet hours step: expect 1-4
  if (currentStep === 'quiet_hours') {
    if (reply === '1') {
      // 9pm to 7am (default)
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: 21,
          whatsapp_quiet_end: 7,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return briefingTimeMessage()
    } else if (reply === '2') {
      // 10pm to 8am
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: 22,
          whatsapp_quiet_end: 8,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return briefingTimeMessage()
    } else if (reply === '3') {
      // 11pm to 6am
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: 23,
          whatsapp_quiet_end: 6,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return briefingTimeMessage()
    } else if (reply === '4') {
      // No quiet hours
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: null,
          whatsapp_quiet_end: null,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return briefingTimeMessage()
    }
    // Invalid reply
    return quietHoursMessage()
  }

  // Briefing time step: expect 1-4
  if (currentStep === 'briefing_time') {
    if (reply === '1') {
      // 6am
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: 6,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId)
    } else if (reply === '2') {
      // 7am
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: 7,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId)
    } else if (reply === '3') {
      // 8am
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: 8,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId)
    } else if (reply === '4') {
      // No morning briefing
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: null,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId)
    }
    // Invalid reply
    return briefingTimeMessage()
  }

  // Should not reach here, but default to consent
  return consentMessage()
}

/**
 * Start onboarding for a user. Sets step to 'consent' and returns the consent message.
 */
export async function startOnboarding(userId: string): Promise<string> {
  const supabase = await createClient()

  await supabase
    .from('profiles')
    .update({ whatsapp_onboarding_step: 'consent' })
    .eq('user_id', userId)

  return consentMessage()
}

/**
 * Get the complete message with user's name
 */
async function getCompleteMessage(userId: string): Promise<string> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', userId)
    .maybeSingle()

  const name = profile?.full_name ? profile.full_name.split(' ')[0] : 'there'
  return completeMessage(name)
}
