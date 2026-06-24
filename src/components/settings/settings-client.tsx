'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  MessageSquare, Clock, Sun, Smartphone, User, Trash2, Download,
  Shield, Bot, Lock, MessageCircle, Monitor, ChevronDown, CreditCard, CheckCircle, X,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/solochief/PageHeader'
import { upsertPreferences, upsertProfile } from '@/lib/actions/preferences'
import { sendWhatsAppOtp, verifyWhatsAppOtp, unlinkWhatsApp, toggleWhatsAppNotifications } from '@/lib/actions/whatsapp'
import { createCheckoutSession, createCustomerPortalSession } from '@/lib/actions/billing'
import { createClient } from '@/lib/supabase/client'
import { applyTheme, setStoredTheme } from '@/lib/theme'
import type { ThemeValue } from '@/lib/theme'
import type { UserPreferences } from '@/types/database'
type Section =
  | 'billing'
  | 'communication'
  | 'focus-rules'
  | 'ai-behaviour'
  | 'schedule'
  | 'appearance'
  | 'mobile-app'
  | 'whatsapp'
  | 'account'
  | 'security'
  | 'data-privacy'
  | 'danger-zone'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PRO_BILLING_FEATURES = [
  'Unlimited commitments',
  'AI Chat with full context',
  'AI planning assistance',
  'Weekly review intelligence',
  'Email reminders',
]

const OPERATOR_BILLING_FEATURES = [
  'Everything in Pro',
  'WhatsApp Chief of Staff',
  'WhatsApp quick commands',
  'Daily check-ins',
  'Follow-up and review prompts through WhatsApp',
]

const TIMEZONES = [
  'Europe/London',
  'Europe/Dublin',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Australia/Sydney',
]

type NavItem = { id: Section; label: string; icon: React.ElementType }

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Product behaviour',
    items: [
      { id: 'communication', label: 'Communication', icon: MessageSquare },
      { id: 'focus-rules',   label: 'Focus Rules',   icon: Shield },
      { id: 'ai-behaviour',  label: 'AI Behaviour',  icon: Bot },
      { id: 'schedule',      label: 'Schedule',      icon: Clock },
    ],
  },
  {
    label: 'Channels & device',
    items: [
      { id: 'appearance', label: 'Appearance', icon: Sun },
      { id: 'mobile-app', label: 'Mobile App', icon: Monitor },
      { id: 'whatsapp',   label: 'WhatsApp',   icon: MessageCircle },
    ],
  },
  {
    label: 'Account & trust',
    items: [
      { id: 'account',      label: 'Account',       icon: User },
      { id: 'billing',      label: 'Billing',       icon: CreditCard },
      { id: 'security',     label: 'Security',      icon: Lock },
      { id: 'data-privacy', label: 'Data & Privacy', icon: Lock },
      { id: 'danger-zone',  label: 'Danger Zone',   icon: Trash2 },
    ],
  },
]

// Flat list for section validation and active-item lookup
const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items)

function formatMemberSince(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return '—'
  }
}

interface SettingsClientProps {
  preferences: UserPreferences | null
  userEmail: string | null
  profile: {
    full_name: string | null
    created_at: string
    plan_expires_at: string | null
    plan_cancelled_at: string | null
  } | null
  currentPlan: string
  hasPasswordProvider: boolean
  whatsappNumber: string | null
  whatsappVerified: boolean
  whatsappNotificationsEnabled: boolean
}

export function SettingsClient({ preferences, userEmail, profile, currentPlan, hasPasswordProvider, whatsappNumber, whatsappVerified, whatsappNotificationsEnabled: initWaNotif }: SettingsClientProps) {
  const [activeSection, setActiveSection] = useState<Section>('communication')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  // ── Communication ──────────────────────────────────────────────────
  const [checkInIntensity, setCheckInIntensity] = useState(preferences?.checkin_intensity ?? 'moderate')
  const [preferredChannel, setPreferredChannel] = useState(preferences?.preferred_channel ?? 'email')
  const [commMode, setCommMode] = useState(preferences?.communication_mode ?? 'ai_first')

  // ── Focus Rules ────────────────────────────────────────────────────
  const [switchProtection, setSwitchProtection] = useState(preferences?.switch_protection ?? 'balanced')
  const [dailyFocusLimit, setDailyFocusLimit] = useState(preferences?.daily_focus_limit ?? 'one_plus_override')
  const [requireReasonOnSwitch, setRequireReasonOnSwitch] = useState(true)
  const [showStopListInToday, setShowStopListInToday] = useState(true)
  const [askBeforeRemovingNotToday, setAskBeforeRemovingNotToday] = useState(false)

  // ── AI Behaviour ───────────────────────────────────────────────────
  const [aiInterpretation, setAiInterpretation] = useState(preferences?.ai_interpretation ?? 'confirm_when_unsure')
  const [adviceStyle, setAdviceStyle] = useState(preferences?.advice_style ?? 'direct')
  const [showWhySuggested, setShowWhySuggested] = useState(true)
  const [showWhenUnsure, setShowWhenUnsure] = useState(preferences?.show_confidence ?? true)
  const [askBeforeAssumptions, setAskBeforeAssumptions] = useState(true)

  // ── Schedule ───────────────────────────────────────────────────────
  const [timezone, setTimezone] = useState(preferences?.timezone ?? 'Europe/London')
  const [startTime, setStartTime] = useState(preferences?.working_day_start ?? '09:00')
  const [endTime, setEndTime] = useState(preferences?.working_day_end ?? '18:00')
  const [quietStart, setQuietStart] = useState(preferences?.quiet_hours_start ?? '21:00')
  const [quietEnd, setQuietEnd] = useState(preferences?.quiet_hours_end ?? '08:00')

  // ── Appearance ─────────────────────────────────────────────────────
  const [theme, setTheme] = useState<ThemeValue>((preferences?.theme as ThemeValue | undefined) ?? 'system')

  // ── Mobile App install ─────────────────────────────────────────────
  const [isStandalone, setIsStandalone] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  // ── Account ────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(() => {
    const name = profile?.full_name ?? ''
    return name.split(' ')[0] ?? ''
  })
  const [lastName, setLastName] = useState(() => {
    const name = profile?.full_name ?? ''
    const parts = name.split(' ')
    return parts.length > 1 ? parts.slice(1).join(' ') : ''
  })

  // ── Security ───────────────────────────────────────────────────────
  const [hasPassword, setHasPassword] = useState(hasPasswordProvider)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // ── Billing ────────────────────────────────────────────────────────
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  // ── Danger Zone ────────────────────────────────────────────────────
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ── WhatsApp ───────────────────────────────────────────────────────
  type WaState = 'connected' | 'not_connected' | 'entering_phone' | 'otp_sent'
  const [waState,      setWaState]      = useState<WaState>(whatsappVerified ? 'connected' : 'not_connected')
  const [waPhone,      setWaPhone]      = useState(whatsappNumber ?? '')
  const [waPhoneInput, setWaPhoneInput] = useState('')
  const [waOtp,        setWaOtp]        = useState('')
  const [waLoading,    setWaLoading]    = useState(false)
  const [waError,      setWaError]      = useState('')
  const [waNotif,      setWaNotif]      = useState(initWaNotif)

  useEffect(() => {
    // Apply saved theme on mount
    const storedTheme = (preferences?.theme as ThemeValue | undefined) ?? (localStorage.getItem('sc-theme') ?? 'system') as ThemeValue
    setTheme(storedTheme)
    applyTheme(storedTheme)  // direct call on mount — no need to dispatch storage event

    // Honour ?section=... deep-link from topbar shortcuts
    const params = new URLSearchParams(window.location.search)
    const sec = params.get('section') as Section | null
    if (sec && NAV_ITEMS.some(n => n.id === sec)) {
      setActiveSection(sec)
    }

    // PWA install state
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true,
    )
    setCanInstall(!!(window as unknown as { _scInstallPrompt?: unknown })._scInstallPrompt)

    const onPrompt = () => setCanInstall(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [preferences?.theme])

  function handleThemeChange(value: ThemeValue) {
    setTheme(value)
    setStoredTheme(value)
  }

  async function handleUpgrade(plan: 'pro' | 'operator') {
    setUpgradeLoading(plan)
    const result = await createCheckoutSession(plan)
    setUpgradeLoading(null)
    if (result.error) { alert(result.error); return }
    if (result.url) window.location.href = result.url
  }

  async function handleManageSubscription() {
    setPortalLoading(true)
    const result = await createCustomerPortalSession()
    setPortalLoading(false)
    if (result.error) { alert(result.error); return }
    if (result.url) window.location.href = result.url
  }

  function handleInstall() {
    const prompt = (window as unknown as { _scInstallPrompt?: BeforeInstallPromptEvent })._scInstallPrompt
    if (!prompt) return
    prompt.prompt()
    prompt.userChoice.then(({ outcome }) => {
      if (outcome === 'accepted') setIsStandalone(true)
      setCanInstall(false)
    })
  }

  async function saveCommunication() {
    setSaving('communication')
    const result = await upsertPreferences({
      checkin_intensity: checkInIntensity,
      preferred_channel: preferredChannel,
      communication_mode: commMode,
    })
    setSaving(null)
    if (result?.error) toast.error(result.error)
    else toast.success('Communication saved.')
  }

  async function saveFocusRules() {
    setSaving('focus-rules')
    const result = await upsertPreferences({
      switch_protection: switchProtection,
      daily_focus_limit: dailyFocusLimit,
    })
    setSaving(null)
    if (result?.error) toast.error(result.error)
    else toast.success('Focus rules saved.')
  }

  async function saveAiBehaviour() {
    setSaving('ai-behaviour')
    const result = await upsertPreferences({
      ai_interpretation: aiInterpretation,
      advice_style: adviceStyle,
      show_confidence: showWhenUnsure,
    })
    setSaving(null)
    if (result?.error) toast.error(result.error)
    else toast.success('AI behaviour saved.')
  }

  async function saveSchedule() {
    setSaving('schedule')
    const result = await upsertPreferences({
      timezone,
      working_day_start: startTime,
      working_day_end: endTime,
      quiet_hours_start: quietStart,
      quiet_hours_end: quietEnd,
    })
    setSaving(null)
    if (result?.error) toast.error(result.error)
    else toast.success('Schedule saved.')
  }

  async function saveAppearance() {
    setSaving('appearance')
    const result = await upsertPreferences({ theme })
    setSaving(null)
    if (result?.error) toast.error(result.error)
    else toast.success('Appearance saved.')
  }

  async function saveAccount() {
    setSaving('account')
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null
    const result = await upsertProfile({ full_name: fullName })
    setSaving(null)
    if (result?.error) toast.error(result.error)
    else toast.success('Account saved.')
  }

  async function handleUpdatePassword() {
    if (hasPassword && !currentPassword) {
      setPasswordError('Enter your current password.')
      return
    }
    if (!newPassword) {
      setPasswordError('Enter a new password.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccessMsg('')

    const supabase = createClient()

    if (hasPassword) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setPasswordError('Unable to verify your account.')
        setPasswordLoading(false)
        return
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInError) {
        setPasswordError('Current password is incorrect.')
        setPasswordLoading(false)
        return
      }
    }

    const successMsg = hasPassword
      ? 'Password updated.'
      : 'Password set. You can now sign in with email and password.'

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)

    if (error) {
      setPasswordError('We could not update your password. Please try again.')
    } else {
      setHasPassword(true)
      setPasswordSuccessMsg(successMsg)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleSendMagicLink() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    setMagicLinkSent(true)
  }

  const activeNavItem = NAV_ITEMS.find(n => n.id === activeSection)

  return (
    <div className="sc-content sc-page-container">
      <PageHeader title="Settings" subtitle="Manage how SoloChief works with you." />

      {/* Mobile section switcher — hidden on desktop via CSS */}
      <div className="sc-settings-mobile-nav">
        <button
          type="button"
          className="sc-settings-mobile-toggle"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-expanded={mobileMenuOpen}
          aria-haspopup="listbox"
          aria-label="Settings menu"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeNavItem && <activeNavItem.icon size={14} />}
            {activeNavItem?.label ?? 'Settings'}
          </span>
          <ChevronDown
            size={14}
            style={{
              transition: 'transform 0.15s',
              transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          />
        </button>
        {mobileMenuOpen && (
          <div className="sc-settings-mobile-menu" role="listbox" aria-label="Settings sections">
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label} style={gi > 0 ? { marginTop: 4, paddingTop: 4, borderTop: '0.5px solid var(--sc-border)' } : undefined}>
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="option"
                    aria-selected={activeSection === id}
                    className={`sc-settings-mobile-menu-item${activeSection === id ? ' active' : ''}`}
                    onClick={() => { setActiveSection(id); setMobileMenuOpen(false) }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sc-settings-layout">
        {/* Left nav */}
        <aside className="sc-settings-nav">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} style={gi > 0 ? { marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--sc-border)' } : undefined}>
              {group.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`sc-settings-nav-item${activeSection === id ? ' active' : ''}`}
                  onClick={() => setActiveSection(id)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Right content */}
        <main className="sc-settings-content">

          {/* ── Billing ───────────────────────────────────────────── */}
          {activeSection === 'billing' && (
            <div>

              {/* Section intro */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 4 }}>Billing</p>
                <p style={{ fontSize: 13, color: 'var(--sc-text-2)', lineHeight: 1.5 }}>
                  Manage your SoloChief plan, subscription, and billing access.
                </p>
              </div>

              {/* Current plan card */}
              <div style={{
                padding: '16px 18px',
                borderRadius: 'var(--sc-r)',
                border: '0.5px solid var(--sc-border)',
                background: 'var(--sc-surface)',
                marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 3 }}>
                      {currentPlan === 'free'     && 'Free'}
                      {currentPlan === 'pro'      && 'Pro — $15/month'}
                      {currentPlan === 'operator' && 'Operator — $24/month'}
                      {currentPlan === 'chief'    && 'Chief — $39/month'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--sc-text-2)', lineHeight: 1.5 }}>
                      {currentPlan === 'free'     && 'Up to 3 commitments. No AI features.'}
                      {currentPlan === 'pro'      && 'Unlimited commitments, AI Chat, AI planning, and email reminders.'}
                      {currentPlan === 'operator' && 'Everything in Pro, plus WhatsApp Chief of Staff and daily check-ins.'}
                      {currentPlan === 'chief'    && 'Everything in Operator, plus pattern intelligence and custom agents.'}
                    </p>
                    {currentPlan !== 'free' && profile?.plan_cancelled_at && (
                      <p style={{ fontSize: 12, color: '#F59E0B', marginTop: 6 }}>
                        Cancellation scheduled. Access until {formatDate(profile.plan_expires_at)}.
                      </p>
                    )}
                    {currentPlan !== 'free' && !profile?.plan_cancelled_at && profile?.plan_expires_at && (
                      <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 6 }}>
                        Renews {formatDate(profile.plan_expires_at)}.
                      </p>
                    )}
                  </div>
                  <span style={{
                    flexShrink: 0,
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    background: currentPlan === 'free'
                      ? 'var(--sc-bg)'
                      : profile?.plan_cancelled_at
                        ? 'rgba(245,158,11,0.12)'
                        : 'rgba(0,194,168,0.12)',
                    color: currentPlan === 'free'
                      ? 'var(--sc-muted)'
                      : profile?.plan_cancelled_at
                        ? '#B45309'
                        : 'var(--sc-teal)',
                    border: currentPlan === 'free'
                      ? '0.5px solid var(--sc-border)'
                      : profile?.plan_cancelled_at
                        ? '0.5px solid rgba(245,158,11,0.3)'
                        : '0.5px solid rgba(0,194,168,0.3)',
                  }}>
                    {currentPlan === 'free' ? 'Free' : profile?.plan_cancelled_at ? 'Cancelling' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Included features — paid plans */}
              {(currentPlan === 'pro' || currentPlan === 'operator') && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--sc-r)',
                  border: '0.5px solid var(--sc-border)',
                  background: 'var(--sc-surface)',
                  marginBottom: 10,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 10 }}>
                    Included in {currentPlan === 'pro' ? 'Pro' : 'Operator'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {(currentPlan === 'pro' ? PRO_BILLING_FEATURES : OPERATOR_BILLING_FEATURES).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={12} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--sc-text-2)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscription actions — paid plans */}
              {currentPlan !== 'free' && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--sc-r)',
                  border: '0.5px solid var(--sc-border)',
                  background: 'var(--sc-surface)',
                  marginBottom: 10,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 8 }}>
                    Subscription
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--sc-text-2)', lineHeight: 1.5, marginBottom: 12 }}>
                    Update your payment method, view invoices, or cancel your subscription through the secure billing portal.
                  </p>
                  <button
                    type="button"
                    className="sc-btn sc-btn-secondary sc-btn-sm"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                  >
                    {portalLoading ? 'Loading…' : 'Manage subscription'}
                  </button>
                </div>
              )}

              {/* Upgrade: Pro → Operator */}
              {currentPlan === 'pro' && (
                <div style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--sc-r)',
                  border: '0.5px solid var(--sc-border)',
                  background: 'var(--sc-surface)',
                  marginBottom: 10,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 8 }}>
                    Upgrade to Operator
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--sc-text-2)', lineHeight: 1.5, marginBottom: 14 }}>
                    Add WhatsApp to your SoloChief. Get daily briefings, log progress on the go, and receive follow-up reminders throughout the day.
                  </p>
                  <button
                    type="button"
                    className="sc-btn sc-btn-primary sc-btn-sm"
                    onClick={() => handleUpgrade('operator')}
                    disabled={upgradeLoading === 'operator'}
                  >
                    {upgradeLoading === 'operator' ? 'Loading…' : 'Upgrade to Operator — $24/month'}
                  </button>
                </div>
              )}

              {/* Operator — highest plan */}
              {currentPlan === 'operator' && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--sc-r)',
                  border: '0.5px solid var(--sc-border)',
                  background: 'var(--sc-surface)',
                  marginBottom: 10,
                }}>
                  <p style={{ fontSize: 12, color: 'var(--sc-muted)', lineHeight: 1.5 }}>
                    You are on the highest active plan available during private beta.
                  </p>
                </div>
              )}

              {/* Free — upgrade cards */}
              {currentPlan === 'free' && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 10 }}>
                    Upgrade your plan
                  </p>

                  {/* Pro */}
                  <div style={{
                    padding: '18px',
                    borderRadius: 'var(--sc-r)',
                    border: '0.5px solid var(--sc-border)',
                    background: 'var(--sc-surface)',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 2 }}>Pro</p>
                        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--sc-text)' }}>
                          $15<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--sc-muted)' }}>/month</span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {PRO_BILLING_FEATURES.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={12} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--sc-text-2)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="sc-btn sc-btn-secondary sc-btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => handleUpgrade('pro')}
                      disabled={upgradeLoading === 'pro'}
                    >
                      {upgradeLoading === 'pro' ? 'Loading…' : 'Upgrade to Pro'}
                    </button>
                  </div>

                  {/* Operator */}
                  <div style={{
                    padding: '18px',
                    borderRadius: 'var(--sc-r)',
                    border: '0.5px solid rgba(0,194,168,0.4)',
                    background: 'rgba(0,194,168,0.03)',
                    marginBottom: 10,
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: -10, left: 14,
                      background: 'var(--sc-teal)', color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '2px 9px',
                      borderRadius: 10, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      Most popular
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sc-text)', marginBottom: 2 }}>Operator</p>
                        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--sc-text)' }}>
                          $24<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--sc-muted)' }}>/month</span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {OPERATOR_BILLING_FEATURES.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={12} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--sc-text-2)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="sc-btn sc-btn-primary sc-btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => handleUpgrade('operator')}
                      disabled={upgradeLoading === 'operator'}
                    >
                      {upgradeLoading === 'operator' ? 'Loading…' : 'Upgrade to Operator'}
                    </button>
                  </div>
                </div>
              )}

              {/* Trust note */}
              <p style={{ fontSize: 12, color: 'var(--sc-muted)', lineHeight: 1.5, marginTop: 4 }}>
                Payments are processed securely by Polar. SoloChief does not store your card details.
              </p>

            </div>
          )}

          {/* ── Communication ─────────────────────────────────────── */}
          {activeSection === 'communication' && (
            <>
              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Check-in rhythm</p>
                  <p className="sc-settings-card-subtitle">How often SoloChief checks in with you during the day.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {([
                    { value: 'light'     as const, label: 'Light',     desc: 'Morning summary only.' },
                    { value: 'moderate'  as const, label: 'Moderate',  desc: 'Morning, midday nudge, and evening wrap-up.' },
                    { value: 'intensive' as const, label: 'Intensive', desc: 'Full daily check-ins with proactive prompts.' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`sc-radio-card${checkInIntensity === opt.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="checkInIntensity"
                        value={opt.value}
                        checked={checkInIntensity === opt.value}
                        onChange={() => setCheckInIntensity(opt.value)}
                        style={{ marginTop: 2, accentColor: 'var(--sc-teal)' }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Preferred channel</p>
                  <p className="sc-settings-card-subtitle">Where you want SoloChief to reach you.</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {([
                    { value: 'email'    as const, label: 'Email' },
                    { value: 'whatsapp' as const, label: 'WhatsApp' },
                    { value: 'inapp'    as const, label: 'In-app only' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`sc-radio-card${preferredChannel === opt.value ? ' selected' : ''}`}
                      style={{ alignItems: 'center', gap: 7 }}
                    >
                      <input
                        type="radio"
                        name="preferredChannel"
                        value={opt.value}
                        checked={preferredChannel === opt.value}
                        onChange={() => setPreferredChannel(opt.value)}
                        style={{ accentColor: 'var(--sc-teal)' }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--sc-text)' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Communication mode</p>
                  <p className="sc-settings-card-subtitle">How proactively SoloChief surfaces suggestions.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {([
                    { value: 'ai_first'  as const, label: 'AI-first',  desc: 'SoloChief proactively surfaces insights and nudges during the day.' },
                    { value: 'on_demand' as const, label: 'On demand', desc: 'SoloChief only responds when you ask. No proactive messages.' },
                    { value: 'focused'   as const, label: 'Focused',   desc: 'Minimal interruptions. Weekly summary only.' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`sc-radio-card${commMode === opt.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="commMode"
                        value={opt.value}
                        checked={commMode === opt.value}
                        onChange={() => setCommMode(opt.value)}
                        style={{ marginTop: 2, accentColor: 'var(--sc-teal)' }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="sc-btn sc-btn-primary sc-btn-sm"
                  onClick={saveCommunication}
                  disabled={saving === 'communication'}
                >
                  {saving === 'communication' ? 'Saving…' : 'Save communication'}
                </button>
              </div>
            </>
          )}

          {/* ── Focus Rules ────────────────────────────────────────── */}
          {activeSection === 'focus-rules' && (
            <>
              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Switch protection</p>
                  <p className="sc-settings-card-subtitle">How firmly SoloChief resists focus switches mid-week.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {([
                    { value: 'strict'   as const, label: 'Strict',   desc: 'Any switch request must provide a reason. SoloChief will challenge you.' },
                    { value: 'balanced' as const, label: 'Balanced', desc: 'Urgent switches are allowed with a reason. Non-urgent requests are blocked.' },
                    { value: 'light'    as const, label: 'Light',    desc: 'Switches are logged but never blocked. All decisions are yours.' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`sc-radio-card${switchProtection === opt.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="switchProtection"
                        value={opt.value}
                        checked={switchProtection === opt.value}
                        onChange={() => setSwitchProtection(opt.value)}
                        style={{ marginTop: 2, accentColor: 'var(--sc-teal)' }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Daily focus limit</p>
                  <p className="sc-settings-card-subtitle">How many active focus commitments are allowed on any given day.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {([
                    { value: 'one_only'         as const, label: 'One only',       desc: 'One commitment per day. No override permitted.' },
                    { value: 'one_plus_override' as const, label: 'One + override', desc: 'One commitment per day, with a conscious override available.' },
                    { value: 'flexible'          as const, label: 'Flexible',       desc: 'No hard limit. SoloChief will flag overload but will not block.' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`sc-radio-card${dailyFocusLimit === opt.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="dailyFocusLimit"
                        value={opt.value}
                        checked={dailyFocusLimit === opt.value}
                        onChange={() => setDailyFocusLimit(opt.value)}
                        style={{ marginTop: 2, accentColor: 'var(--sc-teal)' }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Not Today behaviour</p>
                  <p className="sc-settings-card-subtitle">What happens when you defer a task using Not Today.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {[
                    { key: 'requireReasonOnSwitch',     label: 'Require a reason when switching focus', value: requireReasonOnSwitch,     set: setRequireReasonOnSwitch },
                    { key: 'showStopListInToday',       label: 'Show stop list reminder in Today view',  value: showStopListInToday,       set: setShowStopListInToday },
                    { key: 'askBeforeRemovingNotToday', label: 'Ask before removing a Not Today item',  value: askBeforeRemovingNotToday, set: setAskBeforeRemovingNotToday },
                  ].map(({ key, label, value, set }) => (
                    <label
                      key={key}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={e => set(e.target.checked)}
                        style={{ width: 15, height: 15, accentColor: 'var(--sc-teal)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--sc-text)' }}>{label}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="sc-btn sc-btn-primary sc-btn-sm"
                  onClick={saveFocusRules}
                  disabled={saving === 'focus-rules'}
                >
                  {saving === 'focus-rules' ? 'Saving…' : 'Save focus rules'}
                </button>
              </div>
            </>
          )}

          {/* ── AI Behaviour ──────────────────────────────────────── */}
          {activeSection === 'ai-behaviour' && (
            <>
              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">AI interpretation</p>
                  <p className="sc-settings-card-subtitle">When SoloChief is unsure what you mean, how should it handle the ambiguity.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {([
                    { value: 'always_confirm'     as const, label: 'Always confirm',      desc: 'SoloChief asks before acting on any interpretation.' },
                    { value: 'confirm_when_unsure' as const, label: 'Confirm when unsure', desc: 'Proceed confidently, but ask when the intent is ambiguous.' },
                    { value: 'log_automatically'   as const, label: 'Log automatically',   desc: 'Act automatically unless truly uncertain. Fastest flow.' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`sc-radio-card${aiInterpretation === opt.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="aiInterpretation"
                        value={opt.value}
                        checked={aiInterpretation === opt.value}
                        onChange={() => setAiInterpretation(opt.value)}
                        style={{ marginTop: 2, accentColor: 'var(--sc-teal)' }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Advice style</p>
                  <p className="sc-settings-card-subtitle">The tone SoloChief uses when surfacing recommendations.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {([
                    { value: 'direct'  as const, label: 'Direct',  desc: 'Short, confident, action-first. No hedging.' },
                    { value: 'gentle'  as const, label: 'Gentle',  desc: 'Supportive and reflective. Surfaces options rather than directives.' },
                    { value: 'minimal' as const, label: 'Minimal', desc: 'Data only. No interpretation or recommendations unless asked.' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className={`sc-radio-card${adviceStyle === opt.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="adviceStyle"
                        value={opt.value}
                        checked={adviceStyle === opt.value}
                        onChange={() => setAdviceStyle(opt.value)}
                        style={{ marginTop: 2, accentColor: 'var(--sc-teal)' }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Recommendation confidence</p>
                  <p className="sc-settings-card-subtitle">Control how SoloChief communicates the basis for its suggestions.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {[
                    { key: 'showWhySuggested',    label: 'Show why something was suggested',              value: showWhySuggested,    set: setShowWhySuggested },
                    { key: 'showWhenUnsure',       label: 'Show when SoloChief is uncertain',              value: showWhenUnsure,       set: setShowWhenUnsure },
                    { key: 'askBeforeAssumptions', label: 'Ask before making assumptions about my intent', value: askBeforeAssumptions, set: setAskBeforeAssumptions },
                  ].map(({ key, label, value, set }) => (
                    <label
                      key={key}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={e => set(e.target.checked)}
                        style={{ width: 15, height: 15, accentColor: 'var(--sc-teal)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--sc-text)' }}>{label}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="sc-btn sc-btn-primary sc-btn-sm"
                  onClick={saveAiBehaviour}
                  disabled={saving === 'ai-behaviour'}
                >
                  {saving === 'ai-behaviour' ? 'Saving…' : 'Save AI behaviour'}
                </button>
              </div>
            </>
          )}

          {/* ── Schedule ──────────────────────────────────────────── */}
          {activeSection === 'schedule' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">Schedule</p>
                <p className="sc-settings-card-subtitle">Your working hours and quiet periods.</p>
              </div>

              <div className="sc-field" style={{ marginBottom: 14 }}>
                <label className="sc-label">Timezone</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="sc-select"
                  style={{ marginTop: 6 }}
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="sc-field">
                  <label className="sc-label">Working day starts</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="sc-input" style={{ marginTop: 6 }} />
                </div>
                <div className="sc-field">
                  <label className="sc-label">Working day ends</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="sc-input" style={{ marginTop: 6 }} />
                </div>
              </div>

              <p className="sc-section-heading" style={{ marginBottom: 10, marginTop: 4 }}>QUIET HOURS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="sc-field">
                  <label className="sc-label">From</label>
                  <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="sc-input" style={{ marginTop: 6 }} />
                </div>
                <div className="sc-field">
                  <label className="sc-label">Until</label>
                  <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="sc-input" style={{ marginTop: 6 }} />
                </div>
              </div>

              <button
                type="button"
                className="sc-btn sc-btn-primary sc-btn-sm"
                onClick={saveSchedule}
                disabled={saving === 'schedule'}
              >
                {saving === 'schedule' ? 'Saving…' : 'Save schedule'}
              </button>
            </div>
          )}

          {/* ── Appearance ────────────────────────────────────────── */}
          {activeSection === 'appearance' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">Appearance</p>
                <p className="sc-settings-card-subtitle">Choose how SoloChief appears on this device.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {([
                  { value: 'light'  as ThemeValue, label: 'Light',  desc: 'Always use the light interface.' },
                  { value: 'dark'   as ThemeValue, label: 'Dark',   desc: 'Always use the dark interface.' },
                  { value: 'system' as ThemeValue, label: 'System', desc: 'Follow your operating system preference.' },
                ]).map(opt => (
                  <label
                    key={opt.value}
                    className={`sc-radio-card${theme === opt.value ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={opt.value}
                      checked={theme === opt.value}
                      onChange={() => handleThemeChange(opt.value)}
                      style={{ marginTop: 2, accentColor: 'var(--sc-teal)' }}
                    />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>{opt.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="sc-btn sc-btn-primary sc-btn-sm"
                onClick={saveAppearance}
                disabled={saving === 'appearance'}
              >
                {saving === 'appearance' ? 'Saving…' : 'Save appearance'}
              </button>
              <p className="sc-meta" style={{ marginTop: 14 }}>
                Preference is saved to your account. Full dark mode design is being refined.
              </p>
            </div>
          )}

          {/* ── Mobile App ────────────────────────────────────────── */}
          {activeSection === 'mobile-app' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">Mobile App</p>
                <p className="sc-settings-card-subtitle">Install SoloChief on your phone for faster daily check-ins.</p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 'var(--sc-r)',
                border: '0.5px solid var(--sc-border)',
                backgroundColor: 'var(--sc-bg)',
                marginBottom: 16,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#0F1B2D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#00C2A8',
                  fontFamily: 'Arial, sans-serif',
                }}>S</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>SoloChief AI</p>
                  <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 2 }}>
                    {isStandalone
                      ? 'Installed — running as a standalone app.'
                      : 'Not installed — runs in the browser.'}
                  </p>
                </div>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isStandalone ? 'var(--sc-success)' : 'var(--sc-muted)',
                  flexShrink: 0,
                }} />
              </div>

              {!isStandalone && (
                <>
                  {canInstall ? (
                    <>
                      <button
                        type="button"
                        className="sc-btn sc-btn-primary sc-btn-sm"
                        onClick={handleInstall}
                        style={{ marginBottom: 8 }}
                      >
                        <Smartphone size={13} />
                        Install on this device
                      </button>
                      <p className="sc-meta">
                        Adds SoloChief to your home screen. No app store needed.
                      </p>
                    </>
                  ) : (
                    <>
                      <button type="button" className="sc-btn sc-btn-secondary sc-btn-sm" disabled style={{ marginBottom: 8 }}>
                        <Smartphone size={13} />
                        Install on this device
                      </button>
                      <p className="sc-meta">
                        To install, open SoloChief in Chrome or Safari on your phone and use the browser&#39;s share or install menu.
                      </p>
                    </>
                  )}
                </>
              )}

              {isStandalone && (
                <p className="sc-meta">
                  SoloChief is already installed as a standalone app on this device.
                </p>
              )}

              <div style={{ borderTop: '0.5px solid var(--sc-border)', marginTop: 20, paddingTop: 18 }}>
                <p className="sc-section-heading" style={{ marginBottom: 8 }}>PUSH NOTIFICATIONS</p>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)' }}>
                  Push notifications will be added only after reminder rules are finalised.
                </p>
              </div>
            </div>
          )}

          {/* ── WhatsApp ──────────────────────────────────────────── */}
          {activeSection === 'whatsapp' && (
            <div>
              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">WhatsApp</p>
                  <p className="sc-settings-card-subtitle">Receive briefings and reply to SoloChief via WhatsApp.</p>
                </div>

                {/* Status indicator */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 'var(--sc-r)',
                  border: '0.5px solid var(--sc-border)', backgroundColor: 'var(--sc-bg)', marginBottom: 16,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: waState === 'connected' ? 'var(--sc-teal, #00C2A8)' : 'var(--sc-muted)',
                  }} />
                  <div style={{ flex: 1 }}>
                    {waState === 'connected' ? (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>
                          Connected — {waPhone.slice(0, 3)} *** {waPhone.slice(-4)}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>
                          Briefings and commands are active.
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>Not connected</p>
                        <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>
                          Connect WhatsApp to receive morning briefings and use quick commands.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Connected state */}
                {waState === 'connected' && (
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 18 }}>
                      <input
                        type="checkbox"
                        checked={waNotif}
                        onChange={async e => {
                          const val = e.target.checked
                          setWaNotif(val)
                          await toggleWhatsAppNotifications(val)
                        }}
                        style={{ width: 15, height: 15, accentColor: 'var(--sc-teal)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--sc-text)' }}>WhatsApp notifications enabled</span>
                    </label>
                    <button
                      type="button"
                      className="sc-btn sc-btn-secondary sc-btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--sc-error, #EF4444)' }}
                      onClick={async () => {
                        setWaLoading(true)
                        setWaError('')
                        const res = await unlinkWhatsApp()
                        setWaLoading(false)
                        if (res.error) { setWaError(res.error); return }
                        setWaState('not_connected')
                        setWaPhone('')
                      }}
                      disabled={waLoading}
                    >
                      <X size={13} />
                      {waLoading ? 'Removing…' : 'Remove WhatsApp'}
                    </button>
                  </div>
                )}

                {/* Not connected — start flow */}
                {waState === 'not_connected' && (
                  <button
                    type="button"
                    className="sc-btn sc-btn-secondary sc-btn-sm"
                    onClick={() => { setWaState('entering_phone'); setWaError('') }}
                  >
                    Connect WhatsApp
                  </button>
                )}

                {/* Enter phone */}
                {waState === 'entering_phone' && (
                  <div>
                    <div className="sc-field" style={{ marginBottom: 12 }}>
                      <label className="sc-label">WhatsApp number (with country code)</label>
                      <input
                        type="tel"
                        className="sc-input"
                        placeholder="+27831234567"
                        value={waPhoneInput}
                        onChange={e => { setWaPhoneInput(e.target.value); setWaError('') }}
                        style={{ marginTop: 6 }}
                        autoFocus
                      />
                    </div>
                    {waError && <p style={{ fontSize: 12, color: 'var(--sc-error, #EF4444)', marginBottom: 10 }}>{waError}</p>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="sc-btn sc-btn-primary sc-btn-sm"
                        onClick={async () => {
                          setWaLoading(true); setWaError('')
                          const res = await sendWhatsAppOtp(waPhoneInput)
                          setWaLoading(false)
                          if (res.error) { setWaError(res.error); return }
                          setWaPhone(waPhoneInput)
                          setWaState('otp_sent')
                        }}
                        disabled={waLoading || !waPhoneInput.trim()}
                      >
                        {waLoading ? 'Sending…' : 'Send verification code'}
                      </button>
                      <button type="button" className="sc-btn sc-btn-secondary sc-btn-sm" onClick={() => { setWaState('not_connected'); setWaError('') }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Enter OTP */}
                {waState === 'otp_sent' && (
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 12 }}>
                      A 6-digit code was sent to {waPhone}. Enter it below.
                    </p>
                    <div className="sc-field" style={{ marginBottom: 12 }}>
                      <label className="sc-label">Verification code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className="sc-input"
                        placeholder="123456"
                        value={waOtp}
                        onChange={e => { setWaOtp(e.target.value.replace(/\D/g, '')); setWaError('') }}
                        style={{ marginTop: 6, maxWidth: 160 }}
                        autoFocus
                      />
                    </div>
                    {waError && <p style={{ fontSize: 12, color: 'var(--sc-error, #EF4444)', marginBottom: 10 }}>{waError}</p>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="sc-btn sc-btn-primary sc-btn-sm"
                        onClick={async () => {
                          setWaLoading(true); setWaError('')
                          const res = await verifyWhatsAppOtp(waPhone, waOtp)
                          setWaLoading(false)
                          if (res.error) { setWaError(res.error); return }
                          setWaState('connected')
                          setWaOtp('')
                        }}
                        disabled={waLoading || waOtp.length !== 6}
                      >
                        {waLoading ? 'Verifying…' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        className="sc-btn sc-btn-secondary sc-btn-sm"
                        onClick={async () => {
                          setWaOtp('')
                          setWaError('')
                          setWaLoading(true)
                          const res = await sendWhatsAppOtp(waPhone)
                          setWaLoading(false)
                          if (res.error) setWaError(res.error)
                        }}
                        disabled={waLoading}
                      >
                        Resend code
                      </button>
                      <button type="button" className="sc-btn sc-btn-secondary sc-btn-sm" onClick={() => { setWaState('not_connected'); setWaOtp(''); setWaError('') }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {waError && waState === 'connected' && (
                  <p style={{ fontSize: 12, color: 'var(--sc-error, #EF4444)', marginTop: 10 }}>{waError}</p>
                )}
              </div>

              <div className="sc-settings-card" style={{ marginTop: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 8 }}>
                  COMMANDS
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    ['hi / briefing', 'Morning briefing'],
                    ['focus', "Today's focus"],
                    ['follow-ups', 'Due follow-ups'],
                    ['commitments', 'Active commitments'],
                    ['plan', "This week's plan"],
                    ['capture [item]', 'Save to parking lot'],
                    ['done [name]', 'Mark follow-up complete'],
                  ].map(([cmd, desc]) => (
                    <div key={cmd} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '0.5px solid var(--sc-border)' }}>
                      <code style={{ color: 'var(--sc-teal)', fontWeight: 600 }}>{cmd}</code>
                      <span style={{ color: 'var(--sc-muted)' }}>{desc}</span>
                    </div>
                  ))}
                </div>
                <p className="sc-meta" style={{ marginTop: 12 }}>
                  Sandbox number during testing: +1 415 523 8886. Send <code>join machine-spin</code> to opt in.
                </p>
              </div>
            </div>
          )}

          {/* ── Account ───────────────────────────────────────────── */}
          {activeSection === 'account' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">Account</p>
                <p className="sc-settings-card-subtitle">Your name and email address.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="sc-field">
                  <label className="sc-label">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    className="sc-input"
                    style={{ marginTop: 6 }}
                  />
                </div>
                <div className="sc-field">
                  <label className="sc-label">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Your last name"
                    className="sc-input"
                    style={{ marginTop: 6 }}
                  />
                </div>
              </div>

              <div className="sc-field" style={{ marginBottom: 14 }}>
                <label className="sc-label">Email address</label>
                <input
                  type="email"
                  value={userEmail ?? ''}
                  readOnly
                  placeholder="Loading..."
                  className="sc-input"
                  style={{ marginTop: 6, opacity: 0.6, cursor: 'not-allowed' }}
                />
                <p className="sc-meta" style={{ marginTop: 4 }}>Email address cannot be changed here.</p>
              </div>

              {profile?.created_at && (
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 20 }}>
                  Member since {formatMemberSince(profile.created_at)}
                </p>
              )}

              <button
                type="button"
                className="sc-btn sc-btn-primary sc-btn-sm"
                onClick={saveAccount}
                disabled={saving === 'account'}
              >
                {saving === 'account' ? 'Saving…' : 'Save account'}
              </button>

              {/* Private beta card */}
              <div style={{
                marginTop: 24,
                padding: '14px 16px',
                borderRadius: 'var(--sc-r)',
                border: '0.5px solid var(--sc-border)',
                backgroundColor: 'var(--sc-bg)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 8 }}>
                  Private beta
                </p>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', lineHeight: 1.6 }}>
                  SoloChief is currently in private beta. Some features may be refined as the product learns from real usage.
                </p>
                <a
                  href="mailto:hello@astorstack.com?subject=SoloChief%20AI%20Feedback"
                  style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: 'var(--sc-teal)', fontWeight: 500 }}
                >
                  Send feedback →
                </a>
              </div>
            </div>
          )}

          {/* ── Security ─────────────────────────────────────────── */}
          {activeSection === 'security' && (
            <div>
              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">
                    {hasPassword ? 'Change password' : 'Set password'}
                  </p>
                  {!hasPassword && (
                    <p className="sc-settings-card-subtitle">
                      You currently sign in with a secure email link. Set a password if you want to sign in with email and password as well.
                    </p>
                  )}
                </div>

                {hasPassword && (
                  <div className="sc-field" style={{ marginBottom: 12 }}>
                    <label className="sc-label">Current password</label>
                    <input
                      type="password"
                      className="sc-input"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setPasswordError('') }}
                      style={{ marginTop: 6 }}
                    />
                  </div>
                )}

                <div className="sc-field" style={{ marginBottom: 12 }}>
                  <label className="sc-label">New password</label>
                  <input
                    type="password"
                    className="sc-input"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPasswordError('') }}
                    style={{ marginTop: 6 }}
                  />
                </div>

                <div className="sc-field" style={{ marginBottom: 16 }}>
                  <label className="sc-label">Confirm new password</label>
                  <input
                    type="password"
                    className="sc-input"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setPasswordError('') }}
                    style={{ marginTop: 6 }}
                  />
                </div>

                {passwordError && (
                  <p style={{ fontSize: '13px', color: 'var(--sc-error, #EF4444)', marginBottom: '12px' }}>
                    {passwordError}
                  </p>
                )}

                {passwordSuccessMsg && (
                  <p style={{ fontSize: '13px', color: 'var(--sc-success, #16a34a)', marginBottom: '12px' }}>
                    {passwordSuccessMsg}
                  </p>
                )}

                <button
                  type="button"
                  className="sc-btn sc-btn-primary sc-btn-sm"
                  onClick={handleUpdatePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? (hasPassword ? 'Updating…' : 'Setting…')
                    : (hasPassword ? 'Update password' : 'Set password')}
                </button>
              </div>

              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Sign-in options</p>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--sc-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {hasPassword
                    ? 'You can sign in with your password or request a secure email link when needed.'
                    : 'You can continue using secure email links, or set a password above.'}
                </p>
                <button
                  type="button"
                  className="sc-btn sc-btn-secondary sc-btn-sm"
                  onClick={handleSendMagicLink}
                  disabled={magicLinkSent}
                >
                  {magicLinkSent ? 'Check your email' : 'Send secure sign-in link'}
                </button>
              </div>
            </div>
          )}

          {/* ── Data & Privacy ────────────────────────────────────── */}
          {activeSection === 'data-privacy' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">Data & Privacy</p>
                <p className="sc-settings-card-subtitle">Access, export, or understand the data SoloChief holds for you.</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 4 }}>What SoloChief&apos;s AI sees</p>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 10, lineHeight: 1.6 }}>
                  Before every AI response, SoloChief loads your commitments, weekly plan, today&apos;s focus, follow-ups, parking lot, and recent logs. This context is only used to respond to you and is never shared with other users.
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 4 }}>Export my data</p>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 10 }}>
                  Download everything SoloChief has stored for you — commitments, logs, reviews, and notes.
                </p>
                <button
                  type="button"
                  className="sc-btn sc-btn-secondary sc-btn-sm"
                  disabled
                >
                  <Download size={13} />
                  Export my data
                </button>
                <p className="sc-meta" style={{ marginTop: 6 }}>Data export is not yet available in private beta.</p>
              </div>

              <div style={{ borderTop: '0.5px solid var(--sc-border)', paddingTop: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>What data SoloChief stores</p>
                <ul style={{ fontSize: 12, color: 'var(--sc-muted)', lineHeight: 1.7, paddingLeft: 16 }}>
                  <li>Your commitments, stages, and history</li>
                  <li>Daily logs, weekly plans, and Friday reviews</li>
                  <li>Follow-ups, parking lot ideas, and switch requests</li>
                  <li>AI chat messages associated with your account</li>
                  <li>Your profile settings and preferences</li>
                </ul>
                <p className="sc-meta" style={{ marginTop: 10 }}>
                  No data is sold or shared with third parties. SoloChief AI processing uses the Anthropic API with your data processed in transit only.
                </p>
              </div>
            </div>
          )}

          {/* ── Danger Zone ───────────────────────────────────────── */}
          {activeSection === 'danger-zone' && (
            <div className="sc-settings-card" style={{ borderColor: 'rgba(239,68,68,0.22)' }}>
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title" style={{ color: 'var(--sc-error)' }}>Danger Zone</p>
                <p className="sc-settings-card-subtitle">Destructive actions. These cannot be undone.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 4 }}>Reset all settings</p>
                  <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 10 }}>
                    Restore all settings to their default values. Your data is not affected.
                  </p>
                  <button
                    type="button"
                    className="sc-btn sc-btn-secondary sc-btn-sm"
                    onClick={() => toast.error('Settings reset — contact support to proceed.')}
                  >
                    Reset settings
                  </button>
                </div>

                <div style={{ borderTop: '0.5px solid rgba(239,68,68,0.18)', paddingTop: 18 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-error)', marginBottom: 4 }}>Delete account</p>
                  <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 12 }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      className="sc-btn sc-btn-danger sc-btn-sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 size={13} />
                      Delete my account
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ fontSize: 12, color: 'var(--sc-muted)' }}>
                        Type <strong>DELETE</strong> to confirm.
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="sc-input"
                        style={{ maxWidth: 200 }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          type="button"
                          className="sc-btn sc-btn-danger sc-btn-sm"
                          disabled={deleteConfirmText !== 'DELETE'}
                          onClick={() => toast.error('Account deletion — contact hello@astorstack.com to proceed.')}
                        >
                          <Trash2 size={13} />
                          Confirm deletion
                        </button>
                        <button
                          type="button"
                          className="sc-btn sc-btn-secondary sc-btn-sm"
                          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
