import { SUPPORT_EMAIL } from '../resend'

export function inactivityNudgeEmail(name: string, daysSinceLastLog: number) {
  const displayName = name || 'there'

  return {
    subject: 'Still want SoloChief to help you stay on track?',
    text: `
Hi ${displayName},

You have not checked in for a while. SoloChief works best when your commitments stay visible.

Open your dashboard and choose one thing that deserves attention today. That is all it takes to get back on track.

Return to SoloChief: https://solochief.app/dashboard

SoloChief AI
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:0.5px solid #E2E8F0;overflow:hidden;">
          <tr>
            <td style="background:#0F1B2D;padding:24px 32px;">
              <p style="margin:0;font-size:16px;font-weight:500;color:#ffffff;">SoloChief <span style="color:#00C2A8;">AI</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:500;color:#0D0D0D;">Still here when you are.</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#64748B;line-height:1.6;">
                Hi ${displayName}, you have not checked in for ${daysSinceLastLog} day${daysSinceLastLog === 1 ? '' : 's'}.
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.6;">
                SoloChief works best when your commitments stay visible. Open your dashboard and choose one thing that deserves attention today. That is all it takes to get back on track.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00C2A8;border-radius:8px;">
                    <a href="https://solochief.app/dashboard" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:500;color:#ffffff;text-decoration:none;">Return to SoloChief &#8594;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:0.5px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">SoloChief AI &#183; <a href="mailto:${SUPPORT_EMAIL}" style="color:#64748B;">${SUPPORT_EMAIL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  }
}
