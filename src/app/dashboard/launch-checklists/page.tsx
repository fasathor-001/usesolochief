'use client'

import { CheckSquare, CheckCircle2, List, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/solochief/PageHeader'

const HOW_IT_WORKS = [
  { icon: CheckSquare, text: 'Create a checklist for each launch — product, feature, or campaign.' },
  { icon: List, text: 'Add tasks in the order they must happen. Sequence matters.' },
  { icon: AlertCircle, text: 'SoloChief flags blockers and stalled checklists so nothing slips.' },
  { icon: CheckCircle2, text: 'Mark the checklist complete when every task is done.' },
]

export default function LaunchChecklistsPage() {
  return (
    <>
      {/* Topbar */}
      <div className="sc-topbar">
        <div />
        <div className="sc-topbar-actions" />
      </div>

      <div className="sc-content sc-content-narrow">
        <PageHeader
          title="Launch Checklists"
          subtitle="Structured launch sequences — nothing left to chance."
          action={
            <button
              type="button"
              className="sc-btn sc-btn-primary sc-btn-sm"
              onClick={() => toast.success('Create checklist — coming in the next build.')}
            >
              <CheckSquare size={14} />
              New checklist
            </button>
          }
        />
        {/* How it works card */}
        <div
          className="sc-card"
          style={{ borderLeft: '3px solid var(--sc-teal)', marginBottom: 24 }}
        >
          <p className="sc-section-heading" style={{ marginBottom: 14 }}>HOW IT WORKS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HOW_IT_WORKS.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: 'var(--sc-teal-10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={13} style={{ color: 'var(--sc-teal)' }} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--sc-text)', lineHeight: 1.5, paddingTop: 5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        <div
          className="sc-card"
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--sc-bg)',
            border: '0.5px solid var(--sc-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CheckSquare size={22} style={{ color: 'var(--sc-muted)' }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>
            No checklists yet.
          </p>
          <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 320, margin: '0 auto 20px' }}>
            Create your first launch checklist to start tracking your next release, feature, or campaign.
          </p>
          <button
            type="button"
            className="sc-btn sc-btn-primary"
            onClick={() => toast.success('Create checklist — coming in the next build.')}
          >
            <CheckSquare size={14} />
            Create your first checklist
          </button>
        </div>
      </div>
    </>
  )
}
