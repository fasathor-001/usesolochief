'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

const TYPE_LABELS: Record<string, string> = {
  bug:                  'Bug',
  feature_request:      'Feature request',
  confusing_experience: 'Confusing experience',
  billing_payment:      'Billing / payment',
  other:                'Other',
}

export async function submitFeedback(data: {
  type: string
  message: string
  page?: string
}): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    email: user.email ?? '',
    type: data.type,
    message: data.message,
    page: data.page ?? null,
  })

  if (error) {
    console.error('[feedback] submit failed for user:', user.id)
    throw new Error('Failed to submit feedback')
  }

  const typeLabel = TYPE_LABELS[data.type] ?? data.type
  const userEmail = user.email ?? 'unknown'
  const submittedAt = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })

  try {
    await sendEmail({
      to: 'feedback@astorstack.com',
      subject: `New feedback: ${typeLabel} from ${userEmail}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
          <h2 style="font-size:18px;font-weight:700;margin-bottom:24px;">New feedback submitted</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;width:140px;">Type</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;vertical-align:top;">Message</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;white-space:pre-wrap;">${data.message}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Submitted by</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Page</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;">${data.page ?? '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#666;">Submitted at</td>
              <td style="padding:10px 0;font-size:13px;">${submittedAt}</td>
            </tr>
          </table>
          <div style="margin-top:28px;">
            <a href="https://solochief.app/admin/feedback"
               style="display:inline-block;padding:9px 18px;background:#00C2A8;color:#fff;font-size:13px;font-weight:600;border-radius:6px;text-decoration:none;">
              View in admin
            </a>
          </div>
        </div>
      `,
      text: `New feedback: ${typeLabel} from ${userEmail}\n\nType: ${typeLabel}\nMessage: ${data.message}\nSubmitted by: ${userEmail}\nPage: ${data.page ?? '—'}\nSubmitted at: ${submittedAt}\n\nAdmin: https://solochief.app/admin/feedback`,
    })
  } catch (err) {
    console.error('[feedback] notification email failed:', err instanceof Error ? err.message : 'unknown')
  }
}
