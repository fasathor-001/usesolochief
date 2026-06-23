import { MessageSquare } from 'lucide-react'

export default function AdminFeedbackPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Feedback
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>User-submitted feedback and feature requests.</p>
      </div>

      {/* Empty state */}
      <div className="sc-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
        <MessageSquare size={32} style={{ color: 'var(--sc-muted)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 8 }}>
          No feedback yet
        </p>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
          Feedback submitted by users will appear here once a feedback table is created.
          Status tracking, categories, and actions will be available at that point.
        </p>
      </div>

      {/* Planned columns reference */}
      <div className="sc-card" style={{ padding: '18px 20px', marginTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Planned columns
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['User', 'Email', 'Type', 'Message', 'Status', 'Submitted at'].map(col => (
            <span key={col} className="sc-badge sc-badge-slate">{col}</span>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 12 }}>
          Statuses: New · Reviewed · Actioned · Closed
        </p>
      </div>
    </div>
  )
}
