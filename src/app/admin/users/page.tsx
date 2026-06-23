import { getAdminUsers, AdminUserRow } from '@/lib/actions/admin'
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

function onboardingBadge(onboarded_at: string | null) {
  return onboarded_at
    ? <span className="sc-badge sc-badge-green">Completed</span>
    : <span className="sc-badge sc-badge-amber">Incomplete</span>
}

function UserRow({ user }: { user: AdminUserRow }) {
  return (
    <tr style={{ borderBottom: '0.5px solid var(--sc-border)' }}>
      <td style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>
          {user.full_name ?? <span style={{ color: 'var(--sc-muted)' }}>—</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 1 }}>{user.email}</div>
      </td>
      <td style={{ padding: '10px 12px' }}>{planBadge(user.plan)}</td>
      <td style={{ padding: '10px 12px' }}>{onboardingBadge(user.onboarded_at)}</td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--sc-muted)', whiteSpace: 'nowrap' }}>
        {formatDate(user.created_at)}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--sc-muted)', whiteSpace: 'nowrap' }}>
        {formatDate(user.last_sign_in_at)}
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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>
}) {
  const params = await searchParams
  const users = await getAdminUsers(params.q, params.plan)

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Users
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>
          {users.length} user{users.length !== 1 ? 's' : ''}
          {params.q || params.plan ? ' matching filters' : ''}
        </p>
      </div>

      <Suspense>
        <AdminFilters
          planOptions={PLAN_OPTIONS}
          defaultSearch={params.q}
          defaultPlan={params.plan}
          placeholder="Search by name or email…"
        />
      </Suspense>

      {users.length === 0 ? (
        <div className="sc-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>No users found</p>
          <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="sc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sc-border)' }}>
                  {['Name / Email', 'Plan', 'Onboarding', 'Signed up', 'Last sign-in', ''].map(h => (
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
                {users.map(u => <UserRow key={u.id} user={u} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
