-- WhatsApp onboarding state machine + preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_onboarding_step text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_consent_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_quiet_start int DEFAULT 21,
  ADD COLUMN IF NOT EXISTS whatsapp_quiet_end int DEFAULT 7,
  ADD COLUMN IF NOT EXISTS whatsapp_briefing_hour int DEFAULT 6,
  ADD COLUMN IF NOT EXISTS whatsapp_onboarded_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN public.profiles.whatsapp_onboarding_step IS 'Current onboarding step: consent, quiet_hours, briefing_time, complete, or NULL if not started';
