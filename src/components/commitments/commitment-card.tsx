'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Commitment } from '@/types/database'

export const STAGE_COLOURS: Record<string, string> = {
  main_focus:       '#00C2A8',
  active:           '#3B82F6',
  launch_checklist: '#F59E0B',
  maintenance:      '#64748B',
  follow_up:        '#8B5CF6',
  parked:           '#374151',
}

export const STAGE_LABELS: Record<string, string> = {
  main_focus:       'Main Focus',
  active:           'Active',
  launch_checklist: 'Launch Checklist',
  maintenance:      'Maintenance',
  follow_up:        'Follow-Up',
  parked:           'Parked',
}

export const CATEGORY_LABELS: Record<string, string> = {
  product:     'Product',
  admin:       'Admin',
  legal:       'Legal',
  finance:     'Finance',
  content:     'Content',
  customer:    'Customer',
  launch:      'Launch',
  maintenance: 'Maintenance',
  idea:        'Idea',
  personal:    'Personal',
}

export const PERMISSION_LABELS: Record<string, string> = {
  can_interrupt:      'Can interrupt',
  protected_block:    'Protected',
  checklist_only:     'Checklist only',
  maintenance_only:   'Maintenance only',
  follow_up_only:     'Follow-up only',
  parked:             'Parked',
}

// Category badge colour mapping
const CATEGORY_BADGE: Record<string, string> = {
  product:     'sc-badge-blue',
  admin:       'sc-badge-slate',
  legal:       'sc-badge-purple',
  finance:     'sc-badge-green',
  content:     'sc-badge-teal',
  customer:    'sc-badge-amber',
  launch:      'sc-badge-amber',
  maintenance: 'sc-badge-slate',
  idea:        'sc-badge-purple',
  personal:    'sc-badge-slate',
}

interface CommitmentCardProps {
  commitment: Commitment
  onEdit: (commitment: Commitment) => void
  onDelete: (id: string) => void
}

export function CommitmentCard({ commitment, onEdit, onDelete }: CommitmentCardProps) {
  const stageColour = STAGE_COLOURS[commitment.stage] ?? '#64748B'
  const categoryBadge = CATEGORY_BADGE[commitment.category] ?? 'sc-badge-slate'

  const hasMeta = commitment.due_date || commitment.last_touched_at

  return (
    <div
      className="sc-commitment-card"
      style={{ borderLeft: `3px solid ${stageColour}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">

          {/* Title */}
          <h3 style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--sc-text)',
            letterSpacing: '-0.1px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
          }}>
            {commitment.title}
          </h3>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`sc-badge ${categoryBadge}`}>
              {CATEGORY_LABELS[commitment.category] ?? commitment.category}
            </span>
            <span className="sc-badge sc-badge-dark">
              {PERMISSION_LABELS[commitment.permission_level] ?? commitment.permission_level}
            </span>
          </div>

          {/* Next action */}
          {commitment.next_action && (
            <p style={{
              fontSize: 11,
              color: 'var(--sc-muted)',
              marginTop: 8,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <span style={{ color: 'var(--sc-teal)', fontWeight: 600, fontSize: 11, flexShrink: 0 }}>→</span>
              {commitment.next_action}
            </p>
          )}

          {/* Date metadata */}
          {hasMeta && (
            <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              {commitment.due_date && (
                <span className="sc-meta">
                  Due {new Date(commitment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {commitment.last_touched_at && (
                <span className="sc-meta">
                  Updated {new Date(commitment.last_touched_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          )}

        </div>

        {/* Actions menu — top-right aligned */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[var(--sc-muted)] hover:bg-[var(--sc-border)] transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
            <span className="sr-only">Options</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(commitment)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[var(--sc-error)] focus:text-[var(--sc-error)]"
              onClick={() => onDelete(commitment.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
