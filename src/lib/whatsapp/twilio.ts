import twilio from 'twilio'

export function createTwilioClient() {
  const sid    = process.env.TWILIO_ACCOUNT_SID
  const token  = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error('Twilio credentials not configured')
  return twilio(sid, token)
}

export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN  &&
    process.env.TWILIO_WHATSAPP_NUMBER
  )
}

function withWhatsAppPrefix(number: string): string {
  return number.startsWith('whatsapp:') ? number : `whatsapp:${number}`
}

export async function sendWhatsApp(
  to: string,
  body: string,
): Promise<{ sid?: string; error?: string }> {
  if (!isTwilioConfigured()) {
    console.warn('[whatsapp] Twilio not configured — skipping send')
    return { error: 'not_configured' }
  }

  const fromFormatted = withWhatsAppPrefix(process.env.TWILIO_WHATSAPP_NUMBER!)
  const toFormatted   = withWhatsAppPrefix(to)

  try {
    const client  = createTwilioClient()
    const message = await client.messages.create({
      from: fromFormatted,
      to:   toFormatted,
      body,
    })
    return { sid: message.sid }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[whatsapp] send failed:', msg)
    return { error: msg }
  }
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false
  try {
    return twilio.validateRequest(authToken, signature, url, params)
  } catch {
    return false
  }
}

export function twimlResponse(body: string): Response {
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

export function twimlEmpty(): Response {
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { status: 200, headers: { 'Content-Type': 'text/xml; charset=utf-8' } },
  )
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + ' *** ' + phone.slice(-4)
}
