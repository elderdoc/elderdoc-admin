'use client'

import { useState, useMemo } from 'react'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { StatusFilter } from '@/components/status-filter'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Matched', value: 'matched' },
  { label: 'Filled', value: 'filled' },
  { label: 'Cancelled', value: 'cancelled' },
]

const COLUMNS = [
  { label: 'Title', width: 'w-[22%]' },
  { label: 'Client', width: 'w-[18%]' },
  { label: 'Recipient', width: 'w-[15%]' },
  { label: 'Care Type', width: 'w-[12%]' },
  { label: 'Status', width: 'w-[10%]' },
  { label: 'Budget', width: 'w-[10%]' },
  { label: 'Created', width: 'w-[13%]' },
]

type CareRequest = {
  id: string
  title: string | null
  careType: string
  status: string | null
  budgetMin: string | null
  budgetMax: string | null
  createdAt: Date
  clientName: string | null
  clientEmail: string
  recipientName: string | null
}

function StatusPill({ status }: { status: string | null }) {
  const s = status ?? 'draft'
  const styles: Record<string, string> = {
    draft:
      'bg-muted text-muted-foreground border border-border',
    active:
      'bg-[var(--forest-soft)] text-[var(--forest-deep)] border border-[var(--forest-soft)]',
    matched:
      'bg-blue-50 text-blue-700 border border-blue-100',
    filled:
      'bg-[var(--forest-soft)] text-[var(--forest-deep)] border border-[var(--forest-soft)]',
    cancelled:
      'bg-destructive/10 text-destructive border border-destructive/20',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${styles[s] ?? styles.draft}`}
    >
      {s}
    </span>
  )
}

function formatBudget(min: string | null, max: string | null) {
  if (!min && !max) return '—'
  if (min && max) return `$${Number(min).toFixed(0)}–$${Number(max).toFixed(0)}/hr`
  if (min) return `$${Number(min).toFixed(0)}/hr`
  return `$${Number(max).toFixed(0)}/hr`
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function CareRequestsClient({ careRequests }: { careRequests: CareRequest[] }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return careRequests
    return careRequests.filter((r) => r.status === filter)
  }, [careRequests, filter])

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <StatusFilter options={STATUS_OPTIONS} value={filter} onChange={setFilter} />
      </div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-[13.5px] text-muted-foreground text-center">
            No care requests found.
          </p>
        )}
        {filtered.map((req) => (
          <DataRow key={req.id}>
            <span className="w-[22%] text-[13.5px] font-semibold truncate pr-4">
              {req.title ?? req.careType}
            </span>
            <span className="w-[18%] pr-4">
              <span className="block text-[13px] font-medium truncate">{req.clientName ?? '—'}</span>
              <span className="block text-[11.5px] text-muted-foreground truncate">{req.clientEmail}</span>
            </span>
            <span className="w-[15%] text-[13px] text-muted-foreground truncate pr-4">
              {req.recipientName ?? '—'}
            </span>
            <span className="w-[12%] text-[12.5px] text-muted-foreground capitalize truncate pr-4">
              {req.careType}
            </span>
            <span className="w-[10%] pr-4">
              <StatusPill status={req.status} />
            </span>
            <span className="w-[10%] text-[12.5px] text-muted-foreground pr-4">
              {formatBudget(req.budgetMin, req.budgetMax)}
            </span>
            <span className="w-[13%] text-[12.5px] text-muted-foreground">
              {formatDate(req.createdAt)}
            </span>
          </DataRow>
        ))}
      </DataList>
    </div>
  )
}
