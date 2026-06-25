'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding } from '@/lib/actions/onboarding'
import { sendWhatsAppOtp, verifyWhatsAppOtp } from '@/lib/actions/whatsapp'
import { TEMPLATE_DEFAULTS, TEMPLATE_LABELS, TEMPLATE_DESCRIPTIONS } from '@/lib/onboarding-data'
import type { OnboardingTemplate } from '@/types/database'
import type { CommitmentDraft } from '@/lib/onboarding-data'
import { X, Plus } from 'lucide-react'

type Step = 1 | 2 | 3 | 4

const TEMPLATES: OnboardingTemplate[] = [
  'solo_founder', 'freelancer', 'student_builder', 'creator', 'professional', 'personal_family', 'scratch',
]

let draftCounter = 0
function makeDraftId() {
  draftCounter += 1
  return `draft-${draftCounter}`
}

interface DraftItem extends CommitmentDraft {
  draftId: string
}

interface OnboardingClientProps {
  initialStep?: Step
}

export function OnboardingClient({ initialStep = 1 }: OnboardingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(initialStep)
  const [template, setTemplate] = useState<OnboardingTemplate>('solo_founder')
  const [fullName, setFullName] = useState('')
  const [commitments, setCommitments] = useState<DraftItem[]>(
    () => TEMPLATE_DEFAULTS.solo_founder.map((c) => ({ ...c, draftId: makeDraftId() }))
  )
  const [mainFocusIndex, setMainFocusIndex] = useState(0)
  const [stopItem, setStopItem] = useState('')
  const [followupTitle, setFollowupTitle] = useState('')
  const [newCommitmentTitle, setNewCommitmentTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // WhatsApp onboarding state
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const [onboardingWaPhone, setOnboardingWaPhone] = useState('')
  const [onboardingWaOtp, setOnboardingWaOtp] = useState('')
  const [onboardingWaOtpSent, setOnboardingWaOtpSent] = useState(false)
  const [onboardingWaSending, setOnboardingWaSending] = useState(false)

  function selectTemplate(t: OnboardingTemplate) {
    setTemplate(t)
    const defaults = TEMPLATE_DEFAULTS[t].map((c) => ({ ...c, draftId: makeDraftId() }))
    setCommitments(defaults)
    setMainFocusIndex(0)
  }

  function updateTitle(draftId: string, title: string) {
    setCommitments((prev) => prev.map((c) => c.draftId === draftId ? { ...c, title } : c))
  }

  function removeCommitment(draftId: string) {
    setCommitments((prev) => {
      const next = prev.filter((c) => c.draftId !== draftId)
      return next.map((c, i) => ({ ...c, priority: i + 1 }))
    })
    setMainFocusIndex((prev) => Math.max(0, prev))
  }

  function addCommitment() {
    const title = newCommitmentTitle.trim()
    if (!title) return
    setCommitments((prev) => [
      ...prev,
      {
        draftId: makeDraftId(),
        title,
        category: 'admin',
        stage: 'active',
        permission_level: 'protected_block',
        priority: prev.length + 1,
      },
    ])
    setNewCommitmentTitle('')
  }

  function handleStep1Next() {
    if (!fullName.trim()) {
      setError('Please enter your name. SoloChief uses this to personalise your experience.')
      return
    }
    setError(null)
    setStep(2)
  }

  function handleStep2Next() {
    if (commitments.length === 0) {
      setError('Add at least one commitment to continue. You can change these later.')
      return
    }
    setError(null)
    setStep(3)
  }

  function handleComplete() {
    if (!commitments[mainFocusIndex]) {
      setError('Select your main focus for this week. You can change this every Monday.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await saveOnboarding({
          template,
          fullName,
          commitments,
          mainFocusIndex,
          stopItem,
          followupTitle,
        })
        router.replace('/dashboard')
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      }
    })
  }

  const stepTitles = ['Your setup', 'Commitments', 'Connect WhatsApp', 'This Week']
  const progress = ((step - 1) / 3) * 100

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--sc-text)' }}>
          Welcome to SoloChief
        </h1>
        <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>
          Step {step} of 4 — {stepTitles[step - 1]}
        </p>
        <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sc-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress + 25}%`, backgroundColor: 'var(--sc-accent)' }}
          />
        </div>
      </div>

      {/* Step 1 — Template */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--sc-text)' }}>
            What are you mostly managing right now?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--sc-muted)' }}>
            This helps SoloChief suggest your first commitments. You can change everything later.
          </p>
          <div className="space-y-2 mb-6">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => selectTemplate(t)}
                className="w-full text-left p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: template === t ? 'var(--sc-accent)' : 'var(--sc-border)',
                  backgroundColor: template === t ? 'rgba(0,194,168,0.06)' : 'var(--sc-surface)',
                }}
              >
                <p className="font-medium text-sm" style={{ color: 'var(--sc-text)' }}>
                  {TEMPLATE_LABELS[t]}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--sc-muted)' }}>
                  {TEMPLATE_DESCRIPTIONS[t]}
                </p>
              </button>
            ))}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sc-text)' }}>
              Your name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="How should SoloChief address you?"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                borderColor: 'var(--sc-border)',
                backgroundColor: 'var(--sc-surface)',
                color: 'var(--sc-text)',
              }}
            />
          </div>
          {error && (
            <p className="text-sm mb-4" style={{ color: 'var(--sc-error)' }}>{error}</p>
          )}
          <button
            type="button"
            onClick={handleStep1Next}
            className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors"
            style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2 — Commitments */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--sc-text)' }}>
            Your commitments
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--sc-muted)' }}>
            Edit these to match what you are actually carrying. Delete anything that doesn&apos;t apply.
          </p>
          {commitments.length === 0 && (
            <p className="text-sm mb-4" style={{ color: 'var(--sc-muted)' }}>
              No commitments yet. Add your first one below.
            </p>
          )}
          <div className="space-y-2 mb-4">
            {commitments.map((c, i) => (
              <div
                key={c.draftId}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
              >
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{ backgroundColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
                >
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={c.title}
                  onChange={(e) => updateTitle(c.draftId, e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--sc-text)' }}
                />
                <button
                  type="button"
                  onClick={() => removeCommitment(c.draftId)}
                  className="shrink-0 p-1 rounded transition-colors hover:bg-[var(--sc-border)]"
                  style={{ color: 'var(--sc-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCommitmentTitle}
              onChange={(e) => setNewCommitmentTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCommitment() }}
              placeholder="Add a commitment..."
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
              style={{
                borderColor: 'var(--sc-border)',
                backgroundColor: 'var(--sc-surface)',
                color: 'var(--sc-text)',
              }}
            />
            <button
              type="button"
              onClick={addCommitment}
              className="px-3 py-2 rounded-lg border text-sm transition-colors hover:bg-[var(--sc-border)]"
              style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
            >
              <Plus size={16} />
            </button>
          </div>
          {error && (
            <p className="text-sm mb-4" style={{ color: 'var(--sc-error)' }}>{error}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep(1); setError(null) }}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors"
              style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleStep2Next}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — WhatsApp Connection */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--sc-text)' }}>
            WhatsApp Connection
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--sc-muted)' }}>
            Connect your WhatsApp to receive your daily brief and log updates on the go.
          </p>

          {/* Part A: Sandbox join block (only in sandbox mode) */}
          {process.env.NEXT_PUBLIC_TWILIO_SANDBOX === 'true' && (
            <div className="p-4 rounded-lg border mb-4" style={{ borderColor: 'var(--sc-border)', backgroundColor: 'rgba(0,194,168,0.05)' }}>
              <a
                href="https://wa.me/14155238886?text=join%20machine-spin"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2.5 rounded-lg font-medium text-sm transition-colors text-center"
                style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
              >
                Open WhatsApp to Connect
              </a>
              <p className="text-xs mt-2" style={{ color: 'var(--sc-muted)' }}>
                This opens WhatsApp with the join code pre-filled. Send the message, then come back here.
              </p>
            </div>
          )}

          {/* Part B: Phone linking flow */}
          <div style={{ marginBottom: 6 }}>
            {/* Status indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 'var(--sc-r)',
              border: '0.5px solid var(--sc-border)', backgroundColor: 'var(--sc-bg)', marginBottom: 16,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                backgroundColor: whatsappNumber ? 'var(--sc-teal, #00C2A8)' : 'var(--sc-muted)',
              }} />
              <div style={{ flex: 1 }}>
                {whatsappNumber ? (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>
                      Connected — {whatsappNumber.slice(0, 3)} *** {whatsappNumber.slice(-4)}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>
                      Ready to receive updates.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)' }}>Not connected</p>
                    <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 1 }}>
                      Enter your WhatsApp phone number to proceed.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Phone input if not connected */}
            {!whatsappNumber && (
              <div>
                <div className="sc-field" style={{ marginBottom: 12 }}>
                  <label className="sc-label">WhatsApp number (with country code)</label>
                  <input
                    type="tel"
                    className="sc-input"
                    placeholder="+27 831 234 567"
                    value={onboardingWaPhone}
                    onChange={e => { setOnboardingWaPhone(e.target.value); setError(null) }}
                    style={{ marginTop: 6 }}
                    autoFocus
                  />
                </div>
                {error && error.includes('WhatsApp') && <p style={{ fontSize: 12, color: 'var(--sc-error, #EF4444)', marginBottom: 10 }}>{error}</p>}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors"
                  style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
                  onClick={async () => {
                    setError(null)
                    setOnboardingWaSending(true)
                    const result = await sendWhatsAppOtp(onboardingWaPhone)
                    setOnboardingWaSending(false)
                    if (result.error) { setError(result.error); return }
                    setWhatsappNumber(onboardingWaPhone)
                    setOnboardingWaOtpSent(true)
                  }}
                  disabled={!onboardingWaPhone.trim() || onboardingWaSending}
                >
                  {onboardingWaSending ? 'Sending…' : 'Send verification code'}
                </button>
              </div>
            )}

            {/* OTP verification if sent */}
            {onboardingWaOtpSent && whatsappNumber && (
              <div>
                <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginBottom: 12 }}>
                  A 6-digit code was sent to {whatsappNumber}. Enter it below.
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
                    value={onboardingWaOtp}
                    onChange={e => { setOnboardingWaOtp(e.target.value.replace(/\D/g, '')); setError(null) }}
                    style={{ marginTop: 6, maxWidth: 160 }}
                    autoFocus
                  />
                </div>
                {error && error.includes('OTP') && <p style={{ fontSize: 12, color: 'var(--sc-error, #EF4444)', marginBottom: 10 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors"
                    style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
                    onClick={async () => {
                      setError(null)
                      const result = await verifyWhatsAppOtp(whatsappNumber, onboardingWaOtp)
                      if (result.error) { setError(result.error); return }
                      setOnboardingWaOtpSent(false)
                      setOnboardingWaOtp('')
                    }}
                    disabled={onboardingWaSending || onboardingWaOtp.length !== 6}
                  >
                    {onboardingWaSending ? 'Verifying…' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors"
                    style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
                    onClick={async () => {
                      setError(null)
                      const result = await sendWhatsAppOtp(whatsappNumber)
                      if (result.error) { setError(result.error); return }
                    }}
                    disabled={onboardingWaSending}
                  >
                    Resend
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div
            className="p-4 rounded-xl border mb-6"
            style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--sc-text)' }}>
              What WhatsApp integration will do:
            </p>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--sc-muted)' }}>
              <li>• Send your daily brief every morning</li>
              <li>• Let you log your day with a simple reply</li>
              <li>• Check in when you go quiet for too long</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep(2); setError(null) }}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors"
              style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — This Week's Focus */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--sc-text)' }}>
            This week
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--sc-muted)' }}>
            Set your focus before you start. You can change this on the Weekly Plan page.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--sc-text)' }}>
                Main focus this week
              </label>
              {commitments.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>
                  Add commitments in step 2 to choose a focus.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {commitments.map((c, i) => (
                    <label
                      key={c.draftId}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                      style={{
                        borderColor: mainFocusIndex === i ? 'var(--sc-accent)' : 'var(--sc-border)',
                        backgroundColor: mainFocusIndex === i ? 'rgba(0,194,168,0.06)' : 'var(--sc-surface)',
                      }}
                    >
                      <input
                        type="radio"
                        name="mainFocus"
                        checked={mainFocusIndex === i}
                        onChange={() => setMainFocusIndex(i)}
                        className="accent-[var(--sc-accent)]"
                      />
                      <span className="text-sm" style={{ color: 'var(--sc-text)' }}>
                        {c.title || `Commitment ${i + 1}`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1" style={{ fontSize: '13px', fontWeight: 500, color: '#0D0D0D' }}>
                One thing that must not be touched this week
                <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: '6px' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={stopItem}
                onChange={(e) => setStopItem(e.target.value)}
                placeholder="e.g. No new commitments, no social media"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  borderColor: 'var(--sc-border)',
                  backgroundColor: 'var(--sc-surface)',
                  color: 'var(--sc-text)',
                }}
              />
            </div>

            <div>
              <label className="block mb-1" style={{ fontSize: '13px', fontWeight: 500, color: '#0D0D0D' }}>
                One follow-up that cannot slip this week
                <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: '6px' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={followupTitle}
                onChange={(e) => setFollowupTitle(e.target.value)}
                placeholder="e.g. Chase payment from a client, confirm appointment"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  borderColor: 'var(--sc-border)',
                  backgroundColor: 'var(--sc-surface)',
                  color: 'var(--sc-text)',
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm mb-4" style={{ color: 'var(--sc-error)' }}>{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep(3); setError(null) }}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors"
              style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
              disabled={isPending}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
              style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
            >
              {isPending ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
