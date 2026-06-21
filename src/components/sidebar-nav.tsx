'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Target,
  Layers,
  Calendar,
  CheckSquare,
  Archive,
  Bell,
  RefreshCw,
  MessageCircle,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',                  label: 'Command Centre',    icon: Home },
  { href: '/dashboard/today',            label: 'Today Focus',       icon: Target },
  { href: '/dashboard/commitments',      label: 'Commitments',       icon: Layers },
  { href: '/dashboard/weekly-plan',      label: 'Weekly Plan',       icon: Calendar },
  { href: '/dashboard/launch-checklists',label: 'Launch Checklists', icon: CheckSquare },
  { href: '/dashboard/parking-lot',      label: 'Parking Lot',       icon: Archive },
  { href: '/dashboard/follow-ups',       label: 'Follow-ups',        icon: Bell },
  { href: '/dashboard/review',           label: 'Friday Review',     icon: RefreshCw },
  { href: '/dashboard/chat',             label: 'AI Chat',           icon: MessageCircle },
  { href: '/dashboard/settings',         label: 'Settings',          icon: Settings },
]

interface SidebarNavProps {
  userEmail: string
  userName: string
  avatarUrl: string | null
}

export function SidebarNav({ userEmail, userName, avatarUrl }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase()

  return (
    <aside
      className="flex flex-col shrink-0 h-full"
      style={{
        width: '240px',
        backgroundColor: 'var(--sc-primary)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <span className="text-xl font-bold text-white tracking-tight">SoloChief</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                backgroundColor: isActive ? 'rgba(0,194,168,0.18)' : 'transparent',
              }}
            >
              <Icon
                size={16}
                style={{ color: isActive ? 'var(--sc-accent)' : 'rgba(255,255,255,0.45)' }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 text-white"
            style={{ backgroundColor: 'var(--sc-accent)' }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={initials} className="w-8 h-8 rounded-full object-cover" />
            ) : initials}
          </div>
          <div className="flex-1 min-w-0">
            {userName && (
              <p className="text-sm font-medium text-white truncate">{userName}</p>
            )}
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
