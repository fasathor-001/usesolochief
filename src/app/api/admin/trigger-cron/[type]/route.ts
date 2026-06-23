import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/admin'
import { sendMondayPlanEmails, sendFridayReviewEmails, sendFollowupReminderEmails } from '@/lib/email/scheduled-emails'

const ALLOWED_TYPES = ['monday-plan-email', 'friday-review-email', 'followup-reminders-email'] as const
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

  try {
    let result
    if (type === 'monday-plan-email') {
      result = await sendMondayPlanEmails()
    } else if (type === 'friday-review-email') {
      result = await sendFridayReviewEmails()
    } else if (type === 'followup-reminders-email') {
      result = await sendFollowupReminderEmails()
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error(`[trigger-cron/${type}] failed:`, err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
