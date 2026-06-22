export function welcomeEmail(name: string) {
  const displayName = name || 'there'

  return {
    subject: 'Welcome to SoloChief AI',
    text: `
Hi ${displayName},

Your SoloChief AI account is ready.

SoloChief helps you decide what deserves your attention, what can wait, and what must not slip.

Here is how to get started:

1. Add your commitments — everything you are currently carrying
2. Set this week's focus and three outcomes
3. Open Today Focus each morning
4. Park any ideas that arrive during the week
5. Complete your Friday Review

Your first week is the most important. The rhythm builds from there.

Get started: https://solochief.app/dashboard

If you have questions or feedback, reply to this email.

SoloChief AI
hello@astorstack.com
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:0.5px solid #E2E8F0;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0F1B2D;padding:28px 32px;">
              <p style="margin:0;font-size:18px;font-weight:500;color:#ffffff;letter-spacing:-0.3px;">
                SoloChief <span style="color:#00C2A8;">AI</span>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:500;color:#0D0D0D;letter-spacing:-0.3px;">
                Welcome, ${displayName}.
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.6;">
                Your SoloChief AI account is ready.
              </p>

              <p style="margin:0 0 20px;font-size:14px;color:#0D0D0D;line-height:1.6;">
                SoloChief helps you decide what deserves your attention, what can wait, and what must not slip — whatever you are managing in work or life.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;width:100%;">
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:22px;height:22px;background:#00C2A8;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:600;color:#ffffff;">1</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">Add your commitments</p>
                          <p style="margin:3px 0 0;font-size:12px;color:#64748B;line-height:1.5;">Everything you are currently carrying — work, personal, admin, ideas.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:22px;height:22px;background:#00C2A8;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:600;color:#ffffff;">2</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">Set this week's focus</p>
                          <p style="margin:3px 0 0;font-size:12px;color:#64748B;line-height:1.5;">One main focus, three outcomes, and a stop list.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:22px;height:22px;background:#00C2A8;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:600;color:#ffffff;">3</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">Open Today Focus each morning</p>
                          <p style="margin:3px 0 0;font-size:12px;color:#64748B;line-height:1.5;">One outcome for today. Nothing else competes.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:22px;height:22px;background:#00C2A8;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:600;color:#ffffff;">4</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">Park ideas as they arrive</p>
                          <p style="margin:3px 0 0;font-size:12px;color:#64748B;line-height:1.5;">Keep focus without losing good ideas.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px;">
                          <span style="display:inline-block;width:22px;height:22px;background:#00C2A8;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:600;color:#ffffff;">5</span>
                        </td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">Complete your Friday Review</p>
                          <p style="margin:3px 0 0;font-size:12px;color:#64748B;line-height:1.5;">See what happened and shape next week.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00C2A8;border-radius:8px;">
                    <a href="https://solochief.app/dashboard" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">
                      Open SoloChief &#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:0.5px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#64748B;line-height:1.6;">
                SoloChief AI &#8212; Your personal Chief of Staff for commitments, focus, and follow-ups.<br>
                Questions? Reply to this email or contact <a href="mailto:hello@astorstack.com" style="color:#00C2A8;">hello@astorstack.com</a>
              </p>
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
