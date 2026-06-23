import { Resend } from 'resend'

export const FROM_NAME = 'SoloChief AI'
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'support@astorstack.com'
// Central contact address — import this in templates instead of hardcoding
export const SUPPORT_EMAIL = FROM_EMAIL

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email send')
    return { skipped: true }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  })

  if (error) {
    console.error('Resend error:', error)
    return { error: error.message }
  }

  return { data }
}
