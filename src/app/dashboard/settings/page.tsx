'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Settings, MessageSquare, Clock, Smartphone, User, Zap, Download, Trash2 } from 'lucide-react'

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

export default function SettingsPage() {
  const [checkInIntensity, setCheckInIntensity] = useState('moderate')
  const [preferredChannel, setPreferredChannel] = useState('email')
  const [timezone, setTimezone] = useState('Europe/London')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [quietStart, setQuietStart] = useState('21:00')
  const [quietEnd, setQuietEnd] = useState('08:00')
  const [commMode, setCommMode] = useState('ai_first')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  function handleSave(section: string) {
    toast.success(`${section} saved. (Persistence coming in the next build.)`)
  }

  return (
    <>
      {/* Topbar */}
      <div className="sc-topbar">
        <div className="sc-topbar-left">
          <span className="sc-topbar-title">Settings</span>
          <span className="sc-topbar-sub">Manage your account and preferences.</span>
        </div>
        <div className="sc-topbar-actions">
          <Settings size={16} style={{ color: 'var(--sc-muted)' }} />
        </div>
      </div>

      <div className="sc-content sc-content-narrow">

        {/* Section: Communication */}
        <div className="sc-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <MessageSquare size={14} style={{ color: 'var(--sc-teal)' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)' }}>Communication</p>
          </div>

          <div className="sc-field" style={{ marginBottom: 18 }}>
            <label className="sc-label">Check-in intensity</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              {[
                { value: 'light', label: 'Light', desc: 'Morning summary only.' },
                { value: 'moderate', label: 'Moderate', desc: 'Morning, midday nudge, and evening wrap-up.' },
                { value: 'intensive', label: 'Intensive', desc: 'Full daily check-ins with proactive prompts.' },
              ].map(opt => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 'var(--sc-radius)',
                    border: `0.5px solid ${checkInIntensity === opt.value ? 'var(--sc-teal)' : 'var(--sc-border)'}`,
                    backgroundColor: checkInIntensity === opt.value ? 'var(--sc-teal-10)' : 'var(--sc-surface)',
                    cursor: 'pointer',
                  }}
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

          <div className="sc-field" style={{ marginBottom: 18 }}>
            <label className="sc-label">Preferred channel</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[
                { value: 'email', label: 'Email' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'in_app', label: 'In-app only' },
              ].map(opt => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--sc-radius)',
                    border: `0.5px solid ${preferredChannel === opt.value ? 'var(--sc-teal)' : 'var(--sc-border)'}`,
                    backgroundColor: preferredChannel === opt.value ? 'var(--sc-teal-10)' : 'var(--sc-surface)',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: preferredChannel === opt.value ? 'var(--sc-teal)' : 'var(--sc-text)',
                  }}
                >
                  <input
                    type="radio"
                    name="preferredChannel"
                    value={opt.value}
                    checked={preferredChannel === opt.value}
                    onChange={() => setPreferredChannel(opt.value)}
                    style={{ accentColor: 'var(--sc-teal)' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="sc-btn sc-btn-primary sc-btn-sm"
            onClick={() => handleSave('Communication settings')}
          >
            Save communication
          </button>
        </div>

        {/* Section: Schedule */}
        <div className="sc-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Clock size={14} style={{ color: 'var(--sc-teal)' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)' }}>Schedule</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
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

        {/* Section: WhatsApp */}
        <div className="sc-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Smartphone size={14} style={{ color: 'var(--sc-teal)' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)' }}>WhatsApp</p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 'var(--sc-radius)',
            border: '0.5px solid var(--sc-border)',
            backgroundColor: 'var(--sc-bg)',
            marginBottom: 12,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--sc-muted)',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>Not connected</p>
              <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>
                Connect WhatsApp to receive morning summaries and reply via chat.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="sc-btn sc-btn-secondary sc-btn-sm"
            onClick={() => toast.success('WhatsApp connection — coming in the next build.')}
          >
            Connect WhatsApp
          </button>
        </div>

        {/* Section: Account */}
        <div className="sc-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <User size={14} style={{ color: 'var(--sc-teal)' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)' }}>Account</p>
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

          <div className="sc-field" style={{ marginBottom: 18 }}>
            <label className="sc-label">Email address</label>
            <input
              type="email"
              value="fasathor@icloud.com"
              readOnly
              className="sc-input"
              style={{ marginTop: 6, opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p className="sc-meta" style={{ marginTop: 4 }}>Email address cannot be changed here.</p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
            <button
              type="button"
              className="sc-btn sc-btn-primary sc-btn-sm"
              onClick={() => handleSave('Account settings')}
            >
              Save account
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '0.5px solid var(--sc-border)', margin: '4px 0 16px' }} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="sc-btn sc-btn-ghost sc-btn-sm"
              onClick={() => toast.success('Export started — coming in the next build.')}
            >
              <Download size={13} />
              Export my data
            </button>
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

        {/* Section: Communication mode */}
        <div className="sc-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Zap size={14} style={{ color: 'var(--sc-teal)' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)' }}>Communication mode</p>
          </div>
          <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 14 }}>
            Controls how proactively SoloChief surfaces suggestions and interrupts you.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {[
              { value: 'ai_first', label: 'AI-first', desc: 'SoloChief proactively surfaces insights and nudges during the day.' },
              { value: 'on_demand', label: 'On demand', desc: 'SoloChief only responds when you ask. No proactive messages.' },
              { value: 'focused', label: 'Focused', desc: 'Minimal interruptions. Weekly summary only.' },
            ].map(opt => (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--sc-radius)',
                  border: `0.5px solid ${commMode === opt.value ? 'var(--sc-teal)' : 'var(--sc-border)'}`,
                  backgroundColor: commMode === opt.value ? 'var(--sc-teal-10)' : 'var(--sc-surface)',
                  cursor: 'pointer',
                }}
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
            onClick={() => handleSave('Communication mode')}
          >
            Save mode
          </button>
        </div>

      </div>
    </>
  )
}
