import { createClient } from '@/lib/supabase/server'
import { sendWhatsApp, sendInteractiveMessage } from '@/lib/whatsapp/twilio'

export type OnboardingStep = 'consent' | 'quiet_hours' | 'briefing_time' | 'complete'

// Import message templates
import {
  consentMessage,
  quietHoursMessage,
  briefingTimeMessage,
  completeMessage,
  skippedMessage,
} from './templates'

// Interactive message helpers
async function sendConsentMessage(userId: string, userPhone: string, firstName: string): Promise<void> {
  const contentSid = process.env.TWILIO_CONTENT_CONSENT_SID
  if (contentSid) {
    await sendInteractiveMessage(userPhone, contentSid, { '1': firstName })
  } else {
    await sendWhatsApp(userPhone, consentMessage())
  }
}

async function sendQuietHoursMessage(userPhone: string, firstName: string): Promise<void> {
  const contentSid = process.env.TWILIO_CONTENT_QUIET_HOURS_SID
  if (contentSid) {
    await sendInteractiveMessage(userPhone, contentSid, { '1': firstName })
  } else {
    await sendWhatsApp(userPhone, quietHoursMessage())
  }
}

async function sendBriefingTimeMessage(userPhone: string, firstName: string): Promise<void> {
  const contentSid = process.env.TWILIO_CONTENT_BRIEFING_TIME_SID
  if (contentSid) {
    await sendInteractiveMessage(userPhone, contentSid, { '1': firstName })
  } else {
    await sendWhatsApp(userPhone, briefingTimeMessage())
  }
}

/**
 * Handle an onboarding reply and advance the state machine.
 * Returns the message to send to the user.
 */
export async function handleOnboardingReply(
  userId: string,
  currentStep: OnboardingStep,
  body: string,
  userPhone?: string,
): Promise<string> {
  const supabase = await createClient()
  const reply = body.trim()
  const lower = reply.toLowerCase()

  // Get user's first name for interactive messages
  let firstName = 'there'
  if (userPhone) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .maybeSingle()
    firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'there'
  }

  // Consent step: expect 1, 2, or button IDs
  if (currentStep === 'consent') {
    const isYes = reply === '1' || lower === 'consent_yes'
    const isNo = reply === '2' || lower === 'consent_no'

    if (isYes) {
      // Advance to quiet_hours
      await supabase
        .from('profiles')
        .update({ whatsapp_onboarding_step: 'quiet_hours', whatsapp_consent_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (userPhone) {
        await sendQuietHoursMessage(userPhone, firstName)
        return ''
      }
      return quietHoursMessage()
    } else if (isNo) {
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

  // Quiet hours step: expect 1-4 or button IDs
  if (currentStep === 'quiet_hours') {
    const option1 = reply === '1' || lower === 'quiet_hours_1' || lower.includes('10pm') || lower.includes('6am')
    const option2 = reply === '2' || lower === 'quiet_hours_2' || lower.includes('11pm') || lower.includes('7am')
    const option3 = reply === '3' || lower === 'quiet_hours_3' || lower.includes('midnight') || lower.includes('8am')
    const option4 = reply === '4' || lower === 'quiet_hours_4' || lower.includes('no quiet')

    const advanceToNextStep = async () => {
      if (userPhone) {
        await sendBriefingTimeMessage(userPhone, firstName)
        return ''
      }
      return briefingTimeMessage()
    }

    if (option1) {
      // 10pm to 6am
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: 22,
          whatsapp_quiet_end: 6,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return await advanceToNextStep()
    } else if (option2) {
      // 11pm to 7am
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: 23,
          whatsapp_quiet_end: 7,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return await advanceToNextStep()
    } else if (option3) {
      // Midnight to 8am
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: 0,
          whatsapp_quiet_end: 8,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return await advanceToNextStep()
    } else if (option4) {
      // No quiet hours
      await supabase
        .from('profiles')
        .update({
          whatsapp_quiet_start: null,
          whatsapp_quiet_end: null,
          whatsapp_onboarding_step: 'briefing_time',
        })
        .eq('user_id', userId)

      return await advanceToNextStep()
    }
    // Invalid reply
    return quietHoursMessage()
  }

  // Briefing time step: expect 1-4 or button IDs
  if (currentStep === 'briefing_time') {
    const option1 = reply === '1' || lower === 'briefing_time_1' || lower.includes('6:00') || lower.includes('6am')
    const option2 = reply === '2' || lower === 'briefing_time_2' || lower.includes('7:00') || lower.includes('7am')
    const option3 = reply === '3' || lower === 'briefing_time_3' || lower.includes('8:00') || lower.includes('8am')
    const option4 = reply === '4' || lower === 'briefing_time_4' || lower.includes('9:00') || lower.includes('9am')

    if (option1) {
      // 6am
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: 6,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId, userPhone)
    } else if (option2) {
      // 7am
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: 7,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId, userPhone)
    } else if (option3) {
      // 8am
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: 8,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId, userPhone)
    } else if (option4) {
      // 9am
      await supabase
        .from('profiles')
        .update({
          whatsapp_briefing_hour: 9,
          whatsapp_onboarding_step: 'complete',
          whatsapp_onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return await getCompleteMessage(userId, userPhone)
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
export async function startOnboarding(userId: string, userPhone?: string): Promise<string> {
  const supabase = await createClient()

  await supabase
    .from('profiles')
    .update({ whatsapp_onboarding_step: 'consent' })
    .eq('user_id', userId)

  if (userPhone) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .maybeSingle()
    const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'there'
    await sendConsentMessage(userId, userPhone, firstName)
    return ''
  }

  return consentMessage()
}

/**
 * Get the complete message with user's name
 */
async function getCompleteMessage(userId: string, userPhone?: string): Promise<string> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, whatsapp_briefing_hour')
    .eq('user_id', userId)
    .maybeSingle()

  const name = profile?.full_name ? profile.full_name.split(' ')[0] : 'there'
  const briefingHour = profile?.whatsapp_briefing_hour ?? null

  if (userPhone) {
    await sendWhatsApp(userPhone, completeMessage(name, briefingHour))
    return ''
  }

  return completeMessage(name, briefingHour)
}
