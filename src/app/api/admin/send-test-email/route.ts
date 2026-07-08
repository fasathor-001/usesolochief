import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/admin'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isPlatformAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const email = body.email?.trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM_EMAIL ?? 'SoloChief AI <hello@astorstack.com>'

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'SoloChief admin test email',
    html: `
      <p style="font-family: sans-serif; font-size: 14px; color: #0d0d0d;">
        This is a test email sent from the SoloChief admin panel.
      </p>
      <p style="font-family: sans-serif; font-size: 13px; color: #64748b;">
        If you received this, your Resend integration is working correctly.
      </p>
    `,
    text: 'This is a test email sent from the SoloChief admin panel. If you received this, your Resend integration is working correctly.',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
