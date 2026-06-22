'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Archive } from 'lucide-react'
import {
  createParkingLotItem,
  killParkingLotItem,
  scheduleParkingLotItem,
  actOnParkingLotItem,
  deleteParkingLotItem,
  type CreateParkingLotInput,
} from '@/lib/actions/parking-lot'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ParkingLotItem, ParkingLotCategory, ParkingLotStatus } from '@/types/database'
import { PageHeader } from '@/components/ui/solochief/PageHeader'
import { ContextPanel, ContextBlock } from '@/components/ui/solochief/ContextPanel'

interface ParkingLotClientProps {
  initialItems: ParkingLotItem[]
}

const CATEGORY_LABELS: Record<ParkingLotCategory, string> = {
  new_product: 'New Product',
  feature: 'Feature',
  content: 'Content',
  personal: 'Personal',
  other: 'Other',
}

const CATEGORY_COLOURS: Record<ParkingLotCategory, string> = {
  new_product: '#8B5CF6',
  feature: '#3B82F6',
  content: '#F59E0B',
  personal: '#10B981',
  other: '#64748B',
}

const STATUS_GROUPS: { status: ParkingLotStatus[]; label: string }[] = [
  { status: ['waiting'],             label: 'Parked' },
  { status: ['scheduled'],           label: 'Reviewing soon' },
  { status: ['cleared', 'actioned'], label: 'Cleared' },
  { status: ['killed'],              label: 'Archived' },
]

const PARKING_RULES = [
  "Park useful ideas that are not today's focus",
  'Review parked ideas weekly',
  'Promote an idea only if something else moves out',
  'The goal is clarity, not storage',
]

function daysParked(dateStr: string): number {
  return Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  )
}

function nextMondayString(): string {
  const d = new Date()
  const day = d.getDay()
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + daysUntilMonday)
  return d.toISOString().split('T')[0]
}

export function ParkingLotClient({ initialItems }: ParkingLotClientProps) {
  const [items, setItems] = useState<ParkingLotItem[]>(initialItems)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ParkingLotCategory>('other')
  const [notes, setNotes] = useState('')
  const [reviewDate, setReviewDate] = useState(nextMondayString())
  const [isPending, startTransition] = useTransition()

  const totalParked = items.filter(i => i.status === 'waiting' || i.status === 'scheduled').length
  const reviewingSoon = items.filter(i => i.status === 'scheduled').length
  const clearedThisMonth = items.filter(i => {
    if (i.status !== 'cleared' && i.status !== 'actioned' && i.status !== 'killed') return false
    const d = new Date(i.updated_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  function handleAdd() {
    if (!title.trim()) return
    const input: CreateParkingLotInput = {
      title: title.trim(),
      category,
      notes: notes.trim() || undefined,
      reviewDate: reviewDate || undefined,
    }
    startTransition(async () => {
      const { data, error } = await createParkingLotItem(input)
      if (error) { toast.error(error); return }
      if (data) setItems(prev => [data, ...prev])
      setTitle('')
      setCategory('other')
      setNotes('')
      setReviewDate(nextMondayString())
      setShowAdd(false)
      toast.success('Idea parked')
    })
  }

  function handleKill(id: string) {
    startTransition(async () => {
      const { data, error } = await killParkingLotItem(id)
      if (error) { toast.error(error); return }
      if (data) setItems(prev => prev.map(i => i.id === id ? data : i))
      toast.success('Idea archived')
    })
  }

  function handleSchedule(id: string) {
    const date = nextMondayString()
    startTransition(async () => {
      const { data, error } = await scheduleParkingLotItem(id, date)
      if (error) { toast.error(error); return }
      if (data) setItems(prev => prev.map(i => i.id === id ? data : i))
      toast.success('Scheduled for Monday review')
    })
  }

  function handleActOn(id: string) {
    startTransition(async () => {
      const { data, error } = await actOnParkingLotItem(id)
      if (error) { toast.error(error); return }
      if (data) setItems(prev => prev.map(i => i.id === id ? data : i))
      toast.success('Marked as actioned')
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const { error } = await deleteParkingLotItem(id)
      if (error) { toast.error(error); return }
      setItems(prev => prev.filter(i => i.id !== id))
      setConfirmDeleteId(null)
      toast.success('Idea deleted permanently')
    })
  }

  return (
    <>

    <div className="sc-content" style={{ maxWidth: 1280 }}>

      <PageHeader
        title="Parking Lot"
        subtitle="Ideas captured safely. Not lost — waiting."
        action={
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="sc-btn sc-btn-primary sc-btn-sm"
          >
            <Plus size={14} />
            Park idea
          </button>
        }
      />

      <div className="sc-grid-main">

        {/* Left column */}
        <div className="sc-grid-col">

          <p style={{ fontSize: 13, color: 'var(--sc-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            This is where ideas go so they do not hijack the week.
          </p>

          {/* Stats */}
          <div className="sc-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            {[
              { label: 'ideas parked',       value: totalParked },
              { label: 'reviewing soon',     value: reviewingSoon },
              { label: 'cleared this month', value: clearedThisMonth },
            ].map(({ label, value }) => (
              <div key={label} className="sc-stat">
                <p className="sc-stat-value">{value}</p>
                <p className="sc-stat-label">{label}</p>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div
              className="sc-card"
              style={{ textAlign: 'center', padding: '48px 24px' }}
            >
              <Archive size={28} className="mx-auto mb-3" style={{ color: 'var(--sc-muted)' }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 6 }}>No ideas parked yet.</p>
              <p style={{ fontSize: 13, color: 'var(--sc-muted)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
                When a new idea arrives during the week, park it here instead of letting it hijack your focus.
              </p>
            </div>
          )}

          {/* Grouped sections */}
          <div className="space-y-8">
            {STATUS_GROUPS.map(({ status: statuses, label }) => {
              const groupItems = items.filter(i => statuses.includes(i.status))
              if (groupItems.length === 0) return null

              return (
                <section key={label}>
                  <h2 className="sc-section-heading" style={{ marginBottom: 12 }}>{label}</h2>
                  <div className="space-y-2">
                    {groupItems.map((item) => {
                      const days = daysParked(item.parked_at || item.created_at)
                      const isOld = days > 30
                      const isActive = item.status === 'waiting' || item.status === 'scheduled'
                      const displayDays = days <= 0 ? 'Parked today' : `${days}d parked`

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-4 rounded-xl border"
                          style={{
                            borderColor: isOld ? 'rgba(239,68,68,0.3)' : 'var(--sc-border)',
                            backgroundColor: 'var(--sc-surface)',
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-medium" style={{ color: 'var(--sc-text)' }}>
                                {item.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${CATEGORY_COLOURS[item.category]}20`,
                                  color: CATEGORY_COLOURS[item.category],
                                }}
                              >
                                {CATEGORY_LABELS[item.category]}
                              </span>
                              <span
                                className="text-xs"
                                style={{ color: isOld ? '#EF4444' : 'var(--sc-muted)' }}
                              >
                                {displayDays}
                                {isOld && ' — review or archive'}
                              </span>
                              {item.review_date && (
                                <span className="text-xs" style={{ color: 'var(--sc-muted)' }}>
                                  Review: {item.review_date}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--sc-muted)' }}>
                                {item.notes}
                              </p>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="shrink-0 p-1.5 rounded hover:bg-[var(--sc-border)] transition-colors"
                              style={{ color: 'var(--sc-muted)' }}
                            >
                              <MoreHorizontal size={15} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isActive && (
                                <>
                                  <DropdownMenuItem onClick={() => handleSchedule(item.id)}>
                                    Review on Monday
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleActOn(item.id)}>
                                    Act on it
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleKill(item.id)}
                                    variant="destructive"
                                  >
                                    Archive idea
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => setConfirmDeleteId(item.id)}
                                variant="destructive"
                              >
                                Delete permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>

        </div>

        {/* Right column */}
        <div>
          <ContextPanel>
            <ContextBlock title="Parking rule">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PARKING_RULES.map((rule, i) => (
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

            <ContextBlock>
              <div className="sc-metric-row">
                <span className="sc-metric-label">Parked</span>
                <span className="sc-metric-value">{totalParked}</span>
              </div>
              <div className="sc-metric-row">
                <span className="sc-metric-label">Reviewing soon</span>
                <span className="sc-metric-value">{reviewingSoon}</span>
              </div>
              <div className="sc-metric-row">
                <span className="sc-metric-label">Cleared this month</span>
                <span className="sc-metric-value">{clearedThisMonth}</span>
              </div>
            </ContextBlock>
          </ContextPanel>
        </div>

      </div>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDeleteId} onOpenChange={open => { if (!open) setConfirmDeleteId(null) }}>
        <DialogContent
          className="max-w-sm"
          style={{ backgroundColor: 'var(--sc-background)', border: '1px solid var(--sc-border)' }}
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--sc-text)' }}>Delete permanently?</DialogTitle>
          </DialogHeader>
          <p className="text-sm mt-2" style={{ color: 'var(--sc-muted)' }}>
            Delete this idea permanently? This cannot be undone.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="flex-1 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={isPending}
              className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#EF4444', color: '#fff' }}
            >
              {isPending ? 'Deleting...' : 'Delete permanently'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>

      {/* Add Idea Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md" style={{ backgroundColor: 'var(--sc-background)', border: '1px solid var(--sc-border)' }} showCloseButton>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--sc-text)' }}>Park an idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                placeholder="What is the idea?"
                autoFocus
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ParkingLotCategory)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              >
                {(Object.entries(CATEGORY_LABELS) as [ParkingLotCategory, string][]).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Any context or detail..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--sc-muted)' }}>
                Review date
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={e => setReviewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--sc-border)', backgroundColor: 'var(--sc-surface)', color: 'var(--sc-text)' }}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 rounded-lg border text-sm transition-colors"
                style={{ borderColor: 'var(--sc-border)', color: 'var(--sc-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isPending || !title.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
              >
                {isPending ? 'Parking...' : 'Park it'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
