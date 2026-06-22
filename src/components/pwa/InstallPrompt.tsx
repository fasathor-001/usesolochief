'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    _scInstallPrompt: BeforeInstallPromptEvent | null
  }
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('sc-install-dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      const prompt = e as BeforeInstallPromptEvent
      window._scInstallPrompt = prompt
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleInstall() {
    const prompt = window._scInstallPrompt
    if (!prompt) return
    prompt.prompt()
    prompt.userChoice.then(() => {
      window._scInstallPrompt = null
      setVisible(false)
    })
  }

  function handleDismiss() {
    localStorage.setItem('sc-install-dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="sc-install-prompt">
      <div className="sc-install-prompt-body">
        <Download size={16} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', lineHeight: 1.3 }}>
            Install SoloChief
          </p>
          <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 2 }}>
            Add SoloChief to your home screen for faster daily check-ins.
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="sc-btn sc-btn-primary sc-btn-sm"
          style={{ flexShrink: 0 }}
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="sc-topbar-icon-btn"
          title="Not now"
          aria-label="Dismiss install prompt"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
