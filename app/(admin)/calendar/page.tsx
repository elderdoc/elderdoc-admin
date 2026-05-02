import { db } from '@elderdoc/db'
import { shifts, jobs, users, caregiverProfiles } from '@elderdoc/db/schema'
import { asc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

export default async function CalendarPage() {
  const clientUsers = alias(users, 'client_users')
  const caregiverUsers = alias(users, 'caregiver_users')

  const rows = await db
    .select({
      id:            shifts.id,
      date:          shifts.date,
      startTime:     shifts.startTime,
      endTime:       shifts.endTime,
      status:        shifts.status,
      clientName:    clientUsers.name,
      caregiverName: caregiverUsers.name,
    })
    .from(shifts)
    .leftJoin(jobs, eq(shifts.jobId, jobs.id))
    .leftJoin(clientUsers, eq(jobs.clientId, clientUsers.id))
    .leftJoin(caregiverProfiles, eq(jobs.caregiverId, caregiverProfiles.id))
    .leftJoin(caregiverUsers, eq(caregiverProfiles.userId, caregiverUsers.id))
    .orderBy(asc(shifts.date), asc(shifts.startTime))

  // Group shifts by date
  const grouped: Record<string, typeof rows> = {}
  for (const shift of rows) {
    if (!grouped[shift.date]) grouped[shift.date] = []
    grouped[shift.date].push(shift)
  }

  const dates = Object.keys(grouped).sort()

  function formatDateHeading(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Calendar</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{rows.length} scheduled shifts</p>
      </div>

      {dates.length === 0 && (
        <p className="text-[13.5px] text-muted-foreground">No scheduled shifts.</p>
      )}

      <div className="space-y-8">
        {dates.map((date) => (
          <div key={date}>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-3 text-foreground/80">
              {formatDateHeading(date)}
            </h2>
            <div className="rounded-[14px] border border-border bg-card overflow-hidden divide-y divide-border">
              {grouped[date].map((shift) => (
                <div key={shift.id} className="flex items-center px-5 py-3 gap-4 hover:bg-[var(--forest-soft)]/20 transition-colors">
                  <span className="text-[13px] font-medium text-foreground/70 w-36 shrink-0">
                    {shift.startTime} – {shift.endTime}
                  </span>
                  <span className="text-[13px] font-medium truncate flex-1">
                    {shift.clientName ?? '—'}
                  </span>
                  <span className="text-[12.5px] text-muted-foreground truncate flex-1">
                    {shift.caregiverName ?? '—'}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                    {shift.status ?? 'scheduled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
