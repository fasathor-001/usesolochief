import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/actions/workspace'
import { SidebarNav } from '@/components/sidebar-nav'

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

  // Gate on commitments — zero means the user has not been through onboarding.
  // Applies to new users and to users who signed up before onboarding was built.
  const { count } = await supabase
    .from('commitments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (count === 0) {
    redirect('/onboarding')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav
        userEmail={user.email ?? ''}
        userName={profile?.full_name ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--sc-background)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
