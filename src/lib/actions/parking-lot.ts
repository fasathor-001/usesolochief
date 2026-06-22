'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, ParkingLotItem, ParkingLotCategory } from '@/types/database'
import { incrementParkEvents } from '@/lib/intelligence/intelligence-service'

const CreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  category: z.enum(['new_product', 'feature', 'content', 'personal', 'other']),
  notes: z.string().max(2000).optional(),
  reviewDate: z.string().optional(),
})

export type CreateParkingLotInput = z.infer<typeof CreateSchema>

export async function getParkingLotItems(): Promise<ActionResult<ParkingLotItem[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('parking_lot_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as ParkingLotItem[], error: null }
}

export async function createParkingLotItem(input: CreateParkingLotInput): Promise<ActionResult<ParkingLotItem>> {
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

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('parking_lot_items')
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      title: parsed.data.title,
      category: parsed.data.category as ParkingLotCategory,
      notes: parsed.data.notes ?? null,
      parked_at: today,
      review_date: parsed.data.reviewDate ?? null,
      status: 'waiting',
      source: 'web',
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }

  await incrementParkEvents(user.id)

  revalidatePath('/dashboard/parking-lot')
  revalidatePath('/dashboard')
  return { data: data as ParkingLotItem, error: null }
}

export async function updateParkingLotItem(
  id: string,
  updates: Partial<Pick<ParkingLotItem, 'title' | 'notes' | 'category' | 'review_date'>>,
): Promise<ActionResult<ParkingLotItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('parking_lot_items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/parking-lot')
  return { data: data as ParkingLotItem, error: null }
}

export async function killParkingLotItem(id: string): Promise<ActionResult<ParkingLotItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('parking_lot_items')
    .update({ status: 'killed' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/parking-lot')
  return { data: data as ParkingLotItem, error: null }
}

export async function scheduleParkingLotItem(
  id: string,
  reviewDate: string,
): Promise<ActionResult<ParkingLotItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('parking_lot_items')
    .update({ status: 'scheduled', review_date: reviewDate })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/parking-lot')
  return { data: data as ParkingLotItem, error: null }
}

export async function actOnParkingLotItem(id: string): Promise<ActionResult<ParkingLotItem>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('parking_lot_items')
    .update({ status: 'actioned', reactivated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/parking-lot')
  revalidatePath('/dashboard')
  return { data: data as ParkingLotItem, error: null }
}
