export function overdueFollowupEmail(
  name: string,
  overdueItems: Array<{ title: string; contact_name?: string | null; days_overdue: number }>,
) {
  const displayName = name || 'there'
  const count = overdueItems.length

  return {
    subject: `${count} follow-up${count === 1 ? '' : 's'} overdue &#8212; act before they slip further`,
    text: `
Hi ${displayName},

You have ${count} overdue follow-up${count === 1 ? '' : 's'}:

${overdueItems
  .map(
    item =>
      `- ${item.title}${item.contact_name ? ` (${item.contact_name})` : ''} &#8212; ${item.days_overdue} day${item.days_overdue === 1 ? '' : 's'} overdue`,
  )
  .join('\n')}

These loops need closing.

View your follow-ups: https://solochief.app/dashboard/follow-ups

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
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#EF4444;letter-spacing:0.8px;text-transform:uppercase;">Overdue</p>
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:500;color:#0D0D0D;">
                ${count} follow-up${count === 1 ? '' : 's'} that must not slip.
              </h1>
              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
                ${overdueItems
                  .map(
                    item => `
                <tr>
                  <td style="padding:10px 14px;background:#FCEBEB;border-radius:8px;display:block;margin-bottom:6px;">
                    <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">${item.title}</p>
                    <p style="margin:3px 0 0;font-size:12px;color:#A32D2D;">
                      ${item.contact_name ? `${item.contact_name} &#183; ` : ''}${item.days_overdue} day${item.days_overdue === 1 ? '' : 's'} overdue
                    </p>
                  </td>
                </tr>
                <tr><td style="height:6px;"></td></tr>`,
                  )
                  .join('')}
              </table>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00C2A8;border-radius:8px;">
                    <a href="https://solochief.app/dashboard/follow-ups" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:500;color:#ffffff;text-decoration:none;">View follow-ups &#8594;</a>
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
