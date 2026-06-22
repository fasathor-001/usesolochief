import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { mondayReminderEmail } from '@/lib/email/templates/monday-reminder'

// Called by a cron job every Monday morning
// Protected by x-cron-secret header

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: authUsers, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name')

  const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) ?? [])
  const weekNumber = getIsoWeekNumber(new Date())
  let sent = 0

  for (const user of authUsers.users) {
    if (!user.email) continue
    const name = profileMap.get(user.id) ?? ''
    const email = mondayReminderEmail(name, weekNumber)
    await sendEmail({ to: user.email, ...email })
    sent++
  }

  return NextResponse.json({ sent })
}

function getIsoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
