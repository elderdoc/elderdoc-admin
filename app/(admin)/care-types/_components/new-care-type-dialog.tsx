'use client'

import { useState, useTransition } from 'react'
import { createCareType } from '@/domains/care-types'

export function NewCareTypeDialog({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  function reset() { setKey(''); setLabel(''); setError(null) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await createCareType({ key, label })
      if (res.success) { reset(); onCreated() }
      else setError(res.error)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-[12px] bg-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[15px] font-semibold mb-3">New care type</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Label</label>
            <input
              type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="Personal Care"
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
              autoFocus required
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key (immutable)</label>
            <input
              type="text" value={key} onChange={(e) => setKey(e.target.value)}
              placeholder="personal-care"
              pattern="[a-z][a-z0-9-]*"
              className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-[13.5px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
              required
            />
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Lowercase, kebab-case. Cannot be changed after creation.
            </p>
          </div>
          {error && <p className="text-[12.5px] text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { reset(); onClose() }}
              className="rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="rounded-[8px] bg-[var(--forest)] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--forest-deep)] transition-colors disabled:opacity-50">
              {isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
