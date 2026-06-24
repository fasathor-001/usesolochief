-- Migration 010: WhatsApp user linking
-- Adds whatsapp_number and whatsapp_verified to profiles
-- Adds whatsapp_notifications_enabled to notification_preferences

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_verified boolean DEFAULT false;

-- WhatsApp opt-in/opt-out (defaults to enabled once verified)
ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS whatsapp_notifications_enabled boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS profiles_whatsapp_number_idx ON profiles(whatsapp_number)
  WHERE whatsapp_number IS NOT NULL;
