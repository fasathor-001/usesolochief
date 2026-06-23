import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/admin'

const ALLOWED_TYPES = ['monday-reminder', 'friday-reminder', 'overdue-followups'] as const
type CronType = typeof ALLOWED_TYPES[number]

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isPlatformAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  const { type } = await params

  if (!ALLOWED_TYPES.includes(type as CronType)) {
    return NextResponse.json({ error: 'Unknown cron type' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const cronSecret = process.env.CRON_SECRET

  if (!appUrl || !cronSecret) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }

  const res = await fetch(`${appUrl}/api/email/${type}`, {
    method: 'POST',
    headers: { 'x-cron-secret': cronSecret },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown error')
    return NextResponse.json({ error: `Cron returned ${res.status}: ${text}` }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
