'use server'

import { db } from '@elderdoc/db'
import { users } from '@elderdoc/db/schema'
import { eq, desc } from 'drizzle-orm'

export type AdminUser = {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string | null
  suspendedAt: Date | null
  createdAt: Date
}

export async function getAllUsers(): Promise<AdminUser[]> {
  return db.select({
    id:          users.id,
    name:        users.name,
    email:       users.email,
    phone:       users.phone,
    role:        users.role,
    suspendedAt: users.suspendedAt,
    createdAt:   users.createdAt,
  }).from(users).orderBy(desc(users.createdAt))
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; phone?: string; role?: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const { name, email, phone, role } = data
    await db.update(users).set({
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(role !== undefined ? { role: role as 'client' | 'caregiver' | 'admin' } : {}),
    }).where(eq(users.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update user.' }
  }
}

export async function suspendUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(users).set({ suspendedAt: new Date() }).where(eq(users.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to suspend user.' }
  }
}

export async function unsuspendUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(users).set({ suspendedAt: null }).where(eq(users.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to restore user.' }
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(users).where(eq(users.id, id))
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete user.' }
  }
}
