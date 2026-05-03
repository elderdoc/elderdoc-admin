'use client'

import { useState, useMemo } from 'react'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { StatusFilter } from '@/components/status-filter'
import { EditPanel } from '@/components/edit-panel'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

const COLUMNS = [
  { label: 'Client', width: 'w-[20%]' },
  { label: 'Caregiver', width: 'w-[18%]' },
  { label: 'Amount', width: 'w-[10%]' },
  { label: 'Fee', width: 'w-[10%]' },
  { label: 'Status', width: 'w-[10%]' },
  { label: 'Method', width: 'w-[8%]' },
  { label: 'Released', width: 'w-[12%]' },
  { label: 'Created', width: 'w-[12%]' },
]

type Payment = {
  id: string
  amount: string
  fee: string
  method: string
  status: string | null
  releasedAt: Date | null
  createdAt: Date
  clientName: string | null
  clientEmail: string
  caregiverName: string | null
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[13.5px]">{value ?? '—'}</p>
    </div>
  )
}

function StatusPill({ status }: { status: string | null }) {
  const s = status ?? 'pending'
  const styles: Record<string, string> = {
    pending:
      'bg-amber-50 text-amber-700 border border-amber-100',
    completed:
      'bg-[var(--forest-soft)] text-[var(--forest-deep)] border border-[var(--forest-soft)]',
    failed:
      'bg-destructive/10 text-destructive border border-destructive/20',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${styles[s] ?? styles.pending}`}
    >
      {s}
    </span>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function PaymentsClient({ payments }: { payments: Payment[] }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Payment | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return payments
    return payments.filter((p) => p.status === filter)
  }, [payments, filter])

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <StatusFilter options={STATUS_OPTIONS} value={filter} onChange={setFilter} />
      </div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-[13.5px] text-muted-foreground text-center">
            No payments found.
          </p>
        )}
        {filtered.map((payment) => (
          <DataRow key={payment.id} onClick={() => setSelected(payment)}>
            <span className="w-[20%] pr-4">
              <span className="block text-[13px] font-medium truncate">{payment.clientName ?? '—'}</span>
              <span className="block text-[11.5px] text-muted-foreground truncate">{payment.clientEmail}</span>
            </span>
            <span className="w-[18%] text-[13px] text-muted-foreground truncate pr-4">
              {payment.caregiverName ?? '—'}
            </span>
            <span className="w-[10%] text-[13px] font-medium pr-4">
              ${Number(payment.amount).toFixed(2)}
            </span>
            <span className="w-[10%] text-[12.5px] text-muted-foreground pr-4">
              ${Number(payment.fee).toFixed(2)}
            </span>
            <span className="w-[10%] pr-4">
              <StatusPill status={payment.status} />
            </span>
            <span className="w-[8%] text-[12.5px] text-muted-foreground pr-4">
              {payment.method}
            </span>
            <span className="w-[12%] text-[12.5px] text-muted-foreground pr-4">
              {payment.releasedAt ? formatDate(payment.releasedAt) : '—'}
            </span>
            <span className="w-[12%] text-[12.5px] text-muted-foreground">
              {formatDate(payment.createdAt)}
            </span>
          </DataRow>
        ))}
      </DataList>

      <EditPanel
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Payment details"
      >
        {selected && (
          <div className="space-y-4">
            <Field label="ID" value={selected.id} />
            <Field label="Status" value={selected.status} />
            <Field label="Amount" value={`$${Number(selected.amount).toFixed(2)}`} />
            <Field label="Platform fee" value={`$${Number(selected.fee).toFixed(2)}`} />
            <Field label="Net payout" value={`$${(Number(selected.amount) - Number(selected.fee)).toFixed(2)}`} />
            <Field label="Payment method" value={selected.method} />
            <Field label="Client" value={selected.clientName} />
            <Field label="Client email" value={selected.clientEmail} />
            <Field label="Caregiver" value={selected.caregiverName} />
            <Field label="Released at" value={selected.releasedAt ? formatDate(selected.releasedAt) : null} />
            <Field label="Created" value={formatDate(selected.createdAt)} />
          </div>
        )}
      </EditPanel>
    </div>
  )
}
