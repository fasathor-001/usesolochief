import { getAdminUserDetail } from '@/lib/actions/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'

function formatDate(str: string | null): string {
  if (!str) return '—'
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return '—' }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '9px 0',
      borderBottom: '0.5px solid var(--sc-border)',
      gap: 12,
    }}>
      <span style={{ fontSize: 13, color: 'var(--sc-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--sc-text)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="sc-card" style={{ padding: '14px 16px', textAlign: 'center' }}>
      <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--sc-text)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
    </div>
  )
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAdminUserDetail(id)

  if (!user) notFound()

  const planMap: Record<string, { bg: string; color: string }> = {
    pro:      { bg: 'rgba(0,194,168,0.1)',  color: '#007a6b' },
    operator: { bg: 'rgba(99,102,241,0.1)', color: '#3C3489' },
    chief:    { bg: 'rgba(245,158,11,0.1)', color: '#854F0B' },
    free:     { bg: '#F1F5F9',              color: '#475569' },
  }
  const planStyle = planMap[user.plan] ?? planMap.free

  return (
    <div>
      {/* Back */}
      <Link
        href="/admin/users"
        style={{ fontSize: 13, color: 'var(--sc-teal)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}
      >
        ← Back to users
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', letterSpacing: '-0.3px' }}>
            {user.full_name ?? user.email}
          </h1>
          <span className="sc-badge" style={{ background: planStyle.bg, color: planStyle.color, textTransform: 'capitalize' }}>
            {user.plan}
          </span>
        </div>
        {user.full_name && (
          <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>{user.email}</p>
        )}
      </div>

      {/* Activity stats — spans full width */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 10,
        marginBottom: 20,
      }}>
        <StatCard label="Commitments"  value={user.commitment_count} />
        <StatCard label="Follow-ups"   value={user.followup_count} />
        <StatCard label="Parked"       value={user.parking_count} />
        <StatCard label="Reviews"      value={user.review_count} />
        <StatCard label="Weekly plans" value={user.weekly_plan_count} />
      </div>

      {/* Detail cards — 2-column grid on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 14,
        alignItems: 'start',
      }}>
        {/* Profile card */}
        <div className="sc-card" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Profile
          </p>
          <Row label="Email"           value={user.email} />
          <Row label="Full name"        value={user.full_name ?? <span style={{ color: 'var(--sc-muted)' }}>—</span>} />
          <Row label="Signed up"        value={formatDate(user.created_at)} />
          <Row label="Last sign-in"     value={formatDate(user.last_sign_in_at)} />
          <Row label="Onboarded"        value={
            user.onboarded_at
              ? <span className="sc-badge sc-badge-green">Completed {formatDate(user.onboarded_at)}</span>
              : <span className="sc-badge sc-badge-amber">Incomplete</span>
          } />
          <Row label="Sign-in methods"  value={user.providers.join(', ') || '—'} />
          <Row label="User ID"          value={<code style={{ fontSize: 11, color: 'var(--sc-muted)' }}>{user.id}</code>} />
        </div>

        {/* Plan card */}
        <div className="sc-card" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Billing
          </p>
          <Row label="Plan"               value={<span style={{ textTransform: 'capitalize' }}>{user.plan}</span>} />
          <Row label="Activated"          value={formatDate(user.plan_activated_at)} />
          <Row label="Expires"            value={formatDate(user.plan_expires_at)} />
          <Row label="Cancelled"          value={formatDate(user.plan_cancelled_at)} />
          <Row label="Polar customer"     value={
            user.polar_customer_id
              ? <code style={{ fontSize: 11, color: 'var(--sc-muted)' }}>{user.polar_customer_id}</code>
              : <span style={{ color: 'var(--sc-muted)' }}>—</span>
          } />
          <Row label="Polar subscription" value={
            user.polar_subscription_id
              ? <code style={{ fontSize: 11, color: 'var(--sc-muted)' }}>{user.polar_subscription_id}</code>
              : <span style={{ color: 'var(--sc-muted)' }}>—</span>
          } />
        </div>
      </div>
    </div>
  )
}
