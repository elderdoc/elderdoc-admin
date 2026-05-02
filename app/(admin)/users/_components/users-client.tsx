'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminUser } from '@/domains/users'
import { updateUser, suspendUser, unsuspendUser, deleteUser } from '@/domains/users'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import { StatusFilter } from '@/components/status-filter'
import { ConfirmModal } from '@/components/confirm-modal'
import { EditPanel, inputCls, labelCls } from '@/components/edit-panel'

const ROLE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Clients', value: 'client' },
  { label: 'Caregivers', value: 'caregiver' },
  { label: 'Admins', value: 'admin' },
  { label: 'Suspended', value: 'suspended' },
]

const COLUMNS = [
  { label: 'Name', width: 'w-[30%]' },
  { label: 'Email', width: 'w-[30%]' },
  { label: 'Role', width: 'w-[15%]' },
  { label: 'Joined', width: 'w-[15%]' },
  { label: '', width: 'w-[10%]' },
]

const ROLE_PILLS = ['client', 'caregiver', 'admin']

const suspendedBadge = (
  <span className="ml-1.5 inline-flex items-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 text-[11px] font-medium">
    Suspended
  </span>
)

export function UsersClient({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState('')
  const [confirmModal, setConfirmModal] = useState<{
    type: 'suspend' | 'unsuspend' | 'delete' | 'edit'
    user: AdminUser
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = users
    if (filter === 'suspended') result = result.filter((u) => u.suspendedAt !== null)
    else if (filter !== 'all') result = result.filter((u) => u.role === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((u) =>
        u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    }
    return result
  }, [users, filter, search])

  function openEdit(user: AdminUser) {
    setEditUser(user)
    setEditName(user.name ?? '')
    setEditEmail(user.email)
    setEditPhone(user.phone ?? '')
    setEditRole(user.role ?? 'client')
    setError(null)
  }

  function handleConfirm() {
    if (!confirmModal) return
    setError(null)
    startTransition(async () => {
      let result: { success: boolean; error?: string }
      if (confirmModal.type === 'edit') {
        result = await updateUser(confirmModal.user.id, {
          name: editName, email: editEmail, phone: editPhone, role: editRole,
        })
      } else if (confirmModal.type === 'suspend') {
        result = await suspendUser(confirmModal.user.id)
      } else if (confirmModal.type === 'unsuspend') {
        result = await unsuspendUser(confirmModal.user.id)
      } else {
        result = await deleteUser(confirmModal.user.id)
      }
      if (result.success) {
        setConfirmModal(null)
        setEditUser(null)
        router.refresh()
      } else {
        setError(result.error ?? 'Something went wrong.')
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <StatusFilter options={ROLE_OPTIONS} value={filter} onChange={setFilter} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
          placeholder="Search by name or email…"
          className="ml-auto w-64 rounded-[10px] border border-border bg-card px-3.5 py-2 text-[13px] placeholder:text-muted-foreground/50 focus:border-[var(--forest)] focus:outline-none focus:ring-2 focus:ring-[var(--forest-soft)] transition-shadow"
        />
      </div>

      <DataList>
        <DataHeader columns={COLUMNS} />
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-[13.5px] text-muted-foreground text-center">No users found.</p>
        )}
        {filtered.map((u) => (
          <DataRow key={u.id}>
            <span className="w-[30%] flex items-center text-[13.5px] font-semibold truncate pr-4">
              {u.name ?? '—'}
              {u.suspendedAt && suspendedBadge}
            </span>
            <span className="w-[30%] text-[12.5px] text-muted-foreground truncate pr-4">{u.email}</span>
            <span className="w-[15%] text-[12.5px] capitalize text-muted-foreground">{u.role ?? '—'}</span>
            <span className="w-[15%] text-[12.5px] text-muted-foreground">
              {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-[10%] flex items-center gap-2 text-[12px] justify-end pr-1">
              <button onClick={() => openEdit(u)} className="text-foreground/70 hover:text-foreground transition-colors">Edit</button>
              <span className="text-muted-foreground/40">·</span>
              {u.suspendedAt ? (
                <button onClick={() => setConfirmModal({ type: 'unsuspend', user: u })} className="text-[var(--forest)] hover:text-[var(--forest-deep)] transition-colors">Unsuspend</button>
              ) : (
                <button onClick={() => setConfirmModal({ type: 'suspend', user: u })} className="text-amber-600 hover:text-amber-700 transition-colors">Suspend</button>
              )}
              <span className="text-muted-foreground/40">·</span>
              <button onClick={() => setConfirmModal({ type: 'delete', user: u })} className="text-destructive hover:text-destructive/80 transition-colors">Delete</button>
            </span>
          </DataRow>
        ))}
      </DataList>

      {/* Edit panel */}
      <EditPanel
        open={editUser !== null}
        onClose={() => setEditUser(null)}
        title={`Edit ${editUser?.name ?? 'user'}`}
        footer={
          <button
            onClick={() => editUser && setConfirmModal({ type: 'edit', user: editUser })}
            className="w-full h-10 rounded-full bg-primary text-primary-foreground text-[13.5px] font-semibold hover:bg-[var(--forest-deep)] transition-colors"
          >
            Save changes
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className={labelCls}>Name</label>
            <input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="edit-email" className={labelCls}>Email</label>
            <input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="edit-phone" className={labelCls}>Phone</label>
            <input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="edit-role-group" className={labelCls}>Role</label>
            <div className="flex gap-2 mt-1">
              {ROLE_PILLS.map((r) => (
                <button
                  key={r}
                  onClick={() => setEditRole(r)}
                  aria-pressed={editRole === r}
                  className={[
                    'flex-1 h-9 rounded-full text-[12.5px] font-medium capitalize transition-colors',
                    editRole === r ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12.5px] text-destructive">{error}</p>}
        </div>
      </EditPanel>

      {/* Confirm modals */}
      {confirmModal?.type === 'edit' && (
        <ConfirmModal
          open
          onClose={() => setConfirmModal(null)}
          title={`Update ${confirmModal.user.name ?? confirmModal.user.email}'s account?`}
          body="This will update their name, email, phone, and role immediately."
          actionLabel="Save changes"
          onConfirm={handleConfirm}
          isPending={isPending}
          variant="safe"
        />
      )}
      {confirmModal?.type === 'suspend' && (
        <ConfirmModal
          open
          onClose={() => setConfirmModal(null)}
          title={`Suspend ${confirmModal.user.name ?? confirmModal.user.email}?`}
          body="They will immediately lose access to Elderdoc until unsuspended."
          actionLabel="Suspend"
          onConfirm={handleConfirm}
          isPending={isPending}
          variant="warning"
        />
      )}
      {confirmModal?.type === 'unsuspend' && (
        <ConfirmModal
          open
          onClose={() => setConfirmModal(null)}
          title={`Restore access for ${confirmModal.user.name ?? confirmModal.user.email}?`}
          body="They will regain full access to their account immediately."
          actionLabel="Restore access"
          onConfirm={handleConfirm}
          isPending={isPending}
          variant="safe"
        />
      )}
      {confirmModal?.type === 'delete' && (
        <ConfirmModal
          open
          onClose={() => setConfirmModal(null)}
          title={`Delete ${confirmModal.user.name ?? confirmModal.user.email}?`}
          body="This permanently deletes the account and all associated data. This cannot be undone."
          actionLabel="Delete"
          onConfirm={handleConfirm}
          isPending={isPending}
          variant="destructive"
        />
      )}
    </div>
  )
}
