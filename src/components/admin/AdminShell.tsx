'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

interface Props {
  children: React.ReactNode
  userEmail: string
}

export function AdminShell({ children, userEmail }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--sc-bg)' }}>
      <AdminSidebar
        userEmail={userEmail}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 39,
          }}
        />
      )}

      {/* Main area */}
      <div
        className="admin-main"
        style={{
          flex: 1,
          marginLeft: 240,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AdminTopbar userEmail={userEmail} onMenuToggle={() => setMobileOpen(o => !o)} />

        <main style={{
          flex: 1,
          padding: '28px 32px',
          maxWidth: 1280,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
