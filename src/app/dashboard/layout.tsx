import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/actions/workspace'
import { getWeekStart } from '@/lib/utils/date-utils'
import { SidebarNav } from '@/components/sidebar-nav'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { isPlatformAdmin } from '@/lib/admin'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Auto-create workspace on first login (D-015)
  await getOrCreateWorkspace()

  const today = new Date().toISOString().split('T')[0]
  const weekStart = getWeekStart()

  const [commitmentRes, profileRes, weeklyPlanRes, overdueRes] = await Promise.all([
    supabase
      .from('commitments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null),
    supabase
      .from('profiles')
      .select('full_name, avatar_url, onboarded_at')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('weekly_plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('week_start', weekStart),
    supabase
      .from('followups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .eq('status', 'open')
      .lt('due_date', today),
  ])

  const commitmentCount = commitmentRes.count ?? 0
  const hasName = !!(profileRes.data?.full_name?.trim())
  const hasWeeklyPlan = (weeklyPlanRes.count ?? 0) > 0

  // Gate: must have name and at least one commitment to enter dashboard
  if (commitmentCount === 0 || !hasName) {
    redirect('/onboarding')
  }

  // Resume: partial onboarding — has commitments but no weekly plan yet
  if (!profileRes.data?.onboarded_at && !hasWeeklyPlan) {
    redirect('/onboarding?step=3')
  }

  const profile = profileRes.data
  const overdueFollowupsCount = overdueRes.count ?? 0

  return (
    <div className="sc-app">
      <SidebarNav
        userEmail={user.email ?? ''}
        userName={profile?.full_name ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
        overdueFollowupsCount={overdueFollowupsCount}
        isAdmin={isPlatformAdmin(user.email)}
      />
      <div className="sc-main">
        <DashboardTopbar />
        {children}
        <InstallPrompt />
      </div>
    </div>
  )
}
