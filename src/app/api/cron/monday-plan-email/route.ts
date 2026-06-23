import { NextResponse } from 'next/server'
import { sendMondayPlanEmails } from '@/lib/email/scheduled-emails'

// Called every Monday morning by an external scheduler
// Protected by x-cron-secret header matching CRON_SECRET env var

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const result = await sendMondayPlanEmails()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/monday-plan-email] failed:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
