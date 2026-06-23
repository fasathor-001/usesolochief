import { getAdminEmailStats } from '@/lib/actions/admin'
import { AdminEmailPanel } from '@/components/admin/AdminEmailPanel'

export default async function AdminEmailPage() {
  const stats = await getAdminEmailStats()
  return <AdminEmailPanel stats={stats} />
}
