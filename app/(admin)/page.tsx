import { db } from '@/services/db'
import {
  users, caregiverProfiles, careRequests, jobs, payments, disputes, notifications,
} from '@/db/schema'
import { eq, count, sum, desc } from 'drizzle-orm'
import { formatDistanceToNow } from 'date-fns'

async function getStats() {
  const [
    totalUsers,
    activeCaregivers,
    openRequests,
    activeJobs,
    feesCollected,
    openDisputes,
  ] = await Promise.all([
    db.select({ cnt: count() }).from(users).then((r) => Number(r[0].cnt)),
    db.select({ cnt: count() }).from(caregiverProfiles).where(eq(caregiverProfiles.status, 'active')).then((r) => Number(r[0].cnt)),
    db.select({ cnt: count() }).from(careRequests).where(eq(careRequests.status, 'active')).then((r) => Number(r[0].cnt)),
    db.select({ cnt: count() }).from(jobs).where(eq(jobs.status, 'active')).then((r) => Number(r[0].cnt)),
    db.select({ total: sum(payments.fee) }).from(payments).where(eq(payments.status, 'completed')).then((r) => Number(r[0].total ?? 0)),
    db.select({ cnt: count() }).from(disputes).where(eq(disputes.status, 'open')).then((r) => Number(r[0].cnt)),
  ])
  return { totalUsers, activeCaregivers, openRequests, activeJobs, feesCollected, openDisputes }
}

async function getRecentActivity() {
  return db
    .select({ id: notifications.id, type: notifications.type, payload: notifications.payload, createdAt: notifications.createdAt })
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(20)
}

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-card px-5 py-4">
      <p className="text-[32px] font-black tabular-nums leading-none">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted-foreground font-medium">{label}</p>
      {sub && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default async function OverviewPage() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()])

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Overview</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">Platform summary</p>
      </div>

      <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <StatTile label="Total users" value={stats.totalUsers} />
        <StatTile label="Active caregivers" value={stats.activeCaregivers} />
        <StatTile label="Open care requests" value={stats.openRequests} />
        <StatTile label="Active jobs" value={stats.activeJobs} />
        <StatTile label="Platform fees collected" value={`$${stats.feesCollected.toFixed(2)}`} />
        <StatTile label="Open disputes" value={stats.openDisputes} />
      </div>

      <div>
        <h2 className="text-[14px] font-semibold mb-3">Recent activity</h2>
        <div className="rounded-[14px] border border-border bg-card divide-y divide-border">
          {activity.length === 0 && (
            <p className="px-5 py-8 text-[13.5px] text-muted-foreground text-center">No activity yet.</p>
          )}
          {activity.map((n) => {
            const payload = n.payload as Record<string, unknown>
            const description = String(payload.message ?? payload.description ?? n.type)
            return (
              <div key={n.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-[13px]">{description}</p>
                <p className="text-[12px] text-muted-foreground shrink-0 ml-4">
                  {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
