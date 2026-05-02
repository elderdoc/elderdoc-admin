import { db } from '@elderdoc/db'
import { disputes, users, payments } from '@elderdoc/db/schema'
import { desc, eq } from 'drizzle-orm'
import { DisputesClient } from './_components/disputes-client'

export default async function DisputesPage() {
  const rows = await db
    .select({
      id:            disputes.id,
      reason:        disputes.reason,
      status:        disputes.status,
      createdAt:     disputes.createdAt,
      resolvedAt:    disputes.resolvedAt,
      clientName:    users.name,
      clientEmail:   users.email,
      paymentAmount: payments.amount,
    })
    .from(disputes)
    .leftJoin(users, eq(disputes.clientId, users.id))
    .leftJoin(payments, eq(disputes.paymentId, payments.id))
    .orderBy(desc(disputes.createdAt))

  const data = rows.map((r) => ({
    ...r,
    clientEmail: r.clientEmail ?? '',
  }))

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Disputes</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{data.length} total disputes</p>
      </div>
      <DisputesClient disputes={data} />
    </div>
  )
}
