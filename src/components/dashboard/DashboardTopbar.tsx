'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MessageCircle, Sun, Moon, Monitor, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { applyTheme, cycleTheme, getStoredTheme, setStoredTheme, THEME_LABELS } from '@/lib/theme'
import type { ThemeValue } from '@/lib/theme'

const SECTION_LABELS: Record<string, string> = {
  '/dashboard': 'Command Centre',
  '/dashboard/today': 'Today Focus',
  '/dashboard/commitments': 'Commitments',
  '/dashboard/weekly-plan': 'Weekly Plan',
  '/dashboard/launch-checklists': 'Checklists',
  '/dashboard/parking-lot': 'Parking Lot',
  '/dashboard/follow-ups': 'Follow-ups',
  '/dashboard/review': 'Friday Review',
  '/dashboard/chat': 'AI Chat',
  '/dashboard/settings': 'Settings',
}

const THEME_ICONS: Record<ThemeValue, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function DashboardTopbar() {
  const pathname = usePathname()
  const router = useRouter()
  const section = SECTION_LABELS[pathname] ?? 'SoloChief'
  const [theme, setTheme] = useState<ThemeValue>('system')

  useEffect(() => {
    const stored = getStoredTheme()
    setTheme(stored)
    applyTheme(stored)
  }, [])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'sc-theme' && e.newValue) {
        const next = e.newValue as ThemeValue
        setTheme(next)
        applyTheme(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function handleThemeToggle() {
    const next = cycleTheme(theme)
    setTheme(next)
    setStoredTheme(next)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const ThemeIcon = THEME_ICONS[theme]

  return (
    <div className="sc-topbar">
      <span className="sc-topbar-workspace">{section}</span>
      <div className="sc-topbar-actions">
        <span className="sc-topbar-beta">Private beta</span>
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
        <button
          type="button"
          onClick={handleThemeToggle}
          className="sc-topbar-icon-btn"
          title={`Theme: ${THEME_LABELS[theme]} — click to cycle`}
        >
          <ThemeIcon size={15} />
        </button>
        <Link
          href="/dashboard/settings"
          className="sc-topbar-icon-btn"
          title="Settings"
        >
          <Settings size={15} />
        </Link>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'transparent',
            border: '0.5px solid var(--sc-border)',
            borderRadius: 'var(--sc-r)',
            fontSize: '12px',
            color: 'var(--sc-muted)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
