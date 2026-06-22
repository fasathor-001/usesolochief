import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { fridayReminderEmail } from '@/lib/email/templates/friday-reminder'

// Called by a cron job every Friday morning
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
  let sent = 0

  for (const user of authUsers.users) {
    if (!user.email) continue
    const name = profileMap.get(user.id) ?? ''
    const email = fridayReminderEmail(name)
    await sendEmail({ to: user.email, ...email })
    sent++
  }

  return NextResponse.json({ sent })
}
