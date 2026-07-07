'use client'

import { useState, useEffect } from 'react'
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
  Menu,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RescueMeModal } from '@/components/rescue-me/rescue-me-modal'

// Tooltip definitions
const TOOLTIPS: Record<string, string> = {
  'Commitments': 'Things you have said yes to',
  'Parking Lot': 'Ideas you are not acting on yet',
  'Checklists': 'Steps to ship something',
  'Agent Trust': 'Control what Chief can see and do',
  'Rescue Me': 'Help when you feel overwhelmed',
}

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
      { href: '/dashboard/launch-checklists', label: 'Checklists', icon: CheckSquare },
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
  isAdmin?: boolean
}

export function SidebarNav({ userEmail, userName, avatarUrl, overdueFollowupsCount = 0, isAdmin = false }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [rescueOpen, setRescueOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dismissedTooltips, setDismissedTooltips] = useState<Set<string>>(new Set())
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  useEffect(() => {
    // Load dismissed tooltips from localStorage
    const stored = localStorage.getItem('sc-dismissed-tooltips')
    if (stored) {
      setDismissedTooltips(new Set(JSON.parse(stored)))
    }
  }, [])

  function dismissTooltip(label: string) {
    const updated = new Set(dismissedTooltips)
    updated.add(label)
    setDismissedTooltips(updated)
    localStorage.setItem('sc-dismissed-tooltips', JSON.stringify(Array.from(updated)))
    setActiveTooltip(null)
  }

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
      {/* Mobile hamburger button — hidden on desktop via CSS */}
      <button
        type="button"
        className="sc-mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="sc-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sc-sidebar${mobileOpen ? ' open' : ''}`}>
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
                const hasTooltip = TOOLTIPS[label]
                const tooltipSeen = dismissedTooltips.has(label)
                const showTooltipIndicator = hasTooltip && !tooltipSeen
                const isTooltipActive = activeTooltip === label

                return (
                  <div key={href} style={{ position: 'relative' }}>
                    <Link
                      href={href}
                      className={`sc-nav-link${active ? ' active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Icon />
                      <span style={{ flex: 1 }}>{label}</span>
                      {isFollowUps && overdueFollowupsCount > 0 && (
                        <span className="sc-nav-badge">
                          {overdueFollowupsCount > 9 ? '9+' : overdueFollowupsCount}
                        </span>
                      )}
                      {showTooltipIndicator && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setActiveTooltip(isTooltipActive ? null : label)
                          }}
                          onMouseEnter={() => setActiveTooltip(label)}
                          onMouseLeave={() => setActiveTooltip(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '4px',
                            flexShrink: 0,
                          }}
                          title={TOOLTIPS[label]}
                        >
                          <HelpCircle size={14} style={{ color: '#00C2A8', opacity: 0.6 }} />
                        </button>
                      )}
                    </Link>

                    {/* Tooltip */}
                    {isTooltipActive && hasTooltip && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '4px',
                          backgroundColor: '#1A273A',
                          border: '0.5px solid rgba(0,194,168,0.3)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          fontSize: '12px',
                          color: '#CBD5E1',
                          maxWidth: '200px',
                          whiteSpace: 'normal',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                        onMouseEnter={() => setActiveTooltip(label)}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <p style={{ margin: 0, marginBottom: '6px' }}>{TOOLTIPS[label]}</p>
                        <button
                          type="button"
                          onClick={() => dismissTooltip(label)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#00C2A8',
                            fontWeight: 500,
                          }}
                        >
                          Got it
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Feedback + Settings + Admin nav links */}
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
          <Link
            href="/dashboard/feedback"
            className={`sc-nav-link${isActive('/dashboard/feedback') ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <MessageCircle size={16} />
            <span style={{ flex: 1 }}>Feedback</span>
          </Link>

          {/* Settings with Agent Trust tooltip */}
          <div style={{ position: 'relative' }}>
            <Link
              href="/dashboard/settings"
              className={`sc-nav-link${isActive('/dashboard/settings') ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Settings size={16} />
              <span style={{ flex: 1 }}>Settings</span>
              {!dismissedTooltips.has('Agent Trust') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveTooltip(activeTooltip === 'Agent Trust' ? null : 'Agent Trust')
                  }}
                  onMouseEnter={() => setActiveTooltip('Agent Trust')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '4px',
                    flexShrink: 0,
                  }}
                  title={TOOLTIPS['Agent Trust']}
                >
                  <HelpCircle size={14} style={{ color: '#00C2A8', opacity: 0.6 }} />
                </button>
              )}
            </Link>

            {/* Agent Trust Tooltip */}
            {activeTooltip === 'Agent Trust' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: '#1A273A',
                  border: '0.5px solid rgba(0,194,168,0.3)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '12px',
                  color: '#CBD5E1',
                  maxWidth: '200px',
                  whiteSpace: 'normal',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={() => setActiveTooltip('Agent Trust')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <p style={{ margin: 0, marginBottom: '6px' }}>{TOOLTIPS['Agent Trust']}</p>
                <button
                  type="button"
                  onClick={() => dismissTooltip('Agent Trust')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#00C2A8',
                    fontWeight: 500,
                  }}
                >
                  Got it
                </button>
              </div>
            )}
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="sc-nav-link"
              onClick={() => setMobileOpen(false)}
              style={{ marginTop: 2 }}
            >
              <ShieldCheck size={16} style={{ color: '#00C2A8' }} />
              <span style={{ flex: 1 }}>Admin</span>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '1px 5px',
                borderRadius: 3,
                background: 'rgba(0,194,168,0.15)',
                color: '#00C2A8',
              }}>
                INT
              </span>
            </Link>
          )}
        </div>

        {/* Rescue Me */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setRescueOpen(true)}
            className="sc-rescue"
            onMouseEnter={() => !dismissedTooltips.has('Rescue Me') && setActiveTooltip('Rescue Me')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <LifeBuoy />
            Rescue Me
            {!dismissedTooltips.has('Rescue Me') && (
              <span style={{ marginLeft: '6px' }}>
                <HelpCircle size={14} style={{ color: '#00C2A8', opacity: 0.6, display: 'inline' }} />
              </span>
            )}
          </button>

          {/* Rescue Me Tooltip */}
          {activeTooltip === 'Rescue Me' && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 4px)',
                left: 0,
                backgroundColor: '#1A273A',
                border: '0.5px solid rgba(0,194,168,0.3)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '12px',
                color: '#CBD5E1',
                maxWidth: '200px',
                whiteSpace: 'normal',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={() => setActiveTooltip('Rescue Me')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <p style={{ margin: 0, marginBottom: '6px' }}>{TOOLTIPS['Rescue Me']}</p>
              <button
                type="button"
                onClick={() => dismissTooltip('Rescue Me')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#00C2A8',
                  fontWeight: 500,
                }}
              >
                Got it
              </button>
            </div>
          )}
        </div>

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
