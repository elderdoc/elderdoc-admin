import { db } from '@elderdoc/db'
import { shifts, jobs, users, caregiverProfiles } from '@elderdoc/db/schema'
import { desc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { ShiftsClient } from './_components/shifts-client'

export default async function ShiftsPage() {
  const clientUsers = alias(users, 'client_users')
  const caregiverUsers = alias(users, 'caregiver_users')

  const rows = await db
    .select({
      id:            shifts.id,
      date:          shifts.date,
      startTime:     shifts.startTime,
      endTime:       shifts.endTime,
      status:        shifts.status,
      billedAt:      shifts.billedAt,
      createdAt:     shifts.createdAt,
      clientName:    clientUsers.name,
      clientEmail:   clientUsers.email,
      caregiverName: caregiverUsers.name,
    })
    .from(shifts)
    .leftJoin(jobs, eq(shifts.jobId, jobs.id))
    .leftJoin(clientUsers, eq(jobs.clientId, clientUsers.id))
    .leftJoin(caregiverProfiles, eq(jobs.caregiverId, caregiverProfiles.id))
    .leftJoin(caregiverUsers, eq(caregiverProfiles.userId, caregiverUsers.id))
    .orderBy(desc(shifts.createdAt))

  const data = rows.map((r) => ({
    ...r,
    clientEmail: r.clientEmail ?? '',
  }))

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Shifts</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{data.length} total shifts</p>
      </div>
      <ShiftsClient shifts={data} />
    </div>
  )
}
