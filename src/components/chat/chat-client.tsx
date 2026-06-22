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

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b shrink-0"
        style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-background)' }}
      >
        <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--sc-text)' }}>AI Chat</h1>
        <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>Your Chief of Staff is listening.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
            <MessageCircle size={36} style={{ color: 'var(--sc-muted)' }} />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--sc-text)' }}>
                What is on your mind?
              </p>
              <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--sc-muted)' }}>
                Ask about today&apos;s focus, park an idea, add a follow-up, or talk through what is blocking you.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                'What should I work on today?',
                'What is overdue?',
                'How was my week?',
              ].map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 rounded-full text-xs border transition-colors hover:border-[var(--sc-accent)]"
                  style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
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
        className="px-6 py-4 border-t shrink-0"
        style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-background)' }}
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
