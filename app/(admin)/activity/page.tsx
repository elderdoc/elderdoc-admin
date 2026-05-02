import { db } from '@elderdoc/db'
import { notifications, users } from '@elderdoc/db/schema'
import { desc, eq } from 'drizzle-orm'
import { DataList, DataHeader, DataRow } from '@/components/data-list'

const COLUMNS = [
  { label: 'User', width: 'w-[25%]' },
  { label: 'Type', width: 'w-[18%]' },
  { label: 'Message', width: 'w-[37%]' },
  { label: 'Date', width: 'w-[20%]' },
]

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function RolePill({ role }: { role: string | null }) {
  const styles: Record<string, string> = {
    client:    'bg-blue-50 text-blue-700 border border-blue-100',
    caregiver: 'bg-[var(--forest-soft)] text-[var(--forest-deep)] border border-[var(--forest-soft)]',
    admin:     'bg-muted text-muted-foreground border border-border',
  }
  const r = role ?? 'client'
  return (
    <span
      className={`ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${styles[r] ?? styles.client}`}
    >
      {r}
    </span>
  )
}

export default async function ActivityPage() {
  const rows = await db
    .select({
      id:        notifications.id,
      type:      notifications.type,
      payload:   notifications.payload,
      createdAt: notifications.createdAt,
      userName:  users.name,
      userEmail: users.email,
      userRole:  users.role,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.userId, users.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100)

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Activity</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">Last {rows.length} notifications</p>
      </div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {rows.length === 0 && (
          <p className="px-5 py-10 text-[13.5px] text-muted-foreground text-center">
            No activity yet.
          </p>
        )}
        {rows.map((n) => {
          const payload = n.payload as Record<string, unknown>
          const message =
            (payload?.message as string) ??
            (payload?.description as string) ??
            n.type

          return (
            <DataRow key={n.id}>
              <span className="w-[25%] flex items-center pr-4">
                <span className="text-[13px] font-medium truncate">{n.userName ?? n.userEmail ?? '—'}</span>
                <RolePill role={n.userRole ?? null} />
              </span>
              <span className="w-[18%] text-[12.5px] text-muted-foreground truncate pr-4">
                {n.type}
              </span>
              <span className="w-[37%] text-[12.5px] text-muted-foreground truncate pr-4">
                {message}
              </span>
              <span className="w-[20%] text-[12.5px] text-muted-foreground">
                {formatDateTime(n.createdAt)}
              </span>
            </DataRow>
          )
        })}
      </DataList>
    </div>
  )
}
