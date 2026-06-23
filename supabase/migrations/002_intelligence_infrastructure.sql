-- ============================================================
-- Migration 002: Intelligence infrastructure + weekly plan extensions
-- Run after 001_add_commitment_fields.sql
-- ============================================================

-- Extend weekly_plans with columns needed for Monday Command Center
ALTER TABLE weekly_plans
  ADD COLUMN IF NOT EXISTS main_focus_commitment_id UUID REFERENCES commitments ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS override_commitment_id   UUID REFERENCES commitments ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_weekly_plans_main_focus ON weekly_plans (main_focus_commitment_id);

-- ============================================================
-- Pattern events — raw signals for pattern detection
-- ============================================================
CREATE TABLE IF NOT EXISTS pattern_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users NOT NULL,
  workspace_id     UUID REFERENCES workspaces NOT NULL,
  event_type       TEXT NOT NULL,
  -- Types: repeated_slip, wrong_switch, idea_spike,
  --        follow_up_miss, launch_avoidance, focus_drift
  commitment_id    UUID REFERENCES commitments,
  week_start_date  DATE,
  occurrence_count INTEGER DEFAULT 1,
  confidence       DECIMAL(3,2) DEFAULT 0.0,
  -- 0.0 to 1.0 — never show pattern below 0.6
  first_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Weekly scores — built after sufficient data
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_scores (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES auth.users NOT NULL,
  workspace_id           UUID REFERENCES workspaces NOT NULL,
  week_start_date        DATE NOT NULL,
  score                  INTEGER,
  -- 0-10, NULL until threshold met
  outcomes_score         INTEGER,
  focus_score            INTEGER,
  followup_score         INTEGER,
  stop_list_respected    BOOLEAN,
  ideas_parked_not_acted INTEGER,
  wrongly_touched_count  INTEGER,
  summary_text           TEXT,
  -- AI-generated weekly summary
  score_visible          BOOLEAN DEFAULT FALSE,
  -- only true after threshold met
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- ============================================================
-- Streak records — quiet accountability tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS streak_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users NOT NULL,
  workspace_id        UUID REFERENCES workspaces NOT NULL,
  streak_type         TEXT NOT NULL,
  -- Types: monday_plan, friday_review, weekly_rhythm
  current_streak      INTEGER DEFAULT 0,
  longest_streak      INTEGER DEFAULT 0,
  last_completed_date DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- ============================================================
-- Memory references — what SoloChief remembers
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_references (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users NOT NULL,
  workspace_id   UUID REFERENCES workspaces NOT NULL,
  reference_type TEXT NOT NULL,
  -- Types: stated_priority, missed_followup, parked_idea,
  --        slipped_outcome, expressed_intention
  content        TEXT NOT NULL,
  source_table   TEXT NOT NULL,
  source_id      UUID NOT NULL,
  confidence     DECIMAL(3,2) DEFAULT 1.0,
  surfaced_count INTEGER DEFAULT 0,
  last_surfaced_at TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- User intelligence state — tracks thresholds for progressive disclosure
-- ============================================================
CREATE TABLE IF NOT EXISTS user_intelligence_state (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID REFERENCES auth.users NOT NULL,
  workspace_id                    UUID REFERENCES workspaces NOT NULL,
  total_daily_logs                INTEGER DEFAULT 0,
  total_weekly_reviews            INTEGER DEFAULT 0,
  total_switch_events             INTEGER DEFAULT 0,
  total_park_events               INTEGER DEFAULT 0,
  pattern_voice_unlocked          BOOLEAN DEFAULT FALSE,
  weekly_score_unlocked           BOOLEAN DEFAULT FALSE,
  streak_visible                  BOOLEAN DEFAULT FALSE,
  first_weekly_plan_completed_at  TIMESTAMPTZ,
  first_friday_review_completed_at TIMESTAMPTZ,
  created_at                      TIMESTAMPTZ DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- RLS on all new tables (D-007)
-- ============================================================
ALTER TABLE pattern_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_scores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_references       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intelligence_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pattern_events"
  ON pattern_events FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own weekly_scores"
  ON weekly_scores FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own streak_records"
  ON streak_records FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own memory_references"
  ON memory_references FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own intelligence_state"
  ON user_intelligence_state FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Updated_at triggers on new tables
-- ============================================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON pattern_events
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON weekly_scores
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON streak_records
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON memory_references
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_intelligence_state
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
