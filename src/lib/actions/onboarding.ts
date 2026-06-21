'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OnboardingTemplate } from '@/types/database'
import type { CommitmentDraft } from '@/lib/onboarding-data'
import { ensureIntelligenceState } from '@/lib/intelligence/intelligence-service'
import { getWeekStart } from '@/lib/actions/weekly-plan'

export interface OnboardingInput {
  template: OnboardingTemplate
  fullName: string
  commitments: CommitmentDraft[]
  mainFocusIndex: number
  stopItem: string
  followupTitle: string
}

export async function saveOnboarding(input: OnboardingInput): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!workspace) throw new Error('No workspace found')

  // Update profile full_name
  if (input.fullName.trim()) {
    await supabase
      .from('profiles')
      .update({ full_name: input.fullName.trim() })
      .eq('user_id', user.id)
  }

  // Save template to workspace settings
  await supabase
    .from('workspaces')
    .update({ settings: { template: input.template } })
    .eq('id', workspace.id)

  // Create commitments
  let mainFocusCommitmentId: string | null = null
  if (input.commitments.length > 0) {
    const { data: createdCommitments } = await supabase
      .from('commitments')
      .insert(
        input.commitments.map((c) => ({
          user_id: user.id,
          workspace_id: workspace.id,
          title: c.title,
          category: c.category,
          stage: c.stage,
          permission_level: c.permission_level,
          priority: c.priority,
        })),
      )
      .select('id, priority')

    if (createdCommitments && input.mainFocusIndex < createdCommitments.length) {
      // Find by priority order
      const sorted = [...createdCommitments].sort((a, b) => a.priority - b.priority)
      mainFocusCommitmentId = sorted[input.mainFocusIndex]?.id ?? null
    }
  }

  // Create first weekly plan
  const weekStart = getWeekStart()
  const { data: newPlan } = await supabase
    .from('weekly_plans')
    .insert({
      user_id: user.id,
      workspace_id: workspace.id,
      week_start: weekStart,
      main_focus_commitment_id: mainFocusCommitmentId,
    })
    .select('id')
    .single()

  // Create stop list item
  if (input.stopItem.trim() && newPlan) {
    await supabase.from('stop_list_items').insert({
      user_id: user.id,
      workspace_id: workspace.id,
      description: input.stopItem.trim(),
      active: true,
    })
  }

  // Create followup
  if (input.followupTitle.trim()) {
    await supabase.from('followups').insert({
      user_id: user.id,
      workspace_id: workspace.id,
      title: input.followupTitle.trim(),
    })
  }

  // Mark profile as onboarded
  await supabase
    .from('profiles')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('user_id', user.id)

  // Initialise intelligence state
  await ensureIntelligenceState(user.id, workspace.id)

  redirect('/dashboard')
}
