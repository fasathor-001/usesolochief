-- Migration 005: user_preferences
-- Stores all per-user settings — replaces localStorage-only approach
-- Run in Supabase SQL Editor after deploying this code change

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,

  -- Communication
  checkin_intensity TEXT NOT NULL DEFAULT 'moderate',
  -- Values: light, moderate, intensive
  preferred_channel TEXT NOT NULL DEFAULT 'email',
  -- Values: email, whatsapp, inapp
  communication_mode TEXT NOT NULL DEFAULT 'ai_first',
  -- Values: ai_first, on_demand, focused

  -- Schedule
  timezone TEXT NOT NULL DEFAULT 'UTC',
  working_day_start TIME DEFAULT '08:00',
  working_day_end TIME DEFAULT '18:00',
  quiet_hours_start TIME DEFAULT '21:00',
  quiet_hours_end TIME DEFAULT '07:00',

  -- Focus Rules
  switch_protection TEXT NOT NULL DEFAULT 'balanced',
  -- Values: strict, balanced, light
  daily_focus_limit TEXT NOT NULL DEFAULT 'one_plus_override',
  -- Values: one_only, one_plus_override, flexible

  -- AI Behaviour
  ai_interpretation TEXT NOT NULL DEFAULT 'confirm_when_unsure',
  -- Values: always_confirm, confirm_when_unsure, log_automatically
  advice_style TEXT NOT NULL DEFAULT 'direct',
  -- Values: direct, gentle, minimal
  show_confidence BOOLEAN NOT NULL DEFAULT true,

  -- Appearance
  theme TEXT NOT NULL DEFAULT 'system',
  -- Values: light, dark, system

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
