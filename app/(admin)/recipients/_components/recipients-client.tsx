'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminRecipient } from '@/domains/recipients'
import { updateRecipient, deleteRecipient } from '@/domains/recipients'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { ConfirmModal } from '@/components/confirm-modal'
import { EditPanel, inputCls, labelCls } from '@/components/edit-panel'

const COLUMNS = [
  { label: 'Name', width: 'w-[18%]' },
  { label: 'Client', width: 'w-[18%]' },
  { label: 'Relationship', width: 'w-[12%]' },
  { label: 'Conditions', width: 'w-[18%]' },
  { label: 'Mobility', width: 'w-[12%]' },
  { label: 'Created', width: 'w-[12%]' },
  { label: '', width: 'w-[10%]' },
]

export function RecipientsClient({ recipients }: { recipients: AdminRecipient[] }) {
  const router = useRouter()
  const [editRecipient, setEditRecipient] = useState<AdminRecipient | null>(null)
  const [form, setForm] = useState({ name: '', dob: '', phone: '', gender: '', relationship: '', mobilityLevel: '', notes: '' })
  const [deleteTarget, setDeleteTarget] = useState<AdminRecipient | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function openEdit(r: AdminRecipient) {
    setEditRecipient(r)
    setForm({
      name: r.name, dob: r.dob ?? '', phone: r.phone ?? '',
      gender: r.gender ?? '', relationship: r.relationship ?? '',
      mobilityLevel: r.mobilityLevel ?? '', notes: r.notes ?? '',
    })
    setError(null)
  }

  function handleSave() {
    if (!editRecipient) return
    startTransition(async () => {
      const result = await updateRecipient(editRecipient.id, form)
      if (result.success) { setEditRecipient(null); router.refresh() }
      else setError(result.error ?? 'Something went wrong.')
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteRecipient(deleteTarget.id)
      if (result.success) { setDeleteTarget(null); router.refresh() }
    })
  }

  return (
    <div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {recipients.map((r) => (
          <DataRow key={r.id} onClick={() => openEdit(r)}>
            <span className="w-[18%] text-[13.5px] font-semibold truncate pr-3">{r.name}</span>
            <span className="w-[18%] text-[12px] text-muted-foreground truncate pr-3">{r.clientName ?? r.clientEmail}</span>
            <span className="w-[12%] text-[12px] text-muted-foreground capitalize">{r.relationship ?? '—'}</span>
            <span className="w-[18%] text-[12px] text-muted-foreground">
              {r.conditions && r.conditions.length > 0
                ? `${r.conditions.slice(0, 2).join(', ')}${r.conditions.length > 2 ? ` +${r.conditions.length - 2}` : ''}`
                : '—'}
            </span>
            <span className="w-[12%] text-[12px] text-muted-foreground capitalize">{r.mobilityLevel?.replace(/-/g, ' ') ?? '—'}</span>
            <span className="w-[12%] text-[12px] text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-[10%] flex items-center gap-1.5 text-[12px] justify-end">
              <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="text-foreground/70 hover:text-foreground transition-colors">Edit</button>
              <span className="text-muted-foreground/40">·</span>
              <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="text-destructive hover:text-destructive/80 transition-colors">Delete</button>
            </span>
          </DataRow>
        ))}
      </DataList>

      <EditPanel
        open={editRecipient !== null}
        onClose={() => setEditRecipient(null)}
        title={`Edit ${editRecipient?.name ?? 'recipient'}`}
        footer={
          <button onClick={handleSave} disabled={isPending}
            className="w-full h-10 rounded-full bg-primary text-primary-foreground text-[13.5px] font-semibold disabled:opacity-50 hover:bg-[var(--forest-deep)] transition-colors">
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        }
      >
        <div className="space-y-4">
          {(['name', 'dob', 'phone', 'gender', 'relationship', 'mobilityLevel'] as const).map((field) => (
            <div key={field}>
              <label htmlFor={`edit-${field}`} className={labelCls}>
                {field === 'dob' ? 'Date of birth' : field === 'mobilityLevel' ? 'Mobility level' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                id={`edit-${field}`}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
          <div>
            <label htmlFor="edit-notes" className={labelCls}>Notes</label>
            <textarea
              id="edit-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>
          {error && <p className="text-[12.5px] text-destructive">{error}</p>}
        </div>
      </EditPanel>

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        body="This will remove them from all associated care requests."
        actionLabel="Delete"
        onConfirm={handleDelete}
        isPending={isPending}
        variant="destructive"
      />
    </div>
  )
}
