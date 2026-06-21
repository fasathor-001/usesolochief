// ============================================================
// SoloChief — TypeScript types aligned to Supabase schema
// Updated by migration 001 (commitment fields)
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

export interface ActionResult<T = null> {
  data: T | null
  error: string | null
}
