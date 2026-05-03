'use client'

import { useState, useMemo } from 'react'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { StatusFilter } from '@/components/status-filter'
import { EditPanel } from '@/components/edit-panel'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const COLUMNS = [
  { label: 'Date', width: 'w-[12%]' },
  { label: 'Start', width: 'w-[9%]' },
  { label: 'End', width: 'w-[9%]' },
  { label: 'Client', width: 'w-[18%]' },
  { label: 'Caregiver', width: 'w-[18%]' },
  { label: 'Status', width: 'w-[10%]' },
  { label: 'Billed', width: 'w-[10%]' },
  { label: 'Created', width: 'w-[14%]' },
]

type Shift = {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string | null
  billedAt: Date | null
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
  const s = status ?? 'scheduled'
  const styles: Record<string, string> = {
    scheduled:
      'bg-amber-50 text-amber-700 border border-amber-100',
    completed:
      'bg-[var(--forest-soft)] text-[var(--forest-deep)] border border-[var(--forest-soft)]',
    cancelled:
      'bg-muted text-muted-foreground border border-border',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${styles[s] ?? styles.scheduled}`}
    >
      {s}
    </span>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ShiftsClient({ shifts }: { shifts: Shift[] }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Shift | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return shifts
    return shifts.filter((s) => s.status === filter)
  }, [shifts, filter])

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <StatusFilter options={STATUS_OPTIONS} value={filter} onChange={setFilter} />
      </div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-[13.5px] text-muted-foreground text-center">
            No shifts found.
          </p>
        )}
        {filtered.map((shift) => (
          <DataRow key={shift.id} onClick={() => setSelected(shift)}>
            <span className="w-[12%] text-[12.5px] text-muted-foreground pr-3">
              {shift.date}
            </span>
            <span className="w-[9%] text-[12.5px] text-muted-foreground pr-3">
              {shift.startTime}
            </span>
            <span className="w-[9%] text-[12.5px] text-muted-foreground pr-3">
              {shift.endTime}
            </span>
            <span className="w-[18%] pr-4">
              <span className="block text-[13px] font-medium truncate">{shift.clientName ?? '—'}</span>
              <span className="block text-[11.5px] text-muted-foreground truncate">{shift.clientEmail}</span>
            </span>
            <span className="w-[18%] text-[13px] text-muted-foreground truncate pr-4">
              {shift.caregiverName ?? '—'}
            </span>
            <span className="w-[10%] pr-4">
              <StatusPill status={shift.status} />
            </span>
            <span className="w-[10%] text-[12.5px] text-muted-foreground pr-4">
              {shift.billedAt ? formatDate(shift.billedAt) : '—'}
            </span>
            <span className="w-[14%] text-[12.5px] text-muted-foreground">
              {formatDate(shift.createdAt)}
            </span>
          </DataRow>
        ))}
      </DataList>

      <EditPanel
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={`Shift — ${selected?.date ?? ''}`}
      >
        {selected && (
          <div className="space-y-4">
            <Field label="ID" value={selected.id} />
            <Field label="Date" value={selected.date} />
            <Field label="Start time" value={selected.startTime} />
            <Field label="End time" value={selected.endTime} />
            <Field label="Status" value={selected.status} />
            <Field label="Client" value={selected.clientName} />
            <Field label="Client email" value={selected.clientEmail} />
            <Field label="Caregiver" value={selected.caregiverName} />
            <Field label="Billed at" value={selected.billedAt ? formatDate(selected.billedAt) : null} />
            <Field label="Created" value={formatDate(selected.createdAt)} />
          </div>
        )}
      </EditPanel>
    </div>
  )
}
