import { SUPPORT_EMAIL } from '../resend'

type OverdueItem = { title: string; contact_name: string | null; days_overdue: number }
type DueTodayItem = { title: string; contact_name: string | null }

const MAX_SHOWN = 5

export function followupReminderEmail(
  name: string,
  overdueItems: OverdueItem[],
  dueTodayItems: DueTodayItem[],
) {
  const displayName = name || 'there'
  const hasOverdue  = overdueItems.length > 0
  const hasDueToday = dueTodayItems.length > 0

  let subject: string
  if (hasOverdue && hasDueToday) {
    subject = 'Follow-ups need your attention'
  } else if (hasOverdue) {
    subject = 'You have overdue follow-ups'
  } else {
    subject = 'You have follow-ups due today'
  }

  // Show max 5 total — overdue first, then due today
  const shownOverdue   = overdueItems.slice(0, MAX_SHOWN)
  const shownDueToday  = dueTodayItems.slice(0, Math.max(0, MAX_SHOWN - shownOverdue.length))
  const hiddenCount    = (overdueItems.length + dueTodayItems.length) - (shownOverdue.length + shownDueToday.length)

  // ── Plain text ──────────────────────────────────────────────────────────────

  const overdueTxtLines = shownOverdue.map(i =>
    `- ${i.title}${i.contact_name ? ` (${i.contact_name})` : ''} — ${i.days_overdue} day${i.days_overdue === 1 ? '' : 's'} overdue`
  ).join('\n')

  const dueTodayTxtLines = shownDueToday.map(i =>
    `- ${i.title}${i.contact_name ? ` (${i.contact_name})` : ''} — due today`
  ).join('\n')

  const textSections: string[] = []
  if (shownOverdue.length > 0)  textSections.push(`Overdue:\n${overdueTxtLines}`)
  if (shownDueToday.length > 0) textSections.push(`Due today:\n${dueTodayTxtLines}`)
  if (hiddenCount > 0)          textSections.push(`And ${hiddenCount} more in SoloChief.`)

  const text = `
Hi ${displayName},

${textSections.join('\n\n')}

Review your follow-ups: https://solochief.app/dashboard/follow-ups

SoloChief AI
  `.trim()

  // ── HTML ────────────────────────────────────────────────────────────────────

  const overdueRowsHtml = shownOverdue.map(item => `
                <tr>
                  <td style="padding:10px 14px;background:#FCEBEB;border-radius:8px;display:block;margin-bottom:6px;">
                    <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">${item.title}</p>
                    <p style="margin:3px 0 0;font-size:12px;color:#A32D2D;">
                      ${item.contact_name ? `${item.contact_name} &#183; ` : ''}${item.days_overdue} day${item.days_overdue === 1 ? '' : 's'} overdue
                    </p>
                  </td>
                </tr>
                <tr><td style="height:6px;"></td></tr>`).join('')

  const dueTodayRowsHtml = shownDueToday.map(item => `
                <tr>
                  <td style="padding:10px 14px;background:#EFF6FF;border-radius:8px;display:block;margin-bottom:6px;">
                    <p style="margin:0;font-size:13px;font-weight:500;color:#0D0D0D;">${item.title}</p>
                    <p style="margin:3px 0 0;font-size:12px;color:#1D4ED8;">
                      ${item.contact_name ? `${item.contact_name} &#183; ` : ''}Due today
                    </p>
                  </td>
                </tr>
                <tr><td style="height:6px;"></td></tr>`).join('')

  const sectionHeaderOverdue = hasOverdue && hasDueToday
    ? `<p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#A32D2D;text-transform:uppercase;letter-spacing:0.06em;">Overdue</p>`
    : ''
  const sectionHeaderDueToday = hasOverdue && hasDueToday
    ? `<p style="margin:16px 0 8px;font-size:11px;font-weight:600;color:#1D4ED8;text-transform:uppercase;letter-spacing:0.06em;">Due today</p>`
    : ''

  const hiddenHtml = hiddenCount > 0
    ? `<p style="margin:12px 0 0;font-size:12px;color:#64748B;text-align:center;">And ${hiddenCount} more in SoloChief.</p>`
    : ''

  const html = `
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
              <h1 style="margin:0 0 20px;font-size:20px;font-weight:500;color:#0D0D0D;">Follow-ups need a response.</h1>
              ${sectionHeaderOverdue}
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                ${overdueRowsHtml}
              </table>
              ${sectionHeaderDueToday}
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                ${dueTodayRowsHtml}
              </table>
              ${hiddenHtml}
              <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#00C2A8;border-radius:8px;">
                    <a href="https://solochief.app/dashboard/follow-ups" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:500;color:#ffffff;text-decoration:none;">Review follow-ups &#8594;</a>
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
  `.trim()

  return { subject, text, html }
}
