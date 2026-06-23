'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { canAddCommitment } from '@/lib/plan-limits'
import type { Commitment, CommitmentStage, PermissionLevel, ActionResult } from '@/types/database'

// ============================================================
// Validation schemas
// ============================================================

const STAGES = ['main_focus', 'active', 'launch_checklist', 'maintenance', 'follow_up', 'parked'] as const
const CATEGORIES = ['product', 'admin', 'legal', 'finance', 'content', 'customer', 'launch', 'maintenance', 'idea', 'personal'] as const
const PERMISSIONS = ['can_interrupt', 'protected_block', 'checklist_only', 'maintenance_only', 'follow_up_only', 'parked'] as const

const CommitmentWriteSchema = z.object({
  title: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  category: z.enum(CATEGORIES, { message: 'Category is required' }),
  stage: z.enum(STAGES, { message: 'Stage is required' }),
  permission_level: z.enum(PERMISSIONS, { message: 'Permission level is required' }),
  priority: z.number().int().min(1).max(10).default(5),
  next_action: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
})

const CommitmentUpdateSchema = CommitmentWriteSchema.partial()

// ============================================================
// Shared helper — gets authenticated user and their workspace id
// ============================================================

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, workspaceId: null }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  return { supabase, user, workspaceId: workspace?.id ?? null }
}

// ============================================================
// Fetch all non-deleted commitments ordered by priority
// ============================================================

export async function getCommitments(): Promise<ActionResult<Commitment[]>> {
  const { supabase, user } = await getContext()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('commitments')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as Commitment[], error: null }
}

// ============================================================
// Create a new commitment — validated with Zod
// ============================================================

export async function createCommitment(rawData: unknown): Promise<ActionResult<Commitment>> {
  const { supabase, user, workspaceId } = await getContext()
  if (!user) return { data: null, error: 'Not authenticated' }
  if (!workspaceId) return { data: null, error: 'No workspace found. Please refresh and try again.' }

  const parsed = CommitmentWriteSchema.safeParse(rawData)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  // Enforce plan commitment limit
  const [profileRes, countRes] = await Promise.all([
    supabase.from('profiles').select('plan').eq('user_id', user.id).single(),
    supabase.from('commitments').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('deleted_at', null),
  ])
  const plan = profileRes.data?.plan ?? 'free'
  const currentCount = countRes.count ?? 0
  if (!canAddCommitment(plan, currentCount)) {
    return { data: null, error: `You have reached the commitment limit for your ${plan} plan. Upgrade to Pro for unlimited commitments.` }
  }

  const { data, error } = await supabase
    .from('commitments')
    .insert({
      user_id: user.id,
      workspace_id: workspaceId,
      title: parsed.data.title,
      category: parsed.data.category,
      stage: parsed.data.stage,
      permission_level: parsed.data.permission_level,
      priority: parsed.data.priority ?? 5,
      next_action: parsed.data.next_action ?? null,
      description: parsed.data.description ?? null,
      metadata: {},
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/commitments')
  return { data: data as Commitment, error: null }
}

// ============================================================
// Update a commitment — logs stage and permission changes
// ============================================================

export async function updateCommitment(id: string, rawData: unknown): Promise<ActionResult<Commitment>> {
  const { supabase, user } = await getContext()
  if (!user) return { data: null, error: 'Not authenticated' }

  // Verify ownership before any write
  const { data: existing } = await supabase
    .from('commitments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!existing) return { data: null, error: 'Commitment not found' }

  const parsed = CommitmentUpdateSchema.safeParse(rawData)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  // Log stage change to commitment_events (D-013)
  if (parsed.data.stage && parsed.data.stage !== existing.stage) {
    await supabase.from('commitment_events').insert({
      user_id: user.id,
      workspace_id: existing.workspace_id,
      commitment_id: id,
      event_type: 'stage_changed',
      previous_value: existing.stage as string,
      new_value: parsed.data.stage,
      source: 'user_web',
    })
  }

  // Log permission level change to commitment_events
  if (parsed.data.permission_level && parsed.data.permission_level !== existing.permission_level) {
    await supabase.from('commitment_events').insert({
      user_id: user.id,
      workspace_id: existing.workspace_id,
      commitment_id: id,
      event_type: 'permission_changed',
      previous_value: existing.permission_level as string,
      new_value: parsed.data.permission_level,
      source: 'user_web',
    })
  }

  const updatePayload: Record<string, unknown> = {
    ...parsed.data,
    last_touched_at: new Date().toISOString(),
  }

  // Set parked_at when moving into parked stage
  if (parsed.data.stage === 'parked' && existing.stage !== 'parked') {
    updatePayload.parked_at = new Date().toISOString()
  }
  // Clear parked_at when moving out of parked stage
  if (parsed.data.stage && parsed.data.stage !== 'parked' && existing.stage === 'parked') {
    updatePayload.parked_at = null
  }

  const { data, error } = await supabase
    .from('commitments')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/commitments')
  return { data: data as Commitment, error: null }
}

// ============================================================
// Soft delete — sets deleted_at, preserves all history
// ============================================================

export async function deleteCommitment(id: string): Promise<ActionResult<null>> {
  const { supabase, user } = await getContext()
  if (!user) return { data: null, error: 'Not authenticated' }

  // Verify ownership
  const { data: existing } = await supabase
    .from('commitments')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!existing) return { data: null, error: 'Commitment not found' }

  const { error } = await supabase
    .from('commitments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/commitments')
  return { data: null, error: null }
}

// ============================================================
// Dedicated stage change — convenience wrapper with event log
// ============================================================

export async function updateCommitmentStage(id: string, stage: CommitmentStage): Promise<ActionResult<Commitment>> {
  return updateCommitment(id, { stage })
}

// ============================================================
// Dedicated permission level change — convenience wrapper with event log
// ============================================================

export async function updatePermissionLevel(id: string, level: PermissionLevel): Promise<ActionResult<Commitment>> {
  return updateCommitment(id, { permission_level: level })
}
