'use client'

import { useEffect, useState, useTransition } from 'react'
import type { AdminCareType } from '@/domains/care-types'
import { updateCareTypeLabel, setCareTypeActive } from '@/domains/care-types'

export function EditCareTypeDialog({
  row, onClose, onSaved,
}: { row: AdminCareType | null; onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => { setLabel(row?.label ?? ''); setError(null) }, [row])

  if (!row) return null

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await updateCareTypeLabel(row!.id, label)
      if (res.success) onSaved()
      else setError(res.error)
    })
  }

  function handleToggle() {
    setError(null)
    startTransition(async () => {
      const res = await setCareTypeActive(row!.id, !row!.isActive)
      if (res.success) onSaved()
      else setError(res.error)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-[12px] bg-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[15px] font-semibold mb-3">Edit care type</h2>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key</label>
            <p className="text-[13px] font-mono text-muted-foreground">{row.key}</p>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Label</label>
            <input
              type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
              required
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</label>
            <div className="flex items-center gap-2">
              <span className="text-[13px]">{row.isActive ? 'Active' : 'Inactive'}</span>
              <button type="button" onClick={handleToggle} disabled={isPending}
                className="text-[12.5px] text-[var(--forest)] hover:text-[var(--forest-deep)] underline disabled:opacity-50">
                {row.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
          {error && <p className="text-[12.5px] text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="rounded-[8px] bg-[var(--forest)] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--forest-deep)] transition-colors disabled:opacity-50">
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
