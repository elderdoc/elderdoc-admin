'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminCareType } from '@/domains/care-types'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { StatusFilter } from '@/components/status-filter'
import { NewCareTypeDialog } from './new-care-type-dialog'
import { EditCareTypeDialog } from './edit-care-type-dialog'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const COLUMNS = [
  { label: 'Label', width: 'w-[30%]' },
  { label: 'Key', width: 'w-[28%]' },
  { label: 'Status', width: 'w-[12%]' },
  { label: 'Created', width: 'w-[14%]' },
  { label: 'Updated', width: 'w-[14%]' },
  { label: '', width: 'w-[2%]' },
]

export function CareTypesClient({ rows }: { rows: AdminCareType[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [newOpen, setNewOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCareType | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    if (filter === 'active') return rows.filter((r) => r.isActive)
    return rows.filter((r) => !r.isActive)
  }, [rows, filter])

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <StatusFilter options={STATUS_OPTIONS} value={filter} onChange={setFilter} />
        <button
          onClick={() => setNewOpen(true)}
          className="rounded-[8px] bg-[var(--forest)] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--forest-deep)] transition-colors"
        >
          New care type
        </button>
      </div>

      <DataList>
        <DataHeader columns={COLUMNS} />
        {filtered.map((row) => (
          <DataRow key={row.id} onClick={() => setEditing(row)}>
            <span className="w-[30%] flex items-center text-[13.5px] font-semibold truncate pr-3">{row.label}</span>
            <span className="w-[28%] text-[12px] font-mono text-muted-foreground truncate pr-3">{row.key}</span>
            <span className="w-[12%]">
              <span className={[
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                row.isActive
                  ? 'bg-[var(--forest-soft)] text-[var(--forest-deep)] border-[var(--forest-soft)]'
                  : 'bg-muted text-muted-foreground border-border',
              ].join(' ')}>
                {row.isActive ? 'Active' : 'Inactive'}
              </span>
            </span>
            <span className="w-[14%] text-[12px] text-muted-foreground">
              {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-[14%] text-[12px] text-muted-foreground">
              {new Date(row.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-[2%]" />
          </DataRow>
        ))}
      </DataList>

      <NewCareTypeDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => { setNewOpen(false); router.refresh() }}
      />
      <EditCareTypeDialog
        row={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); router.refresh() }}
      />
    </div>
  )
}
