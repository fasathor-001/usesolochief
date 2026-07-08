import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingSuccessClient } from '@/components/billing/BillingSuccessClient'

export default async function BillingSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, full_name')
    .eq('user_id', user.id)
    .single()

  const plan = (profile?.plan as string) ?? 'free'
  const firstName = profile?.full_name?.split(' ')[0] ?? null

  return <BillingSuccessClient plan={plan} firstName={firstName} />
}
