'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  Layers,
  CalendarDays,
  CheckSquare,
  Archive,
  Bell,
  RotateCcw,
  MessageCircle,
  Settings,
  LogOut,
  LifeBuoy,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RescueMeModal } from '@/components/rescue-me/rescue-me-modal'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      { href: '/dashboard',            label: 'Command Centre', icon: LayoutDashboard },
      { href: '/dashboard/today',      label: 'Today Focus',    icon: Target },
      { href: '/dashboard/commitments',label: 'Commitments',    icon: Layers },
    ],
  },
  {
    label: 'Planning',
    items: [
      { href: '/dashboard/weekly-plan',      label: 'Weekly Plan',       icon: CalendarDays },
      { href: '/dashboard/launch-checklists',label: 'Launch Checklists', icon: CheckSquare },
    ],
  },
  {
    label: 'Capture',
    items: [
      { href: '/dashboard/parking-lot', label: 'Parking Lot', icon: Archive },
      { href: '/dashboard/follow-ups',  label: 'Follow-ups',  icon: Bell },
    ],
  },
  {
    label: 'Review',
    items: [
      { href: '/dashboard/review', label: 'Friday Review', icon: RotateCcw },
      { href: '/dashboard/chat',   label: 'AI Chat',        icon: MessageCircle },
    ],
  },
]

interface SidebarNavProps {
  userEmail: string
  userName: string
  avatarUrl: string | null
  overdueFollowupsCount?: number
}

export function SidebarNav({ userEmail, userName, avatarUrl, overdueFollowupsCount = 0 }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [rescueOpen, setRescueOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase()

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  return (
    <>
      <aside className="sc-sidebar">
        {/* Logo */}
        <div className="sc-logo">
          <span className="sc-logo-mark">
            SoloChief <em>AI</em>
          </span>
        </div>

        {/* Nav */}
        <nav className="sc-nav">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="sc-nav-group-label">{group.label}</p>
              )}
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                const isFollowUps = href === '/dashboard/follow-ups'
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`sc-nav-link${active ? ' active' : ''}`}
                  >
                    <Icon />
                    <span style={{ flex: 1 }}>{label}</span>
                    {isFollowUps && overdueFollowupsCount > 0 && (
                      <span className="sc-nav-badge">
                        {overdueFollowupsCount > 9 ? '9+' : overdueFollowupsCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Rescue Me */}
        <button
          type="button"
          onClick={() => setRescueOpen(true)}
          className="sc-rescue"
        >
          <LifeBuoy />
          Rescue Me
        </button>

        {/* User row */}
        <div className="sc-sidebar-user">
          <div className="sc-avatar">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={initials} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
            ) : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {userName && <p className="sc-user-name">{userName}</p>}
            <p className="sc-user-email">{userEmail}</p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Link
              href="/dashboard/settings"
              style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 4, borderRadius: 4 }}
              title="Settings"
            >
              <Settings size={13} />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 4, borderRadius: 4, cursor: 'pointer', background: 'none', border: 'none' }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      <RescueMeModal open={rescueOpen} onOpenChange={setRescueOpen} />
    </>
  )
}
