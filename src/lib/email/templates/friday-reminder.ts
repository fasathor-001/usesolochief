export function fridayReminderEmail(name: string) {
  const displayName = name || 'there'

  return {
    subject: 'Friday Review &#8212; close the loop on this week',
    text: `
Hi ${displayName},

It is Friday.

Before the week disappears, take 10 minutes to review what happened:

- What got done
- What slipped
- What was wrongly touched
- What should shape next week

This is where SoloChief gets smarter about your patterns.

Complete your Friday Review: https://solochief.app/dashboard/review

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
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#64748B;letter-spacing:0.8px;text-transform:uppercase;">Friday Review</p>
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:500;color:#0D0D0D;">Close the loop on this week.</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.6;">
                Ten minutes now means a clearer Monday. What got done, what slipped, what should move forward.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00C2A8;border-radius:8px;">
                    <a href="https://solochief.app/dashboard/review" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:500;color:#ffffff;text-decoration:none;">Complete Friday Review &#8594;</a>
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
