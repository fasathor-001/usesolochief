-- Migration 003: Add missing unique constraints
-- Run after 002_intelligence_infrastructure.sql

-- daily_logs: one log per commitment per day.
-- Required for upsertDailyLog's onConflict: 'commitment_id,log_date' to work.
ALTER TABLE daily_logs
  ADD CONSTRAINT daily_logs_commitment_date_unique
  UNIQUE (commitment_id, log_date);

-- focus_confirmations: one confirmation record per daily focus entry.
ALTER TABLE focus_confirmations
  ADD CONSTRAINT focus_confirmations_daily_focus_unique
  UNIQUE (daily_focus_id);
