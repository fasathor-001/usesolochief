'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LifeBuoy, ArrowRight } from 'lucide-react'

interface RescueMeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RESCUE_OPTIONS = [
  {
    id: 'broken',
    label: 'Something is broken in production',
    detail: 'Fix it, log it as an emergency switch, then return to focus.',
    action: '/dashboard/today',
    actionLabel: 'Go to Today Focus',
  },
  {
    id: 'overwhelmed',
    label: 'I am overwhelmed and do not know where to start',
    detail: 'Look at your one outcome for today. Nothing else matters right now.',
    action: '/dashboard/today',
    actionLabel: 'See Today\'s Focus',
  },
  {
    id: 'urgent',
    label: 'Something urgent came up that is not a breakdown',
    detail: 'Use the Switch Challenge to decide if this is worth switching to.',
    action: '/dashboard/today',
    actionLabel: 'Go to Today Focus',
  },
  {
    id: 'behind',
    label: 'I am behind on a commitment',
    detail: 'Park your current task and add it to the parking lot. Then return to your focus.',
    action: '/dashboard/parking-lot',
    actionLabel: 'Go to Parking Lot',
  },
  {
    id: 'chat',
    label: 'I need to think this through',
    detail: 'Use the AI Chat to work through what is blocking you.',
    action: '/dashboard/chat',
    actionLabel: 'Open AI Chat',
  },
]

export function RescueMeModal({ open, onOpenChange }: RescueMeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        style={{ backgroundColor: 'var(--sc-background)', border: '1px solid var(--sc-border)' }}
        showCloseButton
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy size={18} style={{ color: 'var(--sc-accent)' }} />
            <DialogTitle style={{ color: 'var(--sc-text)' }}>Rescue Me</DialogTitle>
          </div>
          <p className="text-sm" style={{ color: 'var(--sc-muted)' }}>
            What is happening right now?
          </p>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {RESCUE_OPTIONS.map((option) => (
            <a
              key={option.id}
              href={option.action}
              onClick={() => onOpenChange(false)}
              style={{
                display: 'block',
                padding: '12px 14px',
                borderRadius: 8,
                border: '0.5px solid var(--sc-border)',
                backgroundColor: 'var(--sc-surface)',
                textDecoration: 'none',
                transition: 'background-color 0.12s, border-color 0.12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--sc-bg)'
                e.currentTarget.style.borderColor = 'var(--sc-border-strong)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--sc-surface)'
                e.currentTarget.style.borderColor = 'var(--sc-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', lineHeight: 1.3 }}>
                    {option.label}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--sc-muted)', marginTop: 2, lineHeight: 1.4 }}>
                    {option.detail}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  style={{ flexShrink: 0, marginTop: 2, color: 'var(--sc-muted)' }}
                />
              </div>
            </a>
          ))}
        </div>

        <p className="text-xs mt-2 text-center" style={{ color: 'var(--sc-muted)' }}>
          Log what happened after you handle it.
        </p>
      </DialogContent>
    </Dialog>
  )
}
