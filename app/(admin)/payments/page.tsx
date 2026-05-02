import { db } from '@elderdoc/db'
import { payments, jobs, users, caregiverProfiles } from '@elderdoc/db/schema'
import { desc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { PaymentsClient } from './_components/payments-client'

export default async function PaymentsPage() {
  const clientUsers = alias(users, 'client_users')
  const caregiverUsers = alias(users, 'caregiver_users')

  const rows = await db
    .select({
      id:            payments.id,
      amount:        payments.amount,
      fee:           payments.fee,
      method:        payments.method,
      status:        payments.status,
      releasedAt:    payments.releasedAt,
      createdAt:     payments.createdAt,
      clientName:    clientUsers.name,
      clientEmail:   clientUsers.email,
      caregiverName: caregiverUsers.name,
    })
    .from(payments)
    .leftJoin(jobs, eq(payments.jobId, jobs.id))
    .leftJoin(clientUsers, eq(jobs.clientId, clientUsers.id))
    .leftJoin(caregiverProfiles, eq(jobs.caregiverId, caregiverProfiles.id))
    .leftJoin(caregiverUsers, eq(caregiverProfiles.userId, caregiverUsers.id))
    .orderBy(desc(payments.createdAt))

  const data = rows.map((r) => ({
    ...r,
    clientEmail: r.clientEmail ?? '',
  }))

  const completed = data.filter((p) => p.status === 'completed')
  const pending   = data.filter((p) => p.status === 'pending')

  const totalCollected = completed.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalFees      = completed.reduce((sum, p) => sum + Number(p.fee), 0)
  const pendingAmount  = pending.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Payments</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{data.length} total payments</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="rounded-[14px] border border-border bg-card px-5 py-4">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Collected</p>
          <p className="text-[22px] font-semibold tracking-[-0.02em]">${totalCollected.toFixed(2)}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-card px-5 py-4">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Fees</p>
          <p className="text-[22px] font-semibold tracking-[-0.02em]">${totalFees.toFixed(2)}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-card px-5 py-4">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending</p>
          <p className="text-[22px] font-semibold tracking-[-0.02em]">${pendingAmount.toFixed(2)}</p>
        </div>
      </div>

      <PaymentsClient payments={data} />
    </div>
  )
}
