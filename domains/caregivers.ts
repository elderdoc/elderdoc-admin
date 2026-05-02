'use server'

import { db } from '@elderdoc/db'
import {
  users, caregiverProfiles, caregiverCareTypes, caregiverCertifications,
  caregiverLanguages, caregiverLocations, caregiverWorkPrefs,
} from '@elderdoc/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'

export type AdminCaregiver = {
  id: string
  userId: string
  name: string | null
  email: string
  status: string | null
  suspendedAt: Date | null
  hourlyMin: string | null
  hourlyMax: string | null
  city: string | null
  state: string | null
  createdAt: Date
  careTypes: string[]
  certifications: string[]
}

export async function getAllCaregivers(): Promise<AdminCaregiver[]> {
  const profiles = await db
    .select({
      id:          caregiverProfiles.id,
      userId:      caregiverProfiles.userId,
      name:        users.name,
      email:       users.email,
      status:      caregiverProfiles.status,
      suspendedAt: users.suspendedAt,
      hourlyMin:   caregiverProfiles.hourlyMin,
      hourlyMax:   caregiverProfiles.hourlyMax,
      city:        caregiverLocations.city,
      state:       caregiverLocations.state,
      createdAt:   caregiverProfiles.createdAt,
    })
    .from(caregiverProfiles)
    .innerJoin(users, eq(users.id, caregiverProfiles.userId))
    .leftJoin(caregiverLocations, eq(caregiverLocations.caregiverId, caregiverProfiles.id))
    .orderBy(desc(caregiverProfiles.createdAt))

  const profileIds = profiles.map((p) => p.id)
  if (profileIds.length === 0) return []

  const [careTypes, certs] = await Promise.all([
    db.select().from(caregiverCareTypes).where(inArray(caregiverCareTypes.caregiverId, profileIds)),
    db.select().from(caregiverCertifications).where(inArray(caregiverCertifications.caregiverId, profileIds)),
  ])

  return profiles.map((p) => ({
    ...p,
    status: p.status as string | null,
    careTypes: careTypes.filter((ct) => ct.caregiverId === p.id).map((ct) => ct.careType),
    certifications: certs.filter((c) => c.caregiverId === p.id).map((c) => c.certification),
  }))
}

export async function getCaregiverById(id: string) {
  const [profile] = await db
    .select()
    .from(caregiverProfiles)
    .innerJoin(users, eq(users.id, caregiverProfiles.userId))
    .leftJoin(caregiverLocations, eq(caregiverLocations.caregiverId, caregiverProfiles.id))
    .leftJoin(caregiverWorkPrefs, eq(caregiverWorkPrefs.caregiverId, caregiverProfiles.id))
    .where(eq(caregiverProfiles.id, id))
    .limit(1)

  if (!profile) return null

  const [careTypes, certs, languages] = await Promise.all([
    db.select().from(caregiverCareTypes).where(eq(caregiverCareTypes.caregiverId, id)),
    db.select().from(caregiverCertifications).where(eq(caregiverCertifications.caregiverId, id)),
    db.select().from(caregiverLanguages).where(eq(caregiverLanguages.caregiverId, id)),
  ])

  return { ...profile, careTypes, certifications: certs, languages }
}

export type AdminCaregiverDetail = NonNullable<Awaited<ReturnType<typeof getCaregiverById>>>

export async function approveCaregiver(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(caregiverProfiles).set({ status: 'active' }).where(eq(caregiverProfiles.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to approve caregiver.' }
  }
}

export async function suspendCaregiverUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(users).set({ suspendedAt: new Date() }).where(eq(users.id, userId))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to suspend caregiver.' }
  }
}

export async function deleteCaregiverUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(users).where(eq(users.id, userId))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete caregiver.' }
  }
}
