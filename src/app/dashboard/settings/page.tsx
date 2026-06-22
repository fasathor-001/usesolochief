'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { MessageSquare, Clock, Sun, Smartphone, User, Trash2, Download, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/ui/solochief/PageHeader'

type ThemeValue = 'light' | 'dark' | 'system'
type Section = 'communication' | 'schedule' | 'appearance' | 'whatsapp' | 'account' | 'data'

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

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'schedule',      label: 'Schedule',       icon: Clock },
  { id: 'appearance',   label: 'Appearance',      icon: Sun },
  { id: 'whatsapp',     label: 'WhatsApp',         icon: Smartphone },
  { id: 'account',      label: 'Account',          icon: User },
  { id: 'data',         label: 'Data & Danger Zone', icon: Trash2 },
]

function applyTheme(value: ThemeValue) {
  const root = document.documentElement
  if (value === 'dark') root.classList.add('dark')
  else if (value === 'light') root.classList.remove('dark')
  else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('communication')

  // Communication
  const [checkInIntensity, setCheckInIntensity] = useState('moderate')
  const [preferredChannel, setPreferredChannel] = useState('email')
  const [commMode, setCommMode] = useState('ai_first')

  // Schedule
  const [timezone, setTimezone] = useState('Europe/London')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [quietStart, setQuietStart] = useState('21:00')
  const [quietEnd, setQuietEnd] = useState('08:00')

  // Appearance
  const [theme, setTheme] = useState<ThemeValue>('system')

  // Account
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
    const stored = (localStorage.getItem('sc-theme') ?? 'system') as ThemeValue
    setTheme(stored)
    // Honour ?section=... from topbar Appearance shortcut
    const params = new URLSearchParams(window.location.search)
    const sec = params.get('section') as Section | null
    if (sec && NAV_ITEMS.some(n => n.id === sec)) {
      setActiveSection(sec)
    }
  }, [])

  function handleThemeChange(value: ThemeValue) {
    setTheme(value)
    localStorage.setItem('sc-theme', value)
    applyTheme(value)
  }

  function handleSave(section: string) {
    toast.success(`${section} saved.`)
  }

  return (
    <div className="sc-content">
      <PageHeader title="Settings" subtitle="Manage how SoloChief works with you." />

      <div className="sc-settings-layout">
        {/* Left nav */}
        <aside className="sc-settings-nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
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
        </aside>

        {/* Right content */}
        <main className="sc-settings-content">

          {/* ── Communication ─────────────────────────────────────────── */}
          {activeSection === 'communication' && (
            <>
              <div className="sc-settings-card">
                <div className="sc-settings-card-header">
                  <p className="sc-settings-card-title">Check-in intensity</p>
                  <p className="sc-settings-card-subtitle">How often SoloChief checks in with you during the day.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { value: 'light',     label: 'Light',     desc: 'Morning summary only.' },
                    { value: 'moderate',  label: 'Moderate',  desc: 'Morning, midday nudge, and evening wrap-up.' },
                    { value: 'intensive', label: 'Intensive', desc: 'Full daily check-ins with proactive prompts.' },
                  ].map(opt => (
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
                  {[
                    { value: 'email',    label: 'Email' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'in_app',   label: 'In-app only' },
                  ].map(opt => (
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
                  {[
                    { value: 'ai_first',  label: 'AI-first',  desc: 'SoloChief proactively surfaces insights and nudges during the day.' },
                    { value: 'on_demand', label: 'On demand', desc: 'SoloChief only responds when you ask. No proactive messages.' },
                    { value: 'focused',   label: 'Focused',   desc: 'Minimal interruptions. Weekly summary only.' },
                  ].map(opt => (
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
                  onClick={() => handleSave('Communication settings')}
                >
                  Save communication
                </button>
              </div>
            </>
          )}

          {/* ── Schedule ──────────────────────────────────────────────── */}
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
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="sc-input"
                    style={{ marginTop: 6 }}
                  />
                </div>
                <div className="sc-field">
                  <label className="sc-label">Working day ends</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="sc-input"
                    style={{ marginTop: 6 }}
                  />
                </div>
              </div>

              <p className="sc-section-heading" style={{ marginBottom: 10, marginTop: 4 }}>QUIET HOURS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="sc-field">
                  <label className="sc-label">From</label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={e => setQuietStart(e.target.value)}
                    className="sc-input"
                    style={{ marginTop: 6 }}
                  />
                </div>
                <div className="sc-field">
                  <label className="sc-label">Until</label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={e => setQuietEnd(e.target.value)}
                    className="sc-input"
                    style={{ marginTop: 6 }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="sc-btn sc-btn-primary sc-btn-sm"
                onClick={() => handleSave('Schedule settings')}
              >
                Save schedule
              </button>
            </div>
          )}

          {/* ── Appearance ────────────────────────────────────────────── */}
          {activeSection === 'appearance' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">Appearance</p>
                <p className="sc-settings-card-subtitle">Choose how SoloChief appears on this device.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              <p className="sc-meta" style={{ marginTop: 14 }}>
                Preference is saved to this device. Full dark mode design is being refined.
              </p>
            </div>
          )}

          {/* ── WhatsApp ──────────────────────────────────────────────── */}
          {activeSection === 'whatsapp' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">WhatsApp</p>
                <p className="sc-settings-card-subtitle">Receive summaries and reply to SoloChief via WhatsApp.</p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--sc-r)',
                border: '0.5px solid var(--sc-border)',
                backgroundColor: 'var(--sc-bg)',
                marginBottom: 14,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--sc-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>Not connected</p>
                  <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>
                    Connect WhatsApp to receive morning summaries and reply via chat.
                  </p>
                </div>
              </div>
              <button type="button" className="sc-btn sc-btn-secondary sc-btn-sm" disabled>
                Connect WhatsApp
              </button>
              <p className="sc-meta" style={{ marginTop: 8 }}>
                WhatsApp connection will be available when the messaging channel is enabled for your account.
              </p>
            </div>
          )}

          {/* ── Account ───────────────────────────────────────────────── */}
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

              <div className="sc-field" style={{ marginBottom: 20 }}>
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

              <button
                type="button"
                className="sc-btn sc-btn-primary sc-btn-sm"
                onClick={() => handleSave('Account settings')}
              >
                Save account
              </button>
            </div>
          )}

          {/* ── Data & Danger Zone ────────────────────────────────────── */}
          {activeSection === 'data' && (
            <div className="sc-settings-card">
              <div className="sc-settings-card-header">
                <p className="sc-settings-card-title">Data</p>
                <p className="sc-settings-card-subtitle">Export your data or close your account.</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 4 }}>Export my data</p>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 10 }}>
                  Download everything SoloChief has stored for you — commitments, logs, reviews, and notes.
                </p>
                <button type="button" className="sc-btn sc-btn-secondary sc-btn-sm" disabled>
                  <Download size={13} />
                  Export my data
                </button>
                <p className="sc-meta" style={{ marginTop: 6 }}>Data export is available in an upcoming release.</p>
              </div>

              <div style={{ borderTop: '0.5px solid rgba(239,68,68,0.18)', paddingTop: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-error)', marginBottom: 4 }}>Danger zone</p>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 12 }}>
                  Deleting your account is permanent and cannot be undone. All your data will be removed.
                </p>
                <button
                  type="button"
                  className="sc-btn sc-btn-danger sc-btn-sm"
                  onClick={() => toast.error('Account deletion — contact support to proceed.')}
                >
                  <Trash2 size={13} />
                  Delete account
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
