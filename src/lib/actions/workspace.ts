'use server'

import { createClient } from '@/lib/supabase/server'
import type { Workspace, ActionResult } from '@/types/database'

export async function getOrCreateWorkspace(): Promise<ActionResult<Workspace>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Try to find an existing workspace for this user
  const { data: existing } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (existing) {
    // Ensure profile has workspace_id and onboarded_at set (idempotent)
    await supabase
      .from('profiles')
      .update({ workspace_id: existing.id, onboarded_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('onboarded_at', null)

    return { data: existing as Workspace, error: null }
  }

  // Create a default workspace derived from the user's email prefix
  const emailPrefix = (user.email ?? 'workspace').split('@')[0].toLowerCase()
  const slug = `${emailPrefix.replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).slice(2, 7)}`

  const { data: created, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: user.id,
      name: 'My Workspace',
      slug,
      settings: { type: 'personal' },
    })
    .select('*')
    .single()

  if (error || !created) {
    return { data: null, error: error?.message ?? 'Failed to create workspace' }
  }

  // Mark profile as onboarded and link to workspace
  await supabase
    .from('profiles')
    .update({
      workspace_id: created.id,
      onboarded_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return { data: created as Workspace, error: null }
}
