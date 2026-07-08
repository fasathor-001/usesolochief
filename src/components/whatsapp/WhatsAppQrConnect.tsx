'use client'

import { useEffect, useRef, useState } from 'react'

// Desktop-only WhatsApp connect helper.
// Renders a QR code (encoding the wa.me connect URL) plus a copyable link, so a
// user on a computer can connect from their phone. On mobile we open wa.me directly
// instead of rendering this component.

const QR_SCRIPT_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QRCodeGlobal = new (el: HTMLElement, opts: Record<string, any>) => unknown

let qrScriptPromise: Promise<void> | null = null

function loadQrScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if ((window as unknown as { QRCode?: QRCodeGlobal }).QRCode) return Promise.resolve()
  if (qrScriptPromise) return qrScriptPromise

  qrScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${QR_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('qr load failed')))
      return
    }
    const script = document.createElement('script')
    script.src = QR_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('qr load failed'))
    document.head.appendChild(script)
  })
  return qrScriptPromise
}

export function WhatsAppQrConnect({ waUrl }: { waUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [qrFailed, setQrFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setQrFailed(false)

    loadQrScript()
      .then(() => {
        if (cancelled || !containerRef.current) return
        const QRCode = (window as unknown as { QRCode?: QRCodeGlobal }).QRCode
        if (!QRCode) { setQrFailed(true); return }
        containerRef.current.innerHTML = ''
        // eslint-disable-next-line no-new
        new QRCode(containerRef.current, {
          text: waUrl,
          width: 200,
          height: 200,
          colorDark: '#00C2A8',
          colorLight: '#0F1B2D',
        })
      })
      .catch(() => { if (!cancelled) setQrFailed(true) })

    return () => { cancelled = true }
  }, [waUrl])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(waUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — the link is still selectable in the input.
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text, #0D0D0D)', textAlign: 'center' }}>
        Scan with WhatsApp on your phone
      </p>

      <div
        style={{
          backgroundColor: '#0F1B2D',
          padding: 16,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 232,
          minHeight: 232,
        }}
      >
        {qrFailed ? (
          <span style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', maxWidth: 180 }}>
            Could not load the QR code. Use the link below on your phone.
          </span>
        ) : (
          <div ref={containerRef} aria-label="WhatsApp connection QR code" />
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 320 }}>
        <p style={{ fontSize: 12, color: 'var(--sc-muted, #94A3B8)', marginBottom: 6, textAlign: 'center' }}>
          Or copy this link to your phone
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            readOnly
            value={waUrl}
            onFocus={(e) => e.currentTarget.select()}
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--sc-border, #E2E8F0)',
              backgroundColor: 'var(--sc-surface, #F8FAFC)',
              color: 'var(--sc-text, #0D0D0D)',
            }}
          />
          <button
            type="button"
            onClick={copyLink}
            className="sc-btn sc-btn-secondary sc-btn-sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
