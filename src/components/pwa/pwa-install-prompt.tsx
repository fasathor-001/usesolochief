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

export function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('pwa_prompt_dismissed')) return

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Detect mobile platform
    const ua = navigator.userAgent.toLowerCase()
    const isMobile = /iphone|android/.test(ua)
    if (!isMobile) return

    setIsAndroid(/android/.test(ua))

    // For Android: wait for beforeinstallprompt event
    if (/android/.test(ua)) {
      const handler = (e: Event) => {
        e.preventDefault()
        const prompt = e as BeforeInstallPromptEvent
        window._scInstallPrompt = prompt
        setShowPrompt(true)
        setVisible(true)
      }

      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    } else {
      // For iOS: show after 30 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true)
        setVisible(true)
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [])

  function handleInstallAndroid() {
    const prompt = window._scInstallPrompt
    if (!prompt) return
    prompt.prompt()
    prompt.userChoice.then(() => {
      window._scInstallPrompt = null
      handleDismiss()
    })
  }

  function handleDismiss() {
    localStorage.setItem('pwa_prompt_dismissed', 'true')
    setVisible(false)
    setShowPrompt(false)
  }

  if (!visible || !showPrompt) return null

  if (isAndroid) {
    return (
      <div className="sc-pwa-banner">
        <div className="sc-pwa-banner-content">
          <Download size={18} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', lineHeight: 1.3 }}>
              Add SoloChief to Home Screen
            </p>
            <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 2 }}>
              Fast access to your commitments and focus.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInstallAndroid}
            className="sc-btn sc-btn-primary sc-btn-sm"
            style={{ flexShrink: 0 }}
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="sc-pwa-banner-close"
            title="Dismiss"
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  // iOS instructions
  return (
    <div className="sc-pwa-banner">
      <div className="sc-pwa-banner-content">
        <Download size={18} style={{ color: 'var(--sc-teal)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', lineHeight: 1.3 }}>
            Add SoloChief to Home Screen
          </p>
          <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 2 }}>
            Tap Share → Add to Home Screen
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="sc-btn sc-btn-primary sc-btn-sm"
          style={{ flexShrink: 0 }}
        >
          Got it
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="sc-pwa-banner-close"
          title="Dismiss"
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
