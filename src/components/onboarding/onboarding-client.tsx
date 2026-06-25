'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding } from '@/lib/actions/onboarding'
import { generateWhatsAppConnectLink, getWhatsAppStatus } from '@/lib/actions/whatsapp'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_DEFAULTS, TEMPLATE_LABELS, TEMPLATE_DESCRIPTIONS } from '@/lib/onboarding-data'
import type { OnboardingTemplate } from '@/types/database'
import type { CommitmentDraft } from '@/lib/onboarding-data'
import { X, Plus, Loader2, CheckCircle2 } from 'lucide-react'

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
  type WaState = 'default' | 'waiting' | 'connected'
  const [waState, setWaState] = useState<WaState>('default')
  const [waGenerating, setWaGenerating] = useState(false)

  // Set up Realtime subscription for WhatsApp connection status
  useEffect(() => {
    if (waState !== 'waiting') return

    const setupRealtime = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel(`whatsapp-connection-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload: any) => {
          if (payload.new.whatsapp_connected === true) {
            setWaState('connected')
          }
        })
        .subscribe()

      // Return cleanup function
      return () => {
        channel.unsubscribe()
      }
    }

    let cleanup: (() => void) | undefined
    setupRealtime().then((cleanupFn) => {
      cleanup = cleanupFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [waState])

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
          {/* DEFAULT STATE */}
          {waState === 'default' && (
            <>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--sc-text)' }}>
                Connect WhatsApp
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--sc-muted)' }}>
                Connect your WhatsApp to receive your daily brief and log updates on the go.
              </p>

              {/* Info box */}
              <div
                className="p-4 rounded-xl border mb-6"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
              >
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--sc-text)' }}>
                  What WhatsApp does:
                </p>
                <ul className="space-y-1 text-sm" style={{ color: 'var(--sc-muted)' }}>
                  <li>• Sends your morning brief so you start the day with clarity</li>
                  <li>• Lets you log updates, follow-ups and ideas with a quick reply</li>
                  <li>• Checks in when you go quiet for too long</li>
                </ul>
              </div>

              {/* Sandbox note */}
              {process.env.NEXT_PUBLIC_TWILIO_SANDBOX === 'true' && (
                <div
                  className="p-4 rounded-lg border mb-6"
                  style={{ borderColor: 'var(--sc-border)', backgroundColor: 'rgba(0,194,168,0.05)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--sc-text)' }}>
                    <strong>Sandbox testing:</strong> Open WhatsApp and send &apos;join machine-spin&apos; to +1 415 523 8886 first. Then tap Connect WhatsApp.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm mb-4" style={{ color: 'var(--sc-error)' }}>{error}</p>
              )}

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
                  onClick={async () => {
                    setError(null)
                    setWaGenerating(true)
                    try {
                      const result = await generateWhatsAppConnectLink()
                      if (result.error) {
                        setError(result.error)
                        setWaGenerating(false)
                        return
                      }
                      if (result.data) {
                        setWaState('waiting')
                        setWaGenerating(false)
                        window.open(result.data, '_blank')
                      }
                    } catch (err) {
                      setWaGenerating(false)
                      setError(err instanceof Error ? err.message : 'Failed to generate link')
                    }
                  }}
                  disabled={waGenerating}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors"
                  style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
                >
                  {waGenerating ? 'Generating…' : 'Connect WhatsApp'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors"
                  style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
                >
                  Skip
                </button>
              </div>
            </>
          )}

          {/* WAITING STATE */}
          {waState === 'waiting' && (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 size={40} className="animate-spin mb-4" style={{ color: 'var(--sc-accent)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--sc-text)' }}>
                  Waiting for WhatsApp connection...
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--sc-muted)' }}>
                  WhatsApp should open automatically. Tap the button again if it did not.
                </p>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setWaState('default')
                    setError(null)
                  }}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors"
                  style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const status = await getWhatsAppStatus()
                    if (status.data?.connected) {
                      setWaState('connected')
                    } else {
                      setError('Connection not confirmed yet. Send the message in WhatsApp and check again.')
                    }
                  }}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors"
                  style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
                >
                  I&apos;ve sent the message — check connection
                </button>
              </div>

              {error && (
                <p className="text-sm mt-4" style={{ color: 'var(--sc-error)' }}>{error}</p>
              )}
            </>
          )}

          {/* CONNECTED STATE */}
          {waState === 'connected' && (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 size={40} className="mb-4" style={{ color: 'var(--sc-accent)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--sc-text)' }}>
                  WhatsApp connected.
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--sc-muted)' }}>
                  Auto-advancing to the next step in 2 seconds...
                </p>
              </div>
              {useEffect(() => {
                if (waState === 'connected') {
                  const timer = setTimeout(() => setStep(4), 2000)
                  return () => clearTimeout(timer)
                }
              }, [waState])}
            </>
          )}
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
