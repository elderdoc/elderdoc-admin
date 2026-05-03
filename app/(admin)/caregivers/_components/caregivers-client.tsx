'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AdminCaregiver } from '@/domains/caregivers'
import { approveCaregiver, suspendCaregiverUser, deleteCaregiverUser } from '@/domains/caregivers'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { StatusFilter } from '@/components/status-filter'
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

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
]

const COLUMNS = [
  { label: 'Name', width: 'w-[18%]' },
  { label: 'Care types', width: 'w-[16%]' },
  { label: 'Certs', width: 'w-[9%]' },
  { label: 'Rate', width: 'w-[9%]' },
  { label: 'Location', width: 'w-[12%]' },
  { label: 'Status', width: 'w-[9%]' },
  { label: 'Applied', width: 'w-[10%]' },
  { label: '', width: 'w-[17%]' },
]

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  active:   'bg-[var(--forest-soft)] text-[var(--forest-deep)] border-[var(--forest-soft)]',
  inactive: 'bg-muted text-muted-foreground border-border',
}

const suspendedBadge = (
  <span className="ml-1.5 inline-flex items-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 text-[11px] font-medium">
    Suspended
  </span>
)

export function CaregiversClient({ caregivers }: { caregivers: AdminCaregiver[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<AdminCaregiver | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    type: 'approve' | 'suspend' | 'delete'
    caregiver: AdminCaregiver
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return caregivers
    if (filter === 'suspended') return caregivers.filter((c) => c.suspendedAt !== null)
    return caregivers.filter((c) => c.status === filter)
  }, [caregivers, filter])

  function handleConfirm() {
    if (!confirmModal) return
    startTransition(async () => {
      let result: { success: boolean; error?: string }
      if (confirmModal.type === 'approve') result = await approveCaregiver(confirmModal.caregiver.id)
      else if (confirmModal.type === 'suspend') result = await suspendCaregiverUser(confirmModal.caregiver.userId)
      else result = await deleteCaregiverUser(confirmModal.caregiver.userId)
      if (result.success) { setConfirmModal(null); router.refresh() }
      else setError(result.error ?? 'Something went wrong.')
    })
  }

  return (
    <div>
      <div className="mb-5">
        <StatusFilter options={STATUS_OPTIONS} value={filter} onChange={setFilter} />
      </div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {filtered.map((cg) => {
          const rateLabel = cg.hourlyMin ? `$${Number(cg.hourlyMin).toFixed(0)}–$${Number(cg.hourlyMax ?? cg.hourlyMin).toFixed(0)}/hr` : '—'
          const badgeCls = STATUS_BADGE[cg.status ?? 'pending'] ?? STATUS_BADGE.pending
          return (
            <DataRow key={cg.id} onClick={() => setSelected(cg)}>
              <span className="w-[18%] flex items-center text-[13.5px] font-semibold truncate pr-3">
                {cg.name ?? '—'}
                {cg.suspendedAt && suspendedBadge}
              </span>
              <span className="w-[16%] text-[12px] text-muted-foreground truncate pr-3">
                {cg.careTypes.slice(0, 2).join(', ')}{cg.careTypes.length > 2 ? ` +${cg.careTypes.length - 2}` : ''}
              </span>
              <span className="w-[9%] text-[12px] text-muted-foreground">
                {cg.certifications.length > 0 ? `${cg.certifications.length} cert${cg.certifications.length > 1 ? 's' : ''}` : '—'}
              </span>
              <span className="w-[9%] text-[12px] text-muted-foreground">{rateLabel}</span>
              <span className="w-[12%] text-[12px] text-muted-foreground">
                {[cg.city, cg.state].filter(Boolean).join(', ') || '—'}
              </span>
              <span className="w-[9%]">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${badgeCls}`}>
                  {cg.status ?? 'pending'}
                </span>
              </span>
              <span className="w-[10%] text-[12px] text-muted-foreground">
                {new Date(cg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="w-[17%] flex items-center gap-1.5 text-[12px] justify-end">
                <Link href={`/caregivers/${cg.id}`} onClick={(e) => e.stopPropagation()} className="text-foreground/70 hover:text-foreground transition-colors">View</Link>
                {cg.status === 'pending' && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ type: 'approve', caregiver: cg }) }} className="text-[var(--forest)] hover:text-[var(--forest-deep)] transition-colors">Approve</button>
                  </>
                )}
                <span className="text-muted-foreground/40">·</span>
                <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ type: 'suspend', caregiver: cg }) }} className="text-amber-600 hover:text-amber-700 transition-colors">Suspend</button>
                <span className="text-muted-foreground/40">·</span>
                <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ type: 'delete', caregiver: cg }) }} className="text-destructive hover:text-destructive/80 transition-colors">Delete</button>
              </span>
            </DataRow>
          )
        })}
      </DataList>

      <EditPanel
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Caregiver'}
      >
        {selected && (
          <div className="space-y-4">
            <Field label="Status" value={selected.status ?? 'pending'} />
            <Field label="Hourly rate" value={selected.hourlyMin ? `$${Number(selected.hourlyMin).toFixed(0)}–$${Number(selected.hourlyMax ?? selected.hourlyMin).toFixed(0)}/hr` : null} />
            <Field label="Location" value={[selected.city, selected.state].filter(Boolean).join(', ') || null} />
            <Field label="Care types" value={selected.careTypes.length > 0 ? selected.careTypes.join(', ') : null} />
            <Field label="Certifications" value={selected.certifications.length > 0 ? selected.certifications.join(', ') : null} />
            <Field label="Applied" value={new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            {selected.suspendedAt && (
              <Field label="Suspended at" value={new Date(selected.suspendedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            )}
            <div className="pt-2">
              <Link href={`/caregivers/${selected.id}`} className="text-[13px] text-[var(--forest)] hover:text-[var(--forest-deep)] transition-colors">
                View full profile →
              </Link>
            </div>
          </div>
        )}
      </EditPanel>

      {confirmModal?.type === 'approve' && (
        <ConfirmModal open onClose={() => setConfirmModal(null)}
          title={`Approve ${confirmModal.caregiver.name ?? 'caregiver'} as an active caregiver?`}
          body="They will be visible to clients and eligible for matches."
          actionLabel="Approve" onConfirm={handleConfirm} isPending={isPending} variant="safe" />
      )}
      {confirmModal?.type === 'suspend' && (
        <ConfirmModal open onClose={() => setConfirmModal(null)}
          title={`Suspend ${confirmModal.caregiver.name ?? 'caregiver'}?`}
          body="They will immediately lose access to Elderdoc until unsuspended."
          actionLabel="Suspend" onConfirm={handleConfirm} isPending={isPending} variant="warning" />
      )}
      {confirmModal?.type === 'delete' && (
        <ConfirmModal open onClose={() => setConfirmModal(null)}
          title={`Delete ${confirmModal.caregiver.name ?? 'caregiver'}?`}
          body="This permanently deletes the account, profile, and all associated data."
          actionLabel="Delete" onConfirm={handleConfirm} isPending={isPending} variant="destructive" />
      )}
      {error && <p className="mt-3 text-[12.5px] text-destructive">{error}</p>}
    </div>
  )
}
