'use client'

import { CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/solochief/PageHeader'
import { ContextPanel, ContextBlock } from '@/components/ui/solochief/ContextPanel'

const CHECKLIST_RULES = [
  '10 items maximum',
  'Add one only by removing one',
  'No new work until checklist closes',
  'Best for launches, client delivery, deadlines, and handovers',
]

export default function LaunchChecklistsPage() {
  return (
    <div className="sc-content sc-page-container">

      <PageHeader
        title="Checklists"
        subtitle="Structured checklists for launches, deadlines, handovers, and important work."
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

      <div className="sc-grid-main">

        {/* Left column */}
        <div className="sc-grid-col">
          <div
            className="sc-card"
            style={{ textAlign: 'center', padding: '56px 24px' }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'var(--sc-bg)',
              border: '0.5px solid var(--sc-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckSquare size={20} style={{ color: 'var(--sc-muted)' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>
              No checklists yet.
            </p>
            <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 300, margin: '0 auto 22px', lineHeight: 1.6 }}>
              Create a checklist when a piece of work needs a clear finish line.
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

        {/* Right column */}
        <div>
          <ContextPanel>
            <ContextBlock title="Checklist rules">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CHECKLIST_RULES.map((rule, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: 'var(--sc-teal)',
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                    <p style={{ fontSize: 12, color: 'var(--sc-muted)', lineHeight: 1.6 }}>{rule}</p>
                  </div>
                ))}
              </div>
            </ContextBlock>
          </ContextPanel>
        </div>

      </div>
    </div>
  )
}
