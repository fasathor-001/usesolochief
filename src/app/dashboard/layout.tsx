import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarNav } from '@/components/sidebar-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, onboarded_at')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarded_at) {
    redirect('/onboarding')
  }

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
