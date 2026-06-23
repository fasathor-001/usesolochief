import { getAdminSystemStatus, getAdminEmailStats } from '@/lib/actions/admin'
import { AdminCronButtons } from '@/components/admin/AdminCronButtons'
import { CheckCircle2, AlertCircle } from 'lucide-react'

function StatusRow({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: '0.5px solid var(--sc-border)',
      gap: 12,
    }}>
      <div>
        <span style={{ fontSize: 13, color: 'var(--sc-text-2)' }}>{label}</span>
        {note && <span style={{ fontSize: 11, color: 'var(--sc-muted)', marginLeft: 8 }}>{note}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {ok
          ? <><CheckCircle2 size={14} style={{ color: '#10B981' }} /><span className="sc-badge sc-badge-green">Configured</span></>
          : <><AlertCircle size={14} style={{ color: '#EF4444' }} /><span className="sc-badge sc-badge-red">Not set</span></>
        }
      </div>
    </div>
  )
}

export default async function AdminSystemPage() {
  const [s, emailStats] = await Promise.all([
    getAdminSystemStatus(),
    getAdminEmailStats(),
  ])

  const envBadgeStyle = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    background: s.environment === 'production' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
    color: s.environment === 'production' ? '#3C3489' : '#854F0B',
    fontSize: 12,
    fontWeight: 600,
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          System
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>Environment status and manual controls.</p>
      </div>

      {/* Environment summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="sc-card" style={{ padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Environment</p>
          <span style={envBadgeStyle}>{s.environment}</span>
        </div>
        <div className="sc-card" style={{ padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>App URL</p>
          <code style={{ fontSize: 12, color: 'var(--sc-text)' }}>{s.appUrl}</code>
        </div>
      </div>

      {/* Integration status */}
      <div className="sc-card" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Integrations
        </p>
        <StatusRow label="Supabase"  ok={s.supabaseConfigured}  note="URL + anon key + service role" />
        <StatusRow label="Anthropic" ok={s.anthropicConfigured} note="ANTHROPIC_API_KEY" />
        <StatusRow label="Resend"    ok={s.resendConfigured}    note="RESEND_API_KEY" />
        <StatusRow label="Polar"     ok={s.polarConfigured}     note="POLAR_ACCESS_TOKEN" />
        <StatusRow label="Twilio"    ok={s.twilioConfigured}    note="TWILIO_ACCOUNT_SID" />
        <StatusRow label="Cron"      ok={s.cronConfigured}      note="CRON_SECRET" />
      </div>

      {/* Table counts */}
      <div className="sc-card" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Database row counts
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {Object.entries(s.tableCounts).map(([table, count]) => (
            <div key={table} style={{
              padding: '10px 12px',
              borderRadius: 6,
              border: '0.5px solid var(--sc-border)',
              background: 'var(--sc-bg)',
            }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--sc-text)' }}>{count}</p>
              <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 2 }}>{table.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email status */}
      <div className="sc-card" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Email delivery status
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
        }}>
          <div style={{
            padding: '10px 12px',
            borderRadius: 6,
            border: '0.5px solid var(--sc-border)',
            background: 'var(--sc-bg)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sc-text)' }}>Total sent</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--sc-text)', marginTop: 4 }}>{emailStats.totalSent}</p>
          </div>
          <div style={{
            padding: '10px 12px',
            borderRadius: 6,
            border: '0.5px solid var(--sc-border)',
            background: 'var(--sc-bg)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sc-text)' }}>Failed</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--sc-error, #EF4444)', marginTop: 4 }}>{emailStats.totalFailed}</p>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Last runs
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--sc-text-2)' }}>Monday email</span>
              <span style={{ color: 'var(--sc-muted)' }}>
                {emailStats.lastMondayRun ? new Date(emailStats.lastMondayRun).toLocaleString() : 'Never'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--sc-text-2)' }}>Friday email</span>
              <span style={{ color: 'var(--sc-muted)' }}>
                {emailStats.lastFridayRun ? new Date(emailStats.lastFridayRun).toLocaleString() : 'Never'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--sc-text-2)' }}>Follow-up email</span>
              <span style={{ color: 'var(--sc-muted)' }}>
                {emailStats.lastFollowupRun ? new Date(emailStats.lastFollowupRun).toLocaleString() : 'Never'}
              </span>
            </div>
            {emailStats.lastFailedEmail && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--sc-error, #EF4444)' }}>Last failed</span>
                <span style={{ color: 'var(--sc-muted)' }}>
                  {new Date(emailStats.lastFailedEmail).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cron triggers */}
      <div className="sc-card" style={{ padding: '18px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Manual cron triggers
        </p>
        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          These send emails to real users. Confirm before triggering.
        </p>
        <AdminCronButtons />
      </div>
    </div>
  )
}
