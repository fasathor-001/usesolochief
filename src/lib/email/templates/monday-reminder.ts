export function mondayReminderEmail(name: string, weekNumber: number) {
  const displayName = name || 'there'

  return {
    subject: `Week ${weekNumber} &#8212; set your focus before the week starts`,
    text: `
Hi ${displayName},

A new week is starting.

Before anything else, take 5 minutes to set your weekly plan:

- One main focus for the week
- Three outcomes you want to complete
- A stop list of what must not be touched

This is how SoloChief protects your week.

Set this week's plan: https://solochief.app/dashboard/weekly-plan

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
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#00C2A8;letter-spacing:0.8px;text-transform:uppercase;">Week ${weekNumber}</p>
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:500;color:#0D0D0D;">Set your focus before the week starts.</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.6;">
                Five minutes now will protect the next five days.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#F8F9FA;border-radius:8px;width:100%;">
                <tr><td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:500;color:#0D0D0D;">This week, set:</p>
                  <p style="margin:4px 0;font-size:13px;color:#64748B;">&#8594; One main focus commitment</p>
                  <p style="margin:4px 0;font-size:13px;color:#64748B;">&#8594; Three outcomes for the week</p>
                  <p style="margin:4px 0;font-size:13px;color:#64748B;">&#8594; A stop list of what must not be touched</p>
                </td></tr>
              </table>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00C2A8;border-radius:8px;">
                    <a href="https://solochief.app/dashboard/weekly-plan" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:500;color:#ffffff;text-decoration:none;">Set this week&#39;s plan &#8594;</a>
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
