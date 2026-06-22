'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CommitmentCard, STAGE_LABELS, STAGE_COLOURS, CATEGORY_LABELS } from './commitment-card'
import { PageHeader } from '@/components/ui/solochief/PageHeader'
import { AddCommitmentModal } from './add-commitment-modal'
import { EditCommitmentModal } from './edit-commitment-modal'
import { deleteCommitment } from '@/lib/actions/commitments'
import type { Commitment, CommitmentStage, CommitmentCategory } from '@/types/database'

const STAGE_ORDER: CommitmentStage[] = [
  'main_focus',
  'active',
  'launch_checklist',
  'maintenance',
  'follow_up',
  'parked',
]

interface CommitmentsClientProps {
  commitments: Commitment[]
}

export function CommitmentsClient({ commitments }: CommitmentsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Commitment | null>(null)
  const [stageFilter, setStageFilter] = useState<CommitmentStage | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<CommitmentCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return commitments.filter((c) => {
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!c.title.toLowerCase().includes(q) && !(c.next_action ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [commitments, stageFilter, categoryFilter, search])

  function handleDelete(id: string) {
    if (!window.confirm('Delete this commitment? This cannot be undone.')) return

    startTransition(async () => {
      const result = await deleteCommitment(id)
      if (result.error) toast.error(result.error)
      else toast.success('Commitment deleted')
    })
  }

  // Group visible commitments by stage
  const grouped = useMemo(() => {
    const map = new Map<CommitmentStage, Commitment[]>()
    for (const stage of STAGE_ORDER) map.set(stage, [])
    for (const c of filtered) {
      map.get(c.stage)?.push(c)
    }
    return map
  }, [filtered])

  return (
    <>
      {/* Topbar */}
      <div className="sc-topbar">
        <div />
        <div className="sc-topbar-actions" />
      </div>

    <div className="sc-content" style={{ maxWidth: 1100 }}>
      <PageHeader
        title="Commitments"
        subtitle={`${commitments.length} ${commitments.length === 1 ? 'commitment' : 'commitments'} across all stages`}
        action={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="sc-btn sc-btn-primary sc-btn-sm"
          >
            <Plus size={14} />
            Add commitment
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sc-muted)]" />
          <Input
            placeholder="Search commitments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={stageFilter} onValueChange={(v) => { if (v) setStageFilter(v as CommitmentStage | 'all') }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGE_ORDER.map((s) => (
              <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => { if (v) setCategoryFilter(v as CommitmentCategory | 'all') }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stage groups */}
      <div className="space-y-8">
        {STAGE_ORDER.map((stage) => {
          const cards = grouped.get(stage) ?? []

          // When a stage filter is active, only render the selected stage
          if (stageFilter !== 'all' && stage !== stageFilter) return null

          return (
            <section key={stage}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STAGE_COLOURS[stage] }}
                />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sc-muted)]">
                  {STAGE_LABELS[stage]}
                </h2>
                <span className="text-xs text-[var(--sc-muted)] bg-[var(--sc-border)] rounded-full px-2 py-0.5">
                  {cards.length}
                </span>
              </div>

              {cards.length === 0 ? (
                <div className="sc-stage-empty-row">
                  {stage === 'main_focus' ? 'No main focus set — add one to get started.' : 'No commitments in this stage.'}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((commitment) => (
                    <CommitmentCard
                      key={commitment.id}
                      commitment={commitment}
                      onEdit={setEditTarget}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Empty state when nothing matches filters */}
      {filtered.length === 0 && commitments.length > 0 && (
        <div className="text-center py-16 text-[var(--sc-muted)]">
          <p className="text-sm">No commitments match your current filters.</p>
          <Button
            variant="link"
            className="text-sm mt-1"
            onClick={() => { setStageFilter('all'); setCategoryFilter('all'); setSearch('') }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Zero state */}
      {commitments.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-lg font-semibold text-[var(--sc-text)]">Your commitment inventory is empty</h2>
          <p className="text-sm text-[var(--sc-muted)] mt-2 max-w-sm mx-auto">
            Start by adding every project, obligation, or commitment that has a claim on your attention.
          </p>
          <Button
            className="mt-4"
            onClick={() => setAddOpen(true)}
            style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Commitment
          </Button>
        </div>
      )}

      <AddCommitmentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditCommitmentModal
        commitment={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
    </>
  )
}
