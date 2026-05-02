import { db } from '@elderdoc/db'
import { jobs, users, caregiverProfiles, careRequests } from '@elderdoc/db/schema'
import { desc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { DataList, DataHeader, DataRow } from '@/components/data-list'
import Link from 'next/link'

const COLUMNS = [
  { label: 'Care Request', width: 'w-[22%]' },
  { label: 'Client', width: 'w-[18%]' },
  { label: 'Caregiver', width: 'w-[18%]' },
  { label: 'Status', width: 'w-[10%]' },
  { label: 'Created', width: 'w-[12%]' },
  { label: 'Actions', width: 'w-[20%]' },
]

function StatusPill({ status }: { status: string | null }) {
  const s = status ?? 'active'
  const styles: Record<string, string> = {
    active:
      'bg-[var(--forest-soft)] text-[var(--forest-deep)] border border-[var(--forest-soft)]',
    completed:
      'bg-blue-50 text-blue-700 border border-blue-100',
    cancelled:
      'bg-muted text-muted-foreground border border-border',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${styles[s] ?? styles.active}`}
    >
      {s}
    </span>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function JobsPage() {
  const clientUsers = alias(users, 'client_users')
  const caregiverUsers = alias(users, 'caregiver_users')

  const rows = await db
    .select({
      id:              jobs.id,
      status:          jobs.status,
      createdAt:       jobs.createdAt,
      requestTitle:    careRequests.title,
      requestCareType: careRequests.careType,
      clientName:      clientUsers.name,
      clientEmail:     clientUsers.email,
      caregiverName:   caregiverUsers.name,
    })
    .from(jobs)
    .leftJoin(careRequests, eq(jobs.requestId, careRequests.id))
    .leftJoin(clientUsers, eq(jobs.clientId, clientUsers.id))
    .leftJoin(caregiverProfiles, eq(jobs.caregiverId, caregiverProfiles.id))
    .leftJoin(caregiverUsers, eq(caregiverProfiles.userId, caregiverUsers.id))
    .orderBy(desc(jobs.createdAt))

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Jobs</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{rows.length} total jobs</p>
      </div>
      <DataList>
        <DataHeader columns={COLUMNS} />
        {rows.length === 0 && (
          <p className="px-5 py-10 text-[13.5px] text-muted-foreground text-center">
            No jobs found.
          </p>
        )}
        {rows.map((job) => (
          <DataRow key={job.id}>
            <span className="w-[22%] text-[13.5px] font-semibold truncate pr-4">
              {job.requestTitle ?? job.requestCareType ?? '—'}
            </span>
            <span className="w-[18%] pr-4">
              <span className="block text-[13px] font-medium truncate">{job.clientName ?? '—'}</span>
              <span className="block text-[11.5px] text-muted-foreground truncate">{job.clientEmail ?? ''}</span>
            </span>
            <span className="w-[18%] text-[13px] text-muted-foreground truncate pr-4">
              {job.caregiverName ?? '—'}
            </span>
            <span className="w-[10%] pr-4">
              <StatusPill status={job.status} />
            </span>
            <span className="w-[12%] text-[12.5px] text-muted-foreground pr-4">
              {formatDate(job.createdAt)}
            </span>
            <span className="w-[20%] text-[12.5px]">
              <Link
                href={`/jobs/${job.id}/shifts`}
                className="text-[var(--forest)] hover:text-[var(--forest-deep)] transition-colors"
              >
                View shifts
              </Link>
            </span>
          </DataRow>
        ))}
      </DataList>
    </div>
  )
}
