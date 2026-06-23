import { getAdminBilling, AdminUserRow } from '@/lib/actions/admin'
import Link from 'next/link'
import { Suspense } from 'react'
import { AdminFilters } from '@/components/admin/AdminFilters'

const PLAN_OPTIONS = [
  { value: 'all',      label: 'All plans' },
  { value: 'free',     label: 'Free' },
  { value: 'pro',      label: 'Pro' },
  { value: 'operator', label: 'Operator' },
  { value: 'chief',    label: 'Chief' },
]

function formatDate(str: string | null): string {
  if (!str) return '—'
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function planBadge(plan: string) {
  const map: Record<string, string> = {
    pro: 'sc-badge sc-badge-teal',
    operator: 'sc-badge sc-badge-purple',
    chief: 'sc-badge sc-badge-amber',
    free: 'sc-badge sc-badge-slate',
  }
  return (
    <span className={map[plan] ?? 'sc-badge sc-badge-slate'} style={{ textTransform: 'capitalize' }}>
      {plan}
    </span>
  )
}

function subscriptionStatus(user: AdminUserRow) {
  if (user.plan === 'free') return <span className="sc-badge sc-badge-slate">Free</span>
  if (user.plan_cancelled_at) return <span className="sc-badge sc-badge-amber">Cancelled</span>
  if (user.plan_activated_at) return <span className="sc-badge sc-badge-green">Active</span>
  return <span className="sc-badge sc-badge-slate">—</span>
}

function BillingRow({ user }: { user: AdminUserRow }) {
  return (
    <tr style={{ borderBottom: '0.5px solid var(--sc-border)' }}>
      <td style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>
          {user.full_name ?? <span style={{ color: 'var(--sc-muted)' }}>—</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 1 }}>{user.email}</div>
      </td>
      <td style={{ padding: '10px 12px' }}>{planBadge(user.plan)}</td>
      <td style={{ padding: '10px 12px' }}>{subscriptionStatus(user)}</td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--sc-muted)', whiteSpace: 'nowrap' }}>
        {user.plan_cancelled_at ? formatDate(user.plan_cancelled_at) : formatDate(user.plan_expires_at)}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--sc-muted)', whiteSpace: 'nowrap' }}>
        {formatDate(user.created_at)}
      </td>
      <td style={{ padding: '10px 12px' }}>
        <Link
          href={`/admin/users/${user.id}`}
          style={{ fontSize: 12, color: 'var(--sc-teal)', textDecoration: 'none', fontWeight: 500 }}
        >
          View →
        </Link>
      </td>
    </tr>
  )
}

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const params = await searchParams
  const users = await getAdminBilling(params.plan)

  const paid   = users.filter(u => u.plan !== 'free')
  const active = users.filter(u => u.plan !== 'free' && !u.plan_cancelled_at)

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Billing
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>
          {paid.length} paid · {active.length} active subscriptions
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total users',  value: users.length },
          { label: 'Paid',         value: paid.length },
          { label: 'Active subs',  value: active.length },
        ].map(c => (
          <div key={c.label} className="sc-card" style={{ padding: '14px 18px', minWidth: 100 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {c.label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--sc-text)' }}>{c.value}</p>
          </div>
        ))}
      </div>

      <Suspense>
        <AdminFilters
          planOptions={PLAN_OPTIONS}
          defaultPlan={params.plan}
          placeholder="Filter billing…"
        />
      </Suspense>

      {users.length === 0 ? (
        <div className="sc-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>No users found</p>
          <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>Try adjusting the plan filter.</p>
        </div>
      ) : (
        <div className="sc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sc-border)' }}>
                  {['User', 'Plan', 'Status', 'Renewal / Cancelled', 'Signed up', ''].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--sc-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: 'var(--sc-surface)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => <BillingRow key={u.id} user={u} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
