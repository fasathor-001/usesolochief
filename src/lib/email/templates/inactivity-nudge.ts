export function inactivityNudgeEmail(name: string, daysSinceLastLog: number) {
  const displayName = name || 'there'

  return {
    subject: 'SoloChief has not heard from you in a few days',
    text: `
Hi ${displayName},

It has been ${daysSinceLastLog} days since your last log.

SoloChief works best when it knows what is happening. Even a quick status update keeps your context accurate.

What happened today?

Log today: https://solochief.app/dashboard/today

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
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:500;color:#0D0D0D;">What happened the last few days?</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.6;">
                It has been ${daysSinceLastLog} days since your last log. SoloChief works best when it knows what is happening &#8212; even a quick update keeps everything accurate.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00C2A8;border-radius:8px;">
                    <a href="https://solochief.app/dashboard/today" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:500;color:#ffffff;text-decoration:none;">Log today &#8594;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:0.5px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">SoloChief AI &#183; <a href="mailto:hello@astorstack.com" style="color:#64748B;">hello@astorstack.com</a></p>
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
