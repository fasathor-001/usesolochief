'use server'

import { createClient } from '@/lib/supabase/server'
import { getPolarClient, PLANS } from '@/lib/polar/client'
import type { Plan } from '@/lib/polar/client'

export async function getCurrentPlan(): Promise<Plan> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  return (profile?.plan as Plan) ?? 'free'
}

export async function createCheckoutSession(plan: 'pro' | 'operator') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, polar_customer_id')
    .eq('user_id', user.id)
    .single()

  const polar = getPolarClient()
  const productId = PLANS[plan].productId

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      customerEmail: user.email,
      customerName: profile?.full_name ?? undefined,
      externalCustomerId: user.id,
      metadata: {
        user_id: user.id,
        plan,
      },
    })

    return { url: checkout.url }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Checkout failed'
    console.error('Polar checkout error:', error)
    return { error: msg }
  }
}

export async function createCustomerPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('polar_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.polar_customer_id) {
    return { error: 'No active subscription found' }
  }

  const polar = getPolarClient()

  try {
    const session = await polar.customerSessions.create({
      customerId: profile.polar_customer_id,
    })
    return { url: session.customerPortalUrl }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Portal session failed'
    console.error('Polar portal error:', error)
    return { error: msg }
  }
}
