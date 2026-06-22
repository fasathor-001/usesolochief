'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { MessageCircle, Sun, Settings } from 'lucide-react'

const SECTION_LABELS: Record<string, string> = {
  '/dashboard': 'Command Centre',
  '/dashboard/today': 'Today Focus',
  '/dashboard/commitments': 'Commitments',
  '/dashboard/weekly-plan': 'Weekly Plan',
  '/dashboard/launch-checklists': 'Launch Checklists',
  '/dashboard/parking-lot': 'Parking Lot',
  '/dashboard/follow-ups': 'Follow-ups',
  '/dashboard/review': 'Friday Review',
  '/dashboard/chat': 'AI Chat',
  '/dashboard/settings': 'Settings',
}

function applyTheme(value: string) {
  const root = document.documentElement
  if (value === 'dark') root.classList.add('dark')
  else if (value === 'light') root.classList.remove('dark')
  else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}

export function DashboardTopbar() {
  const pathname = usePathname()
  const section = SECTION_LABELS[pathname] ?? 'SoloChief'

  useEffect(() => {
    const stored = localStorage.getItem('sc-theme') ?? 'system'
    applyTheme(stored)
  }, [])

  return (
    <div className="sc-topbar">
      <span className="sc-topbar-workspace">{section}</span>
      <div className="sc-topbar-actions">
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--sc-muted)',
          border: '0.5px solid var(--sc-border)',
          borderRadius: 4,
          padding: '2px 8px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          Private beta
        </span>
        {pathname !== '/dashboard/chat' && (
          <Link
            href="/dashboard/chat"
            className="sc-btn sc-btn-ghost sc-btn-sm"
            style={{ fontSize: 12, padding: '5px 12px', gap: 5 }}
          >
            <MessageCircle size={13} />
            Ask SoloChief
          </Link>
        )}
        <Link
          href="/dashboard/settings?section=appearance"
          className="sc-topbar-icon-btn"
          title="Appearance"
        >
          <Sun size={15} />
        </Link>
        <Link
          href="/dashboard/settings"
          className="sc-topbar-icon-btn"
          title="Settings"
        >
          <Settings size={15} />
        </Link>
      </div>
    </div>
  )
}
