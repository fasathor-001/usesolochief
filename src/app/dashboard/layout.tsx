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

  // Auto-create workspace on first login and mark profile as onboarded (D-015)
  await getOrCreateWorkspace()

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
