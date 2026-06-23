'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

const SECTION_LABELS: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users':     'Users',
  '/admin/billing':   'Billing',
  '/admin/email':     'Email',
  '/admin/beta':      'Beta',
  '/admin/feedback':  'Feedback',
  '/admin/system':    'System',
}

function getSectionLabel(pathname: string): string {
  // User detail pages
  if (/^\/admin\/users\/[^/]+$/.test(pathname)) return 'User detail'
  for (const [prefix, label] of Object.entries(SECTION_LABELS)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return label
  }
  return 'Admin'
}

interface Props {
  userEmail: string
  onMenuToggle: () => void
}

export function AdminTopbar({ userEmail, onMenuToggle }: Props) {
  const pathname = usePathname()
  const label = getSectionLabel(pathname)

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      height: 56,
      background: 'var(--sc-surface)',
      borderBottom: '0.5px solid var(--sc-border)',
      zIndex: 30,
    }}>
      {/* Inner wrapper aligned to same max-width as content */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 32px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={onMenuToggle}
            className="admin-menu-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--sc-text)',
              cursor: 'pointer',
              padding: 4,
            }}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sc-text)' }}>
            {label}
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(245,158,11,0.1)',
            color: '#92400e',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            INTERNAL
          </span>
          <span style={{ fontSize: 12, color: 'var(--sc-muted)' }}>
            {userEmail}
          </span>
        </div>
      </div>
    </header>
  )
}
