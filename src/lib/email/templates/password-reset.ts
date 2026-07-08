import { SUPPORT_EMAIL } from '../resend'

export function passwordResetEmail(name: string) {
  const display = name?.trim() || 'there'
  const subject = 'Reset your SoloChief password'

  const text = `
Hi ${display},

We received a request to reset your SoloChief password.

Click the link in this email to set a new password. The link expires in 60 minutes.

If you did not request a password reset, ignore this email — your account is safe.

SoloChief AI
${SUPPORT_EMAIL}
  `.trim()

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:0.5px solid #E2E8F0;overflow:hidden;max-width:560px;">
        <tr><td style="background:#0F1B2D;padding:24px 32px;"><p style="margin:0;font-size:16px;font-weight:500;color:#fff;">SoloChief <span style="color:#00C2A8;">AI</span></p></td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:500;color:#0D0D0D;">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.6;">
            Hi ${display}, we received a request to reset your SoloChief password. Click the button below to set a new one. The link expires in 60 minutes.
          </p>
          <p style="margin:0 0 24px;font-size:13px;color:#94A3B8;line-height:1.5;">
            If you did not request a password reset, ignore this email &#8212; your account is safe.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:0.5px solid #E2E8F0;"><p style="margin:0;font-size:12px;color:#94A3B8;">SoloChief AI &middot; <a href="mailto:${SUPPORT_EMAIL}" style="color:#64748B;text-decoration:none;">${SUPPORT_EMAIL}</a></p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, text, html }
}
