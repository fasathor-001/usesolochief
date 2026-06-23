import { FlaskConical } from 'lucide-react'

export default function AdminBetaPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Beta
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>Manage beta testers and invitations.</p>
      </div>

      {/* Empty state */}
      <div className="sc-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
        <FlaskConical size={32} style={{ color: 'var(--sc-muted)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 8 }}>
          No beta testers yet
        </p>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
          Beta tester management will appear here once a beta testers table is created.
          Testers, invite status, onboarding, and feedback count will all show here.
        </p>
      </div>

      {/* Planned columns reference */}
      <div className="sc-card" style={{ padding: '18px 20px', marginTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Planned columns
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Name', 'Email', 'Invite sent', 'Onboarding status', 'Plan', 'Feedback count', 'Notes'].map(col => (
            <span key={col} className="sc-badge sc-badge-slate">{col}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
