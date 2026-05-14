'use server'

import { db } from '@/services/db'
import { careRecipients, users } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export type AdminRecipient = {
  id: string
  name: string
  relationship: string | null
  dob: string | null
  phone: string | null
  gender: string | null
  conditions: string[] | null
  mobilityLevel: string | null
  notes: string | null
  createdAt: Date
  clientId: string
  clientName: string | null
  clientEmail: string
}

export async function getAllRecipients(): Promise<AdminRecipient[]> {
  const rows = await db
    .select({
      id:           careRecipients.id,
      name:         careRecipients.name,
      relationship: careRecipients.relationship,
      dob:          careRecipients.dob,
      phone:        careRecipients.phone,
      gender:       careRecipients.gender,
      conditions:   careRecipients.conditions,
      mobilityLevel: careRecipients.mobilityLevel,
      notes:        careRecipients.notes,
      createdAt:    careRecipients.createdAt,
      clientId:     users.id,
      clientName:   users.name,
      clientEmail:  users.email,
    })
    .from(careRecipients)
    .innerJoin(users, eq(users.id, careRecipients.clientId))
    .orderBy(desc(careRecipients.createdAt))

  return rows.map((r) => ({
    ...r,
    conditions: r.conditions as string[] | null,
  }))
}

export async function updateRecipient(
  id: string,
  data: {
    name?: string
    dob?: string
    phone?: string
    gender?: string
    relationship?: string
    conditions?: string[]
    mobilityLevel?: string
    notes?: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(careRecipients).set(data).where(eq(careRecipients.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update recipient.' }
  }
}

export async function deleteRecipient(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(careRecipients).where(eq(careRecipients.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete recipient.' }
  }
}
