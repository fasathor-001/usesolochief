import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('webhook-signature') ?? ''
  const secret = process.env.POLAR_WEBHOOK_SECRET ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any

  try {
    event = validateEvent(body, { 'webhook-signature': signature }, secret)
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.active': {
        const sub = event.data
        const userId = sub.metadata?.user_id ?? sub.customerExternalId
        if (!userId) break

        const plan = getPlanFromProductId(sub.productId)

        await supabase
          .from('profiles')
          .update({
            plan,
            polar_customer_id: sub.customerId,
            polar_subscription_id: sub.id,
            plan_activated_at: new Date().toISOString(),
            plan_expires_at: sub.currentPeriodEnd ?? null,
            plan_cancelled_at: null,
          })
          .eq('user_id', userId)

        break
      }

      case 'subscription.updated': {
        const sub = event.data
        const userId = sub.metadata?.user_id ?? sub.customerExternalId
        if (!userId) break

        const plan = getPlanFromProductId(sub.productId)

        await supabase
          .from('profiles')
          .update({
            plan,
            plan_expires_at: sub.currentPeriodEnd ?? null,
          })
          .eq('user_id', userId)

        break
      }

      case 'subscription.canceled': {
        const sub = event.data
        const userId = sub.metadata?.user_id ?? sub.customerExternalId
        if (!userId) break

        await supabase
          .from('profiles')
          .update({
            plan_cancelled_at: new Date().toISOString(),
            plan_expires_at: sub.currentPeriodEnd ?? null,
            // Plan stays active until period ends — downgrade happens on revoked/past_due
          })
          .eq('user_id', userId)

        break
      }

      case 'subscription.revoked':
      case 'subscription.past_due': {
        const sub = event.data
        const userId = sub.metadata?.user_id ?? sub.customerExternalId
        if (!userId) break

        await supabase
          .from('profiles')
          .update({
            plan: 'free',
            polar_subscription_id: null,
            plan_expires_at: null,
          })
          .eq('user_id', userId)

        break
      }

      case 'subscription.uncanceled': {
        const sub = event.data
        const userId = sub.metadata?.user_id ?? sub.customerExternalId
        if (!userId) break

        await supabase
          .from('profiles')
          .update({
            plan_cancelled_at: null,
            plan_expires_at: sub.currentPeriodEnd ?? null,
          })
          .eq('user_id', userId)

        break
      }

      case 'order.paid': {
        const order = event.data
        const userId = order.metadata?.user_id ?? order.customerExternalId
        if (!userId) break

        // Plan is updated via subscription events — just log the payment
        console.log(`Order paid: ${order.id} for user ${userId}`)
        break
      }

      case 'customer.created':
      case 'customer.updated': {
        const customer = event.data
        const userId = customer.externalId
        if (!userId) break

        await supabase
          .from('profiles')
          .update({ polar_customer_id: customer.id })
          .eq('user_id', userId)

        break
      }

      default:
        console.log(`Unhandled Polar webhook event: ${event.type}`)
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function getPlanFromProductId(productId: string): string {
  if (productId === process.env.POLAR_PRO_PRODUCT_ID) return 'pro'
  if (productId === process.env.POLAR_OPERATOR_PRODUCT_ID) return 'operator'
  return 'free'
}
