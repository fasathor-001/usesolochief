import { getAdminMetrics, AdminUserRow } from '@/lib/actions/admin'
import Link from 'next/link'

function formatDate(str: string | null): string {
  if (!str) return '—'
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function planBadge(plan: string) {
  const map: Record<string, { bg: string; color: string }> = {
    pro:      { bg: 'rgba(0,194,168,0.1)',   color: '#007a6b' },
    operator: { bg: 'rgba(99,102,241,0.1)',  color: '#3C3489' },
    chief:    { bg: 'rgba(245,158,11,0.1)',  color: '#854F0B' },
    free:     { bg: '#F1F5F9',               color: '#475569' },
  }
  const s = map[plan] ?? map.free
  return (
    <span className="sc-badge" style={{ background: s.bg, color: s.color, textTransform: 'capitalize' }}>
      {plan}
    </span>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="sc-card" style={{ padding: '16px 18px' }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--sc-text)', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 4 }}>{sub}</p>
      )}
    </div>
  )
}

function FunnelBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'var(--sc-text-2)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>
          {value} <span style={{ color: 'var(--sc-muted)', fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 5, background: 'var(--sc-border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--sc-teal)',
          borderRadius: 3,
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  )
}

function RecentRow({ user }: { user: AdminUserRow }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: '0.5px solid var(--sc-border)',
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.full_name ?? user.email}
        </p>
        {user.full_name && (
          <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 1 }}>{user.email}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12 }}>
        {planBadge(user.plan)}
        <span style={{ fontSize: 11, color: 'var(--sc-muted)', whiteSpace: 'nowrap' }}>
          {formatDate(user.created_at)}
        </span>
        <Link
          href={`/admin/users/${user.id}`}
          style={{ fontSize: 12, color: 'var(--sc-teal)', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          View →
        </Link>
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const m = await getAdminMetrics()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>Platform overview</p>
      </div>

      {/* Metric grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <MetricCard label="Total users"   value={m.total} />
        <MetricCard label="New this week" value={m.newThisWeek} />
        <MetricCard label="Onboarded"     value={m.onboarded} />
        <MetricCard label="Paid"          value={m.paid} />
        <MetricCard label="Free"          value={m.free} />
        <MetricCard label="Pro"           value={m.pro} />
        <MetricCard label="Operator"      value={m.operator} />
        {m.chief > 0 && <MetricCard label="Chief" value={m.chief} />}
      </div>

      {/* Two-column section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Activation funnel */}
        <div className="sc-card" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Activation funnel
          </p>
          <FunnelBar label="Signed up"          value={m.total}           total={m.total} />
          <FunnelBar label="Onboarding complete" value={m.onboarded}       total={m.total} />
          <FunnelBar label="Have commitments"    value={m.withCommitments} total={m.total} />
          <FunnelBar label="Set weekly plan"     value={m.withWeeklyPlan}  total={m.total} />
          <FunnelBar label="Completed a review"  value={m.withReview}      total={m.total} />
        </div>

        {/* Plan distribution */}
        <div className="sc-card" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Plan distribution
          </p>
          <FunnelBar label="Free"     value={m.free}     total={m.total} />
          <FunnelBar label="Pro"      value={m.pro}      total={m.total} />
          <FunnelBar label="Operator" value={m.operator} total={m.total} />
          {m.chief > 0 && <FunnelBar label="Chief" value={m.chief} total={m.total} />}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Recent signups */}
        <div className="sc-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sc-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent sign-ups
            </p>
            <Link href="/admin/users" style={{ fontSize: 12, color: 'var(--sc-teal)', textDecoration: 'none' }}>
              All users →
            </Link>
          </div>
          {m.recentSignups.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>No sign-ups yet.</p>
          ) : (
            m.recentSignups.map(u => <RecentRow key={u.id} user={u} />)
          )}
        </div>

        {/* Recent upgrades */}
        <div className="sc-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sc-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent upgrades
            </p>
            <Link href="/admin/billing" style={{ fontSize: 12, color: 'var(--sc-teal)', textDecoration: 'none' }}>
              Billing →
            </Link>
          </div>
          {m.recentUpgrades.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>No recent upgrades yet.</p>
          ) : (
            m.recentUpgrades.map(u => <RecentRow key={u.id} user={u} />)
          )}
        </div>
      </div>
    </div>
  )
}
