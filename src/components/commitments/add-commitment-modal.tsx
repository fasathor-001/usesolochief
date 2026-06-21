'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCommitment } from '@/lib/actions/commitments'
import type { CommitmentStage, PermissionLevel, CommitmentCategory } from '@/types/database'

// Auto-suggest permission level based on stage (D-014)
const STAGE_PERMISSION: Record<CommitmentStage, PermissionLevel> = {
  main_focus: 'can_interrupt',
  active: 'protected_block',
  launch_checklist: 'checklist_only',
  maintenance: 'maintenance_only',
  follow_up: 'follow_up_only',
  parked: 'parked',
}

interface AddCommitmentModalProps {
  open: boolean
  onClose: () => void
}

export function AddCommitmentModal({ open, onClose }: AddCommitmentModalProps) {
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CommitmentCategory>('admin')
  const [stage, setStage] = useState<CommitmentStage>('active')
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('protected_block')
  const [priority, setPriority] = useState(5)
  const [nextAction, setNextAction] = useState('')
  const [description, setDescription] = useState('')

  function handleStageChange(value: string) {
    const s = value as CommitmentStage
    setStage(s)
    setPermissionLevel(STAGE_PERMISSION[s])
  }

  function resetForm() {
    setTitle('')
    setCategory('admin')
    setStage('active')
    setPermissionLevel('protected_block')
    setPriority(5)
    setNextAction('')
    setDescription('')
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleSubmit() {
    if (!title.trim()) {
      toast.error('Name is required')
      return
    }

    startTransition(async () => {
      const result = await createCommitment({
        title: title.trim(),
        category,
        stage,
        permission_level: permissionLevel,
        priority,
        next_action: nextAction.trim() || null,
        description: description.trim() || null,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Commitment added')
      handleClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Commitment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sc-text)]">Name *</label>
            <Input
              placeholder="e.g. SoloChief launch preparation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sc-text)]">Category *</label>
              <Select value={category} onValueChange={(v) => { if (v) setCategory(v as CommitmentCategory) }} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['product','admin','legal','finance','content','customer','launch','maintenance','idea','personal'] as const).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--sc-text)]">Priority (1–10)</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sc-text)]">Stage *</label>
            <Select value={stage} onValueChange={(v) => { if (v) handleStageChange(v) }} disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main_focus">Main Focus</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="launch_checklist">Launch Checklist</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="follow_up">Follow-Up</SelectItem>
                <SelectItem value="parked">Parked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sc-text)]">
              Permission Level *
              <span className="text-xs text-[var(--sc-muted)] font-normal ml-2">(suggested based on stage)</span>
            </label>
            <Select value={permissionLevel} onValueChange={(v) => { if (v) setPermissionLevel(v as PermissionLevel) }} disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="can_interrupt">Can Interrupt</SelectItem>
                <SelectItem value="protected_block">Protected Block</SelectItem>
                <SelectItem value="checklist_only">Checklist Only</SelectItem>
                <SelectItem value="maintenance_only">Maintenance Only</SelectItem>
                <SelectItem value="follow_up_only">Follow-Up Only</SelectItem>
                <SelectItem value="parked">Parked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sc-text)]">Next Action</label>
            <Input
              placeholder="e.g. Write the landing page copy"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sc-text)]">Notes</label>
            <Textarea
              placeholder="Any context, constraints, or background…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !title.trim()}
            style={{ backgroundColor: 'var(--sc-accent)', color: '#fff' }}
          >
            {isPending ? 'Saving…' : 'Add Commitment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
