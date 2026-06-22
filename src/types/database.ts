// ============================================================
// SoloChief — TypeScript types aligned to Supabase schema
// Updated by migration 001 (commitment fields)
// Updated by migration 002 (intelligence infrastructure)
// ============================================================

export type CommitmentCategory =
  | 'product' | 'admin' | 'legal' | 'finance'
  | 'content' | 'customer' | 'launch'
  | 'maintenance' | 'idea' | 'personal'

export type CommitmentStage =
  | 'main_focus' | 'active' | 'launch_checklist'
  | 'maintenance' | 'follow_up' | 'parked'

export type PermissionLevel =
  | 'can_interrupt' | 'protected_block' | 'checklist_only'
  | 'maintenance_only' | 'follow_up_only' | 'parked'

export type DailyLogStatus =
  | 'planned' | 'confirmed' | 'in_progress' | 'done'
  | 'partial' | 'blocked' | 'slipped' | 'switched'
  | 'wrongly_touched' | 'unknown' | 'needs_review'

export type StatusSource =
  | 'user_whatsapp' | 'user_web' | 'user_corrected'
  | 'system_inferred' | 'ai_suggested' | 'ai_confirmed'

export type AdviceConfidence = 'high' | 'medium' | 'low'

export type CommitmentEventType =
  | 'stage_changed' | 'permission_changed' | 'wrongly_touched'
  | 'approved_switch' | 'checklist_closed' | 'parked' | 'reactivated'

export type PatternEventType =
  | 'repeated_slip' | 'wrong_switch' | 'idea_spike'
  | 'follow_up_miss' | 'launch_avoidance' | 'focus_drift'

export type StreakType = 'monday_plan' | 'friday_review' | 'weekly_rhythm'

export type MemoryReferenceType =
  | 'stated_priority' | 'missed_followup' | 'parked_idea'
  | 'slipped_outcome' | 'expressed_intention'

export type SwitchRequestDecision = 'approved' | 'blocked' | 'pending'

export type OnboardingTemplate =
  | 'solo_founder' | 'freelancer' | 'student_builder'
  | 'creator' | 'professional' | 'scratch'

export type CheckInType = 'morning_confirm' | 'midday_check' | 'end_day' | 'friday_review'

export type ParkingLotStatus = 'waiting' | 'scheduled' | 'cleared' | 'killed' | 'actioned'
export type ParkingLotCategory = 'new_product' | 'feature' | 'content' | 'personal' | 'other'
export type ParkingLotSource = 'web' | 'whatsapp'

export type FollowupStatus = 'open' | 'waiting' | 'completed' | 'cancelled'
export type FollowupUrgency = 'critical' | 'high' | 'normal' | 'low'

// ============================================================
// Core entities
// ============================================================

export interface Profile {
  id: string
  user_id: string
  workspace_id: string | null
  full_name: string | null
  avatar_url: string | null
  timezone: string
  onboarded_at: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  user_id: string
  name: string
  slug: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Schema column is 'title'; description holds longer notes
export interface Commitment {
  id: string
  user_id: string
  workspace_id: string
  category_id: string | null
  title: string
  description: string | null
  category: CommitmentCategory
  stage: CommitmentStage
  permission_level: PermissionLevel
  priority: number
  next_action: string | null
  last_touched_at: string | null
  due_date: string | null
  completed_at: string | null
  parked_at: string | null
  deleted_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CommitmentEvent {
  id: string
  user_id: string
  workspace_id: string
  commitment_id: string
  event_type: CommitmentEventType
  previous_value: string | null
  new_value: string | null
  notes: string | null
  source: StatusSource
  created_at: string
  updated_at: string
}

// ============================================================
// Weekly planning
// ============================================================

export interface WeeklyPlan {
  id: string
  user_id: string
  workspace_id: string
  week_start: string            // date string YYYY-MM-DD
  theme: string | null
  priorities: unknown[]
  notes: string | null
  locked_at: string | null      // null = draft, non-null = active
  main_focus_commitment_id: string | null  // added in migration 002
  override_commitment_id: string | null    // added in migration 002
  created_at: string
  updated_at: string
}

export interface WeeklyOutcome {
  id: string
  user_id: string
  workspace_id: string
  weekly_plan_id: string
  commitment_id: string | null
  description: string
  achieved: boolean | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StopListItem {
  id: string
  user_id: string
  workspace_id: string
  description: string
  reason: string | null
  active: boolean
  resolved_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Daily execution
// ============================================================

export interface DailyFocus {
  id: string
  user_id: string
  workspace_id: string
  commitment_id: string
  focus_date: string    // date string
  sort_order: number
  confirmed: boolean
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface NotTodayItem {
  id: string
  user_id: string
  workspace_id: string
  commitment_id: string | null
  description: string
  blocked_date: string  // date string
  reason: string | null
  created_at: string
  updated_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  workspace_id: string
  commitment_id: string
  log_date: string         // date string
  status: DailyLogStatus
  status_source: StatusSource
  notes: string | null
  time_spent_mins: number | null
  created_at: string
  updated_at: string
}

export interface SwitchRequest {
  id: string
  user_id: string
  workspace_id: string
  from_commitment_id: string | null
  to_commitment_id: string | null
  reason: string | null
  decision: SwitchRequestDecision
  decided_at: string | null
  decision_note: string | null
  source: StatusSource
  created_at: string
  updated_at: string
}

// ============================================================
// Follow-ups and parking
// ============================================================

export interface Followup {
  id: string
  user_id: string
  workspace_id: string
  commitment_id: string | null
  title: string
  description: string | null
  due_date: string | null    // date string
  completed_at: string | null
  contact_name: string | null
  contact_ref: string | null
  status: FollowupStatus
  urgency: FollowupUrgency
  next_action: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ParkingLotItem {
  id: string
  user_id: string
  workspace_id: string
  commitment_id: string | null
  title: string
  description: string | null
  parked_at: string      // date string
  reactivated_at: string | null
  notes: string | null
  status: ParkingLotStatus
  category: ParkingLotCategory
  source: ParkingLotSource
  review_date: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Reviews (tables: reviews, review_items)
// ============================================================

export interface Review {
  id: string
  user_id: string
  workspace_id: string
  weekly_plan_id: string | null
  review_date: string
  review_type: CheckInType
  summary: string | null
  energy_rating: number | null
  focus_rating: number | null
  completed_at: string | null
  shipped_text: string | null
  slipped_text: string | null
  wrongly_touched_text: string | null
  below_level_text: string | null
  next_week_focus_commitment_id: string | null
  next_week_stop_list_change: string | null
  created_at: string
  updated_at: string
}

export interface ReviewItem {
  id: string
  user_id: string
  workspace_id: string
  review_id: string
  commitment_id: string | null
  description: string
  outcome: DailyLogStatus | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Intelligence tables (migration 002)
// ============================================================

export interface PatternEvent {
  id: string
  user_id: string
  workspace_id: string
  event_type: PatternEventType
  commitment_id: string | null
  week_start_date: string | null
  occurrence_count: number
  confidence: number
  first_seen_at: string
  last_seen_at: string
  created_at: string
  updated_at: string
}

export interface WeeklyScore {
  id: string
  user_id: string
  workspace_id: string
  week_start_date: string
  score: number | null
  outcomes_score: number | null
  focus_score: number | null
  followup_score: number | null
  stop_list_respected: boolean | null
  ideas_parked_not_acted: number | null
  wrongly_touched_count: number | null
  summary_text: string | null
  score_visible: boolean
  created_at: string
  updated_at: string
}

export interface StreakRecord {
  id: string
  user_id: string
  workspace_id: string
  streak_type: StreakType
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
  created_at: string
  updated_at: string
}

export interface MemoryReference {
  id: string
  user_id: string
  workspace_id: string
  reference_type: MemoryReferenceType
  content: string
  source_table: string
  source_id: string
  confidence: number
  surfaced_count: number
  last_surfaced_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface UserIntelligenceState {
  id: string
  user_id: string
  workspace_id: string
  total_daily_logs: number
  total_weekly_reviews: number
  total_switch_events: number
  total_park_events: number
  pattern_voice_unlocked: boolean
  weekly_score_unlocked: boolean
  streak_visible: boolean
  first_weekly_plan_completed_at: string | null
  first_friday_review_completed_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Utility
// ============================================================

export interface ActionResult<T = null> {
  data: T | null
  error: string | null
}

export interface DataSufficiency {
  dailyLogs: number
  weeklyReviews: number
  switchEvents: number
  parkEvents: number
  patternVoiceUnlocked: boolean
  weeklyScoreUnlocked: boolean
  streakVisible: boolean
  adviceConfidence: AdviceConfidence
}
