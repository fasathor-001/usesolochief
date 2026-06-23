'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Mail,
  FlaskConical,
  MessageSquare,
  Settings2,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',     icon: Users },
  { href: '/admin/billing',   label: 'Billing',   icon: CreditCard },
  { href: '/admin/email',     label: 'Email',     icon: Mail },
  { href: '/admin/beta',      label: 'Beta',      icon: FlaskConical },
  { href: '/admin/feedback',  label: 'Feedback',  icon: MessageSquare },
  { href: '/admin/system',    label: 'System',    icon: Settings2 },
]

interface Props {
  userEmail: string
  mobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({ userEmail, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className={`admin-sidebar${mobileOpen ? ' is-open' : ''}`}
      style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 240,
        background: '#0F1B2D',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
            SoloChief
          </div>
          <span style={{
            display: 'inline-block',
            marginTop: 6,
            padding: '2px 7px',
            borderRadius: 4,
            background: 'rgba(0,194,168,0.18)',
            color: '#00C2A8',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}>
            ADMIN
          </span>
        </div>

        <button
          type="button"
          onClick={onMobileClose}
          className="admin-mobile-close"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            padding: 4,
            display: 'none',
          }}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 6,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.52)',
                background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {userEmail}
      </div>
    </aside>
  )
}
