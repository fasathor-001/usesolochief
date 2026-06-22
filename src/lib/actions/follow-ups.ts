'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, Followup, FollowupUrgency } from '@/types/database'

const CreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  contactName: z.string().max(200).optional(),
  commitmentId: z.string().uuid().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  urgency: z.enum(['critical', 'high', 'normal', 'low']).default('normal'),
  nextAction: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
})

export type CreateFollowUpInput = z.infer<typeof CreateSchema>

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function getFollowUps(): Promise<ActionResult<Followup[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('followups')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .not('status', 'in', '(completed,cancelled)')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as Followup[], error: null }
}

export async function getOverdueFollowUps(): Promise<ActionResult<Followup[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const today = todayString()

  const { data, error } = await supabase
    .from('followups')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .eq('status', 'open')
    .lt('due_date', today)
    .order('due_date', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as Followup[], error: null }
}

export async function createFollowUp(input: CreateFollowUpInput): Promise<ActionResult<Followup>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const parsed = CreateSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!workspace) return { data: null, error: 'No workspace found' }

  const { data, error } = await supabase
    .from('followups')
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      title: parsed.data.title,
      contact_name: parsed.data.contactName ?? null,
      commitment_id: parsed.data.commitmentId ?? null,
      due_date: parsed.data.dueDate,
      urgency: parsed.data.urgency as FollowupUrgency,
      next_action: parsed.data.nextAction ?? null,
      description: parsed.data.notes ?? null,
      status: 'open',
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/follow-ups')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/today')
  return { data: data as Followup, error: null }
}

export async function updateFollowUp(
  id: string,
  updates: Partial<Pick<Followup, 'title' | 'contact_name' | 'due_date' | 'urgency' | 'next_action' | 'description' | 'status'>>,
): Promise<ActionResult<Followup>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('followups')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/follow-ups')
  revalidatePath('/dashboard')
  return { data: data as Followup, error: null }
}

export async function completeFollowUp(id: string): Promise<ActionResult<Followup>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: followup } = await supabase
    .from('followups')
    .select('commitment_id, workspace_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data, error } = await supabase
    .from('followups')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }

  // Log to commitment_events if linked to a commitment
  if (followup?.commitment_id) {
    await supabase.from('commitment_events').insert({
      user_id: user.id,
      workspace_id: followup.workspace_id,
      commitment_id: followup.commitment_id,
      event_type: 'approved_switch',
      new_value: 'follow_up_completed',
      source: 'user_web',
    })
  }

  revalidatePath('/dashboard/follow-ups')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/today')
  return { data: data as Followup, error: null }
}

export async function snoozeFollowUp(id: string, newDueDate: string): Promise<ActionResult<Followup>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('followups')
    .update({ due_date: newDueDate, status: 'waiting' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/follow-ups')
  revalidatePath('/dashboard')
  return { data: data as Followup, error: null }
}

export async function deleteFollowUp(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('followups')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/follow-ups')
  revalidatePath('/dashboard')
  return { data: null, error: null }
}
