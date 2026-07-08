import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { overdueFollowupEmail } from '@/lib/email/templates/overdue-followup'

// Called by a cron job daily (or on demand)
// Queries follow-ups with a due_date in the past and status = open or waiting
// Protected by x-cron-secret header

export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: overdueFollowups, error } = await supabase
    .from('followups')
    .select('user_id, title, contact_name, due_date')
    .in('status', ['open', 'waiting'])
    .lt('due_date', today)
    .is('deleted_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!overdueFollowups || overdueFollowups.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Group follow-ups by user
  const byUser = new Map<string, typeof overdueFollowups>()
  for (const item of overdueFollowups) {
    const existing = byUser.get(item.user_id) ?? []
    existing.push(item)
    byUser.set(item.user_id, existing)
  }

  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name')

  const emailMap = new Map(authUsers?.users.map(u => [u.id, u.email ?? '']) ?? [])
  const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) ?? [])
  let sent = 0

  for (const [userId, items] of byUser) {
    const userEmail = emailMap.get(userId)
    if (!userEmail) continue

    const overdueItems = items.map(item => ({
      title: item.title,
      contact_name: item.contact_name,
      days_overdue: Math.floor(
        (new Date(today).getTime() - new Date(item.due_date).getTime()) / 86400000,
      ),
    }))

    const name = profileMap.get(userId) ?? ''
    const email = overdueFollowupEmail(name, overdueItems)
    await sendEmail({ to: userEmail, ...email })
    sent++
  }

  return NextResponse.json({ sent })
}
