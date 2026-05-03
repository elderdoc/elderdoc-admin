'use client'

import { useState, useMemo } from 'react'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { StatusFilter } from '@/components/status-filter'
import { EditPanel } from '@/components/edit-panel'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Withdrawn', value: 'withdrawn' },
]

const COLUMNS = [
  { label: 'Client', width: 'w-[22%]' },
  { label: 'Reason', width: 'w-[28%]' },
  { label: 'Status', width: 'w-[12%]' },
  { label: 'Payment', width: 'w-[12%]' },
  { label: 'Created', width: 'w-[13%]' },
  { label: 'Resolved', width: 'w-[13%]' },
]

type Dispute = {
  id: string
  reason: string
  status: string
  createdAt: Date
  resolvedAt: Date | null
  clientName: string | null
  clientEmail: string
  paymentAmount: string | null
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[13.5px]">{value ?? '—'}</p>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open:
      'bg-amber-50 text-amber-700 border border-amber-100',
    resolved:
      'bg-[var(--forest-soft)] text-[var(--forest-deep)] border border-[var(--forest-soft)]',
    withdrawn:
      'bg-muted text-muted-foreground border border-border',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${styles[status] ?? styles.open}`}
    >
      {status}
    </span>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function DisputesClient({ disputes }: { disputes: Dispute[] }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Dispute | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return disputes
    return disputes.filter((d) => d.status === filter)
  }, [disputes, filter])

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <StatusFilter options={STATUS_OPTIONS} value={filter} onChange={setFilter} />
      </div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-[13.5px] text-muted-foreground text-center">
            No disputes found.
          </p>
        )}
        {filtered.map((dispute) => (
          <DataRow key={dispute.id} onClick={() => setSelected(dispute)}>
            <span className="w-[22%] pr-4">
              <span className="block text-[13px] font-medium truncate">{dispute.clientName ?? '—'}</span>
              <span className="block text-[11.5px] text-muted-foreground truncate">{dispute.clientEmail}</span>
            </span>
            <span className="w-[28%] text-[12.5px] text-muted-foreground truncate pr-4">
              {dispute.reason}
            </span>
            <span className="w-[12%] pr-4">
              <StatusPill status={dispute.status} />
            </span>
            <span className="w-[12%] text-[12.5px] text-muted-foreground pr-4">
              {dispute.paymentAmount != null ? `$${Number(dispute.paymentAmount).toFixed(2)}` : '—'}
            </span>
            <span className="w-[13%] text-[12.5px] text-muted-foreground pr-4">
              {formatDate(dispute.createdAt)}
            </span>
            <span className="w-[13%] text-[12.5px] text-muted-foreground">
              {dispute.resolvedAt ? formatDate(dispute.resolvedAt) : '—'}
            </span>
          </DataRow>
        ))}
      </DataList>

      <EditPanel
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Dispute details"
      >
        {selected && (
          <div className="space-y-4">
            <Field label="ID" value={selected.id} />
            <Field label="Status" value={selected.status} />
            <Field label="Reason" value={selected.reason} />
            <Field label="Client" value={selected.clientName} />
            <Field label="Client email" value={selected.clientEmail} />
            <Field label="Payment amount" value={selected.paymentAmount != null ? `$${Number(selected.paymentAmount).toFixed(2)}` : null} />
            <Field label="Created" value={formatDate(selected.createdAt)} />
            <Field label="Resolved at" value={selected.resolvedAt ? formatDate(selected.resolvedAt) : null} />
          </div>
        )}
      </EditPanel>
    </div>
  )
}
