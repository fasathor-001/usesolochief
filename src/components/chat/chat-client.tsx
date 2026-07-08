'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { Send, MessageCircle, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatClientProps {
  initialMessages: Message[]
  mainFocus?: string | null
  overdueCount?: number
  dueTodayCount?: number
  plan?: string
  chatUsedThisMonth?: number
  chatLimit?: number
}

const SUGGESTED_PROMPTS = [
  'What should I focus on today?',
  'What can wait?',
  'Park an idea',
  'Add a follow-up',
  'I am overwhelmed',
  'Review my week',
]

function randomId(): string {
  return Math.random().toString(36).slice(2)
}

export function ChatClient({
  initialMessages,
  mainFocus,
  overdueCount = 0,
  dueTodayCount = 0,
  plan = 'free',
  chatUsedThisMonth = 0,
  chatLimit = Infinity,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [usedCount, setUsedCount] = useState(chatUsedThisMonth)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [, startTransition] = useTransition()

  const isLimited = chatLimit !== Infinity
  const remaining = isLimited ? Math.max(0, chatLimit - usedCount) : Infinity
  const quotaExceeded = isLimited && remaining === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming || quotaExceeded) return

    const userMsg: Message = { id: randomId(), role: 'user', content: text }
    const aiMsg: Message = { id: randomId(), role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput('')
    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        const err = await response.json()
        if (err.quotaExceeded) {
          setUsedCount(err.used ?? chatLimit)
          setMessages(prev => prev.filter(m => m.id !== userMsg.id && m.id !== aiMsg.id))
          toast.error(err.error ?? 'Monthly message limit reached.')
          return
        }
        throw new Error(err.error ?? 'Request failed')
      }

      // Optimistically increment usage counter
      setUsedCount(prev => prev + 1)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsg.id ? { ...m, content: m.content + parsed.text } : m
              ))
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected token') {
              throw parseErr
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
      setMessages(prev => prev.filter(m => m.id !== aiMsg.id))
    } finally {
      setIsStreaming(false)
      startTransition(() => {
        inputRef.current?.focus()
      })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleSuggestedPrompt(prompt: string) {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--sc-topbar-h))', overflow: 'hidden' }}>

      {/* Main chat column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: '48px 24px', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--sc-teal-10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MessageCircle size={22} style={{ color: 'var(--sc-teal)' }} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>
                  What do you need help deciding?
                </p>
                <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 320 }}>
                  Ask SoloChief about focus, follow-ups, parked ideas, or what should wait.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 440, marginTop: 8 }}>
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSuggestedPrompt(prompt)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--sc-radius)',
                      border: '0.5px solid var(--sc-border)',
                      backgroundColor: 'var(--sc-surface)',
                      color: 'var(--sc-muted)',
                      fontSize: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: 1.4,
                      transition: 'border-color 0.12s, color 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--sc-border-strong)'
                      e.currentTarget.style.color = 'var(--sc-text)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--sc-border)'
                      e.currentTarget.style.color = 'var(--sc-muted)'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  msg.role === 'user'
                    ? { backgroundColor: 'var(--sc-accent)', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                    : {
                        backgroundColor: 'var(--sc-surface)',
                        border: '1px solid var(--sc-border)',
                        color: 'var(--sc-text)',
                        borderRadius: '18px 18px 18px 4px',
                      }
                }
              >
                {msg.content || (
                  <span className="flex gap-1 items-center" style={{ color: 'var(--sc-muted)' }}>
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.15s' }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>●</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Quota exceeded banner */}
        {quotaExceeded && (
          <div style={{
            margin: '0 28px 12px',
            padding: '12px 16px',
            borderRadius: 'var(--sc-radius)',
            backgroundColor: 'rgba(0,194,168,0.06)',
            border: '0.5px solid var(--sc-teal)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <Zap size={15} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--sc-text)', flex: 1, lineHeight: 1.5 }}>
              You&apos;ve used all {chatLimit} free messages this month.{' '}
              <Link href="/dashboard/settings?tab=billing" style={{ color: 'var(--sc-teal)', fontWeight: 500, textDecoration: 'none' }}>
                Upgrade to Pro
              </Link>{' '}
              for unlimited AI Chat.
            </p>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 28px 20px', borderTop: '0.5px solid var(--sc-border)', backgroundColor: 'var(--sc-bg)', flexShrink: 0 }}>
          <div
            className="flex gap-3 items-end rounded-xl border p-3"
            style={{
              borderColor: quotaExceeded ? 'var(--sc-border)' : 'var(--sc-border)',
              backgroundColor: quotaExceeded ? 'var(--sc-surface-2, var(--sc-surface))' : 'var(--sc-surface)',
              opacity: quotaExceeded ? 0.6 : 1,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={quotaExceeded ? 'Monthly limit reached — upgrade to continue' : 'Ask anything... (Enter to send, Shift+Enter for new line)'}
              rows={1}
              disabled={isStreaming || quotaExceeded}
              className="flex-1 resize-none text-sm outline-none bg-transparent leading-relaxed disabled:opacity-50"
              style={{ color: 'var(--sc-text)', maxHeight: '120px' }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={isStreaming || !input.trim() || quotaExceeded}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--sc-muted)' }}>
            {isLimited
              ? quotaExceeded
                ? 'Resets on the 1st of next month.'
                : `${remaining} of ${chatLimit} messages remaining this month.`
              : 'All context loaded before every message.'}
          </p>
        </div>
      </div>

      {/* Right context panel — desktop only */}
      <aside className="sc-chat-sidebar">
        <p className="sc-context-title" style={{ marginBottom: 16 }}>Context loaded</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Today's focus */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 6 }}>Today&apos;s focus</p>
            {mainFocus ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={13} style={{ color: 'var(--sc-teal)', marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: 'var(--sc-text)', lineHeight: 1.5 }}>{mainFocus}</p>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--sc-hint)' }}>No active plan</p>
            )}
          </div>

          {/* Follow-ups */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 6 }}>Follow-ups due</p>
            {overdueCount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#EF4444' }}>{overdueCount} overdue</p>
              </div>
            ) : dueTodayCount > 0 ? (
              <p style={{ fontSize: 12, color: 'var(--sc-text)' }}>{dueTodayCount} due today</p>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--sc-hint)' }}>None due today</p>
            )}
          </div>

          {/* Monthly usage — shown for free plan only */}
          {isLimited && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 6 }}>AI Chat this month</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'var(--sc-border)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (usedCount / chatLimit) * 100)}%`,
                    backgroundColor: remaining <= 2 ? '#EF4444' : 'var(--sc-teal)',
                    borderRadius: 2,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: remaining <= 2 ? '#EF4444' : 'var(--sc-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {usedCount}/{chatLimit}
                </p>
              </div>
              {!quotaExceeded && (
                <Link
                  href="/dashboard/settings?tab=billing"
                  style={{ fontSize: 11, color: 'var(--sc-teal)', textDecoration: 'none' }}
                >
                  Upgrade for unlimited →
                </Link>
              )}
            </div>
          )}

          {/* Weekly progress */}
          {!isLimited && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 6 }}>Weekly progress</p>
              <p style={{ fontSize: 12, color: 'var(--sc-hint)' }}>Not enough data yet</p>
            </div>
          )}

          {/* Stop list */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sc-muted)', marginBottom: 6 }}>Stop list</p>
            <p style={{ fontSize: 12, color: 'var(--sc-hint)' }}>Not enough data yet</p>
          </div>

        </div>

        <div style={{ borderTop: '0.5px solid var(--sc-border)', marginTop: 20, paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--sc-hint)', lineHeight: 1.6 }}>
            Full context is rebuilt before every message — commitments, plan, follow-ups, parking lot, and review history.
          </p>
        </div>
      </aside>

    </div>
  )
}
