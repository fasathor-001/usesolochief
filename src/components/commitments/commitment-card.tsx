'use client'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
// Base UI components do not use the Radix asChild pattern
import type { Commitment } from '@/types/database'

export const STAGE_COLOURS: Record<string, string> = {
  main_focus: '#00C2A8',
  active: '#3B82F6',
  launch_checklist: '#F59E0B',
  maintenance: '#64748B',
  follow_up: '#8B5CF6',
  parked: '#374151',
}

export const STAGE_LABELS: Record<string, string> = {
  main_focus: 'Main Focus',
  active: 'Active',
  launch_checklist: 'Launch Checklist',
  maintenance: 'Maintenance',
  follow_up: 'Follow-Up',
  parked: 'Parked',
}

export const CATEGORY_LABELS: Record<string, string> = {
  product: 'Product',
  admin: 'Admin',
  legal: 'Legal',
  finance: 'Finance',
  content: 'Content',
  customer: 'Customer',
  launch: 'Launch',
  maintenance: 'Maintenance',
  idea: 'Idea',
  personal: 'Personal',
}

export const PERMISSION_LABELS: Record<string, string> = {
  can_interrupt: 'Can Interrupt',
  protected_block: 'Protected Block',
  checklist_only: 'Checklist Only',
  maintenance_only: 'Maintenance Only',
  follow_up_only: 'Follow-Up Only',
  parked: 'Parked',
}

interface CommitmentCardProps {
  commitment: Commitment
  onEdit: (commitment: Commitment) => void
  onDelete: (id: string) => void
}

export function CommitmentCard({ commitment, onEdit, onDelete }: CommitmentCardProps) {
  const stageColour = STAGE_COLOURS[commitment.stage] ?? '#64748B'

  return (
    <div className="sc-card sc-card-sm" style={{ transition: 'box-shadow 0.12s' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--sc-text)] truncate">{commitment.title}</h3>
          {commitment.next_action && (
            <p className="text-sm text-[var(--sc-muted)] mt-1 truncate">
              → {commitment.next_action}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge
              className="text-white text-xs px-2 py-0.5 border-0"
              style={{ backgroundColor: stageColour }}
            >
              {STAGE_LABELS[commitment.stage] ?? commitment.stage}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {CATEGORY_LABELS[commitment.category] ?? commitment.category}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5 text-[var(--sc-muted)]">
              {PERMISSION_LABELS[commitment.permission_level] ?? commitment.permission_level}
            </Badge>
          </div>
          {commitment.due_date && (
            <p className="text-xs text-[var(--sc-muted)] mt-1.5">
              Due {new Date(commitment.due_date).toLocaleDateString('en-GB')}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[var(--sc-muted)] hover:bg-[var(--sc-border)] transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
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
