'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { Send, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatClientProps {
  initialMessages: Message[]
}

function randomId(): string {
  return Math.random().toString(36).slice(2)
}

export function ChatClient({ initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming) return

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
        throw new Error(err.error ?? 'Request failed')
      }

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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: 0, minHeight: '100vh' }}>
      {/* Topbar */}
      <div className="sc-topbar">
        <div className="sc-topbar-left">
          <span className="sc-topbar-title">AI Chat</span>
          <span className="sc-topbar-sub">Your Chief of Staff is listening.</span>
        </div>
        <div className="sc-topbar-actions">
          <MessageCircle size={16} style={{ color: 'var(--sc-muted)' }} />
        </div>
      </div>

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
                Your Chief of Staff is ready.
              </p>
              <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 320 }}>
                Ask about your focus, park an idea, check what is overdue, or talk through what is blocking you.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 440, marginTop: 8 }}>
              {[
                'What should I focus on today?',
                'What is overdue right now?',
                'How was my week?',
                'Help me think through a decision.',
                'What is in my parking lot?',
                'I need to log today\'s outcome.',
              ].map(prompt => (
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

      {/* Input */}
      <div
        style={{ padding: '12px 28px 20px', borderTop: '0.5px solid var(--sc-border)', backgroundColor: 'var(--sc-bg)', flexShrink: 0 }}
      >
        <div
          className="flex gap-3 items-end rounded-xl border p-3"
          style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none text-sm outline-none bg-transparent leading-relaxed disabled:opacity-50"
            style={{ color: 'var(--sc-text)', maxHeight: '120px' }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--sc-muted)' }}>
          All context loaded before every message.
        </p>
      </div>
    </div>
  )
}
