'use server'

import { db } from '@/services/db'
import { users, careRecipients, careRequests, jobs, payments } from '@/db/schema'
import { eq, count, sum, desc, and } from 'drizzle-orm'

export type AdminClient = {
  id: string
  name: string | null
  email: string
  suspendedAt: Date | null
  createdAt: Date
  recipientCount: number
  activeRequestCount: number
  activeJobCount: number
}

export async function getAllClients(): Promise<AdminClient[]> {
  const clients = await db
    .select({
      id:          users.id,
      name:        users.name,
      email:       users.email,
      suspendedAt: users.suspendedAt,
      createdAt:   users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'client'))
    .orderBy(desc(users.createdAt))

  const [recipients, activeReqs, activeJobs] = await Promise.all([
    db.select({ clientId: careRecipients.clientId, cnt: count() })
      .from(careRecipients).groupBy(careRecipients.clientId),
    db.select({ clientId: careRequests.clientId, cnt: count() })
      .from(careRequests).where(eq(careRequests.status, 'active')).groupBy(careRequests.clientId),
    db.select({ clientId: jobs.clientId, cnt: count() })
      .from(jobs).where(eq(jobs.status, 'active')).groupBy(jobs.clientId),
  ])

  const recMap = Object.fromEntries(recipients.map((r) => [r.clientId, Number(r.cnt)]))
  const reqMap = Object.fromEntries(activeReqs.map((r) => [r.clientId, Number(r.cnt)]))
  const jobMap = Object.fromEntries(activeJobs.map((r) => [r.clientId, Number(r.cnt)]))

  return clients.map((c) => ({
    ...c,
    recipientCount:     recMap[c.id] ?? 0,
    activeRequestCount: reqMap[c.id] ?? 0,
    activeJobCount:     jobMap[c.id] ?? 0,
  }))
}

export async function getClientById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) return null

  const [recs, reqs] = await Promise.all([
    db.select().from(careRecipients).where(eq(careRecipients.clientId, id)),
    db.select().from(careRequests).where(eq(careRequests.clientId, id)).orderBy(desc(careRequests.createdAt)),
  ])

  const totalPaid = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .innerJoin(jobs, eq(jobs.id, payments.jobId))
    .where(and(eq(jobs.clientId, id), eq(payments.status, 'completed')))

  return {
    user,
    recipients: recs,
    requests: reqs,
    totalPaid: totalPaid[0]?.total ?? '0',
  }
}

export type AdminClientDetail = NonNullable<Awaited<ReturnType<typeof getClientById>>>

export async function suspendClientUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(users).set({ suspendedAt: new Date() }).where(eq(users.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to suspend client.' }
  }
}

export async function deleteClientUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(users).where(eq(users.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete client.' }
  }
}
