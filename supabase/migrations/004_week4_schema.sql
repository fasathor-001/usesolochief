-- Migration 004: Week 4 schema additions
-- Adds missing columns to parking_lot_items, followups, and reviews
-- Run after 003_fix_daily_logs_constraint.sql

-- parking_lot_items: status workflow, category, source tracking, review date
ALTER TABLE parking_lot_items
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'scheduled', 'cleared', 'killed', 'actioned')),
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('new_product', 'feature', 'content', 'personal', 'other')),
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web'
    CHECK (source IN ('web', 'whatsapp')),
  ADD COLUMN IF NOT EXISTS review_date DATE;

-- followups: status, urgency, next action, soft delete
ALTER TABLE followups
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'waiting', 'completed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'normal'
    CHECK (urgency IN ('critical', 'high', 'normal', 'low')),
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- reviews: section text columns for Friday Review 7 sections + next week planning
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS shipped_text TEXT,
  ADD COLUMN IF NOT EXISTS slipped_text TEXT,
  ADD COLUMN IF NOT EXISTS wrongly_touched_text TEXT,
  ADD COLUMN IF NOT EXISTS below_level_text TEXT,
  ADD COLUMN IF NOT EXISTS next_week_focus_commitment_id UUID REFERENCES commitments ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS next_week_stop_list_change TEXT;

-- Unique constraint on streak_records for safe upsert
ALTER TABLE streak_records
  ADD CONSTRAINT IF NOT EXISTS streak_records_user_streak_unique
  UNIQUE (user_id, streak_type);
