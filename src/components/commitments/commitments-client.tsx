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
import { CommitmentCard, STAGE_LABELS, STAGE_COLOURS, CATEGORY_LABELS } from './commitment-card'
import { PageHeader } from '@/components/ui/solochief/PageHeader'
import { ContextPanel, ContextBlock } from '@/components/ui/solochief/ContextPanel'
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
  const [, startTransition] = useTransition()
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

  // Summary counts — always from the unfiltered list
  const stats = useMemo(() => ({
    main_focus: commitments.filter(c => c.stage === 'main_focus').length,
    active:     commitments.filter(c => c.stage === 'active').length,
    follow_up:  commitments.filter(c => c.stage === 'follow_up').length,
    parked:     commitments.filter(c => c.stage === 'parked').length,
    total:      commitments.length,
  }), [commitments])

  function handleDelete(id: string) {
    if (!window.confirm('Delete this commitment? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteCommitment(id)
      if (result.error) toast.error(result.error)
      else toast.success('Commitment deleted')
    })
  }

  const grouped = useMemo(() => {
    const map = new Map<CommitmentStage, Commitment[]>()
    for (const stage of STAGE_ORDER) map.set(stage, [])
    for (const c of filtered) map.get(c.stage)?.push(c)
    return map
  }, [filtered])

  const isFiltering = stageFilter !== 'all' || categoryFilter !== 'all' || search.trim() !== ''

  function clearFilters() {
    setStageFilter('all')
    setCategoryFilter('all')
    setSearch('')
  }

  return (
    <>
      <div className="sc-content sc-page-container">

        <PageHeader
          title="Commitments"
          subtitle="Everything you are currently carrying."
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

        <div className="sc-grid-main">

          {/* ── Left column: filters + stage groups ──────────────────── */}
          <div className="sc-grid-col">

            {/* Filter bar */}
            <div className="sc-commitments-filters">
              <div className="relative" style={{ flex: '1 1 180px', maxWidth: 320 }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--sc-muted)]" />
                <Input
                  placeholder="Search commitments…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={stageFilter}
                onValueChange={(v) => { if (v) setStageFilter(v as CommitmentStage | 'all') }}
              >
                <SelectTrigger className="w-[148px]">
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {STAGE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(v) => { if (v) setCategoryFilter(v as CommitmentCategory | 'all') }}
              >
                <SelectTrigger className="w-[148px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isFiltering && (
                <button
                  type="button"
                  className="sc-btn sc-btn-ghost sc-btn-sm"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Stage groups */}
            {commitments.length > 0 && (
              <div className="space-y-5 mt-6">
                {STAGE_ORDER.map((stage) => {
                  const cards = grouped.get(stage) ?? []

                  // Hidden when a specific stage filter is active and this isn't it
                  if (stageFilter !== 'all' && stage !== stageFilter) return null

                  // Compact row for empty stages — no bordered empty box
                  if (cards.length === 0) {
                    return (
                      <div key={stage} className="sc-stage-empty-compact">
                        <div
                          className="rounded-full flex-shrink-0"
                          style={{ width: 7, height: 7, backgroundColor: STAGE_COLOURS[stage] }}
                        />
                        <span>{STAGE_LABELS[stage]}</span>
                        <span className="sc-stage-empty-sep">·</span>
                        <span>0</span>
                      </div>
                    )
                  }

                  return (
                    <section key={stage}>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="rounded-full flex-shrink-0"
                          style={{ width: 9, height: 9, backgroundColor: STAGE_COLOURS[stage] }}
                        />
                        <h2 className="sc-section-heading" style={{ margin: 0 }}>
                          {STAGE_LABELS[stage]}
                        </h2>
                        <span style={{ fontSize: 11, color: 'var(--sc-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {cards.length}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {cards.map((commitment) => (
                          <CommitmentCard
                            key={commitment.id}
                            commitment={commitment}
                            onEdit={setEditTarget}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}

            {/* No match after filtering */}
            {filtered.length === 0 && commitments.length > 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-[var(--sc-muted)]">No commitments match your current filters.</p>
                <Button variant="link" className="text-sm mt-1" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}

            {/* Zero state */}
            {commitments.length === 0 && (
              <div className="text-center py-16">
                <h2 className="text-base font-medium text-[var(--sc-text)]">
                  Your commitment inventory is empty
                </h2>
                <p className="text-sm text-[var(--sc-muted)] mt-2 max-w-sm mx-auto">
                  Start by adding every project, obligation, or commitment that has a claim on your attention.
                </p>
                <button
                  type="button"
                  className="sc-btn sc-btn-primary mt-4"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus size={14} />
                  Add first commitment
                </button>
              </div>
            )}
          </div>

          {/* ── Right column: context panel ──────────────────────────── */}
          <div>
            <ContextPanel>

              <ContextBlock title="Commitment Map">
                <div className="sc-metric-row">
                  <span className="sc-metric-label">Main Focus</span>
                  <span
                    className="sc-metric-value"
                    style={{ color: stats.main_focus > 1 ? 'var(--sc-warning)' : undefined }}
                  >
                    {stats.main_focus}
                  </span>
                </div>
                <div className="sc-metric-row">
                  <span className="sc-metric-label">Active</span>
                  <span className="sc-metric-value">{stats.active}</span>
                </div>
                <div className="sc-metric-row">
                  <span className="sc-metric-label">Follow-up</span>
                  <span className="sc-metric-value">{stats.follow_up}</span>
                </div>
                <div className="sc-metric-row">
                  <span className="sc-metric-label">Parked</span>
                  <span className="sc-metric-value">{stats.parked}</span>
                </div>
                <div className="sc-metric-row">
                  <span className="sc-metric-label" style={{ fontWeight: 500, color: 'var(--sc-text-2)' }}>Total</span>
                  <span className="sc-metric-value">{stats.total}</span>
                </div>
              </ContextBlock>

              <ContextBlock>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--sc-muted)' }}>
                  Only one commitment should be the main focus. Park or move anything that should
                  not compete for attention this week.
                </p>
              </ContextBlock>

            </ContextPanel>
          </div>

        </div>
      </div>

      <AddCommitmentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditCommitmentModal
        commitment={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
      />
    </>
  )
}
