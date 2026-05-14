import { db } from '@/services/db'
import { careRequests, users, careRecipients } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { CareRequestsClient } from './_components/care-requests-client'
import { getCareTypesMap } from '@/domains/care-types'

export default async function CareRequestsPage() {
  const careTypeLabels = await getCareTypesMap()
  const rows = await db
    .select({
      id:            careRequests.id,
      title:         careRequests.title,
      careType:      careRequests.careType,
      status:        careRequests.status,
      budgetMin:     careRequests.budgetMin,
      budgetMax:     careRequests.budgetMax,
      createdAt:     careRequests.createdAt,
      clientName:    users.name,
      clientEmail:   users.email,
      recipientName: careRecipients.name,
    })
    .from(careRequests)
    .leftJoin(users, eq(careRequests.clientId, users.id))
    .leftJoin(careRecipients, eq(careRequests.recipientId, careRecipients.id))
    .orderBy(desc(careRequests.createdAt))

  const data = rows.map((r) => ({
    ...r,
    clientEmail: r.clientEmail ?? '',
  }))

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Care Requests</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{data.length} total requests</p>
      </div>
      <CareRequestsClient careRequests={data} careTypeLabels={careTypeLabels} />
    </div>
  )
}
