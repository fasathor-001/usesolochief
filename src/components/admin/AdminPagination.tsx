import Link from 'next/link'

interface Props {
  page: number
  totalPages: number
  prevHref: string | null
  nextHref: string | null
}

export function AdminPagination({ page, totalPages, prevHref, nextHref }: Props) {
  if (totalPages <= 1) return null

  const linkStyle = {
    fontSize: 13,
    color: 'var(--sc-teal)',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '5px 10px',
    borderRadius: 5,
    border: '0.5px solid var(--sc-border)',
    background: 'var(--sc-surface)',
  }

  const disabledStyle = {
    fontSize: 13,
    color: 'var(--sc-muted)',
    padding: '5px 10px',
    borderRadius: 5,
    border: '0.5px solid var(--sc-border)',
    opacity: 0.45,
    userSelect: 'none' as const,
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      padding: '4px 0',
    }}>
      {prevHref ? (
        <Link href={prevHref} style={linkStyle}>← Previous</Link>
      ) : (
        <span style={disabledStyle}>← Previous</span>
      )}

      <span style={{ fontSize: 12, color: 'var(--sc-muted)' }}>
        Page {page} of {totalPages}
      </span>

      {nextHref ? (
        <Link href={nextHref} style={linkStyle}>Next →</Link>
      ) : (
        <span style={disabledStyle}>Next →</span>
      )}
    </div>
  )
}
