import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@astorstack.com'
export const FROM_NAME = 'SoloChief AI'

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
  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
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
