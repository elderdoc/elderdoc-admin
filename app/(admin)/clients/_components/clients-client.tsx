'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AdminClient } from '@/domains/clients'
import { suspendClientUser, deleteClientUser } from '@/domains/clients'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { ConfirmModal } from '@/components/confirm-modal'
import { EditPanel } from '@/components/edit-panel'

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[13.5px]">{value ?? '—'}</p>
    </div>
  )
}

const COLUMNS = [
  { label: 'Name', width: 'w-[20%]' },
  { label: 'Email', width: 'w-[20%]' },
  { label: 'Recipients', width: 'w-[10%]' },
  { label: 'Open requests', width: 'w-[12%]' },
  { label: 'Active jobs', width: 'w-[12%]' },
  { label: 'Joined', width: 'w-[12%]' },
  { label: '', width: 'w-[14%]' },
]

const suspendedBadge = (
  <span className="ml-1.5 inline-flex items-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 text-[11px] font-medium">
    Suspended
  </span>
)

export function ClientsClient({ clients }: { clients: AdminClient[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<AdminClient | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ type: 'suspend' | 'delete'; client: AdminClient } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!confirmModal) return
    startTransition(async () => {
      const result = confirmModal.type === 'suspend'
        ? await suspendClientUser(confirmModal.client.id)
        : await deleteClientUser(confirmModal.client.id)
      if (result.success) { setConfirmModal(null); router.refresh() }
    })
  }

  return (
    <div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {clients.map((c) => (
          <DataRow key={c.id} onClick={() => setSelected(c)}>
            <span className="w-[20%] flex items-center text-[13.5px] font-semibold truncate pr-3">
              {c.name ?? '—'}
              {c.suspendedAt && suspendedBadge}
            </span>
            <span className="w-[20%] text-[12px] text-muted-foreground truncate pr-3">{c.email}</span>
            <span className="w-[10%] text-[12.5px] tabular-nums">{c.recipientCount}</span>
            <span className="w-[12%] text-[12.5px] tabular-nums">{c.activeRequestCount}</span>
            <span className="w-[12%] text-[12.5px] tabular-nums">{c.activeJobCount}</span>
            <span className="w-[12%] text-[12px] text-muted-foreground">
              {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-[14%] flex items-center gap-1.5 text-[12px] justify-end">
              <Link href={`/clients/${c.id}`} onClick={(e) => e.stopPropagation()} className="text-foreground/70 hover:text-foreground transition-colors">View</Link>
              <span className="text-muted-foreground/40">·</span>
              <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ type: 'suspend', client: c }) }} className="text-amber-600 hover:text-amber-700 transition-colors">Suspend</button>
              <span className="text-muted-foreground/40">·</span>
              <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ type: 'delete', client: c }) }} className="text-destructive hover:text-destructive/80 transition-colors">Delete</button>
            </span>
          </DataRow>
        ))}
      </DataList>

      <EditPanel
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Client'}
      >
        {selected && (
          <div className="space-y-4">
            <Field label="Name" value={selected.name} />
            <Field label="Email" value={selected.email} />
            <Field label="Care recipients" value={String(selected.recipientCount)} />
            <Field label="Open care requests" value={String(selected.activeRequestCount)} />
            <Field label="Active jobs" value={String(selected.activeJobCount)} />
            <Field label="Joined" value={new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            {selected.suspendedAt && (
              <Field label="Suspended at" value={new Date(selected.suspendedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            )}
            <div className="pt-2">
              <Link href={`/clients/${selected.id}`} className="text-[13px] text-[var(--forest)] hover:text-[var(--forest-deep)] transition-colors">
                View full profile →
              </Link>
            </div>
          </div>
        )}
      </EditPanel>

      {confirmModal?.type === 'suspend' && (
        <ConfirmModal open onClose={() => setConfirmModal(null)}
          title={`Suspend ${confirmModal.client.name ?? 'client'}?`}
          body="They will immediately lose access to Elderdoc until unsuspended."
          actionLabel="Suspend" onConfirm={handleConfirm} isPending={isPending} variant="warning" />
      )}
      {confirmModal?.type === 'delete' && (
        <ConfirmModal open onClose={() => setConfirmModal(null)}
          title={`Delete ${confirmModal.client.name ?? 'client'}?`}
          body="This permanently deletes the account, all care recipients, care requests, and associated data."
          actionLabel="Delete" onConfirm={handleConfirm} isPending={isPending} variant="destructive" />
      )}
    </div>
  )
}
