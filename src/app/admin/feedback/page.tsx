import { getAdminFeedback, updateFeedbackStatus, AdminFeedbackRow } from '@/lib/actions/admin'
import { revalidatePath } from 'next/cache'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { AdminPagination } from '@/components/admin/AdminPagination'

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All' },
  { value: 'new',      label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'actioned', label: 'Actioned' },
  { value: 'closed',   label: 'Closed' },
]

const PAGE_SIZE = 10

function formatDate(str: string | null): string {
  if (!str) return '—'
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function TypeLabel({ type }: { type: string }) {
  const map: Record<string, string> = {
    bug:                  'Bug',
    feature_request:      'Feature request',
    confusing_experience: 'Confusing experience',
    billing_payment:      'Billing / payment',
    other:                'Other',
  }
  return <span>{map[type] ?? type}</span>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new:      'sc-badge sc-badge-teal',
    reviewed: 'sc-badge sc-badge-amber',
    actioned: 'sc-badge sc-badge-green',
    closed:   'sc-badge sc-badge-slate',
  }
  return (
    <span className={map[status] ?? 'sc-badge sc-badge-slate'} style={{ textTransform: 'capitalize' }}>
      {status}
    </span>
  )
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status
  const page = Math.max(1, parseInt(params.page ?? '1'))

  const items = await getAdminFeedback(statusFilter)

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function buildHref(p: number) {
    const sp = new URLSearchParams()
    if (statusFilter) sp.set('status', statusFilter)
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return qs ? '?' + qs : '?'
  }

  async function handleMarkStatus(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const newStatus = formData.get('status') as string
    if (!id || !newStatus) return
    await updateFeedbackStatus(id, newStatus)
    revalidatePath('/admin/feedback')
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 4, letterSpacing: '-0.3px' }}>
          Feedback
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sc-muted)' }}>
          {items.length} submission{items.length !== 1 ? 's' : ''}
          {statusFilter && statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
        </p>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {STATUS_OPTIONS.map(({ value, label }) => {
          const isActive = (value === 'all' && !statusFilter) || value === statusFilter
          return (
            <Link
              key={value}
              href={value === 'all' ? '/admin/feedback' : `/admin/feedback?status=${value}`}
              style={{
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--sc-teal)' : 'var(--sc-muted)',
                padding: '4px 12px',
                borderRadius: 20,
                border: `0.5px solid ${isActive ? 'var(--sc-teal)' : 'var(--sc-border)'}`,
                background: isActive ? 'rgba(0,194,168,0.08)' : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {items.length === 0 ? (
        <div className="sc-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
          <MessageSquare size={32} style={{ color: 'var(--sc-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 8 }}>
            No feedback yet
          </p>
          <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            {statusFilter && statusFilter !== 'all'
              ? `No ${statusFilter} feedback found. Try a different filter.`
              : 'Feedback submitted by users will appear here once the feedback table is set up in Supabase.'}
          </p>
        </div>
      ) : (
        <>
          <div className="sc-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sc-border)' }}>
                    {['User', 'Type', 'Message', 'Status', 'Submitted', 'Actions'].map(h => (
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
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((item: AdminFeedbackRow) => (
                    <tr key={item.id} style={{ borderBottom: '0.5px solid var(--sc-border)' }}>
                      <td style={{ padding: '10px 12px', minWidth: 160 }}>
                        <div style={{ fontSize: 12, color: 'var(--sc-muted)' }}>
                          {item.email ?? '—'}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--sc-text)' }}>
                          <TypeLabel type={item.type} />
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', maxWidth: 280 }}>
                        <p style={{
                          fontSize: 12,
                          color: 'var(--sc-text)',
                          margin: 0,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.45,
                        }}>
                          {item.message}
                        </p>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--sc-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(item.created_at)}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {item.status !== 'reviewed' && item.status !== 'closed' && (
                            <form action={handleMarkStatus}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="status" value="reviewed" />
                              <button
                                type="submit"
                                className="sc-btn sc-btn-secondary sc-btn-sm"
                                style={{ fontSize: 11, padding: '3px 8px' }}
                              >
                                Reviewed
                              </button>
                            </form>
                          )}
                          {item.status !== 'closed' && (
                            <form action={handleMarkStatus}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="status" value="closed" />
                              <button
                                type="submit"
                                className="sc-btn sc-btn-secondary sc-btn-sm"
                                style={{ fontSize: 11, padding: '3px 8px' }}
                              >
                                Close
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            prevHref={page > 1 ? buildHref(page - 1) : null}
            nextHref={page < totalPages ? buildHref(page + 1) : null}
          />
        </>
      )}
    </div>
  )
}
