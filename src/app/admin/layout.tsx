import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isPlatformAdmin } from '@/lib/admin'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = { title: 'SoloChief Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (!isPlatformAdmin(user.email)) redirect('/dashboard')

  return <AdminShell userEmail={user.email ?? ''}>{children}</AdminShell>
}
