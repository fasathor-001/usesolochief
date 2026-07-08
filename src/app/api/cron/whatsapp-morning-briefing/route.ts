import { NextResponse } from 'next/server'
import { sendMorningBriefings } from '@/lib/whatsapp/scheduled-whatsapp'

// Daily morning briefings via WhatsApp
// Protected by x-cron-secret header — never publicly callable
// Schedule: daily at 05:50 UTC via cron-job.org or GitHub Actions

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const result = await sendMorningBriefings()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/whatsapp-morning-briefing] failed:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
