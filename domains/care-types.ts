'use server'

import { revalidatePath } from 'next/cache'
import { eq, asc } from 'drizzle-orm'
import { db } from '@elderdoc/db'
import { careTypes } from '@elderdoc/db/schema'

export type AdminCareType = {
  id: string
  key: string
  label: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const KEY_RE = /^[a-z][a-z0-9-]*$/
const MAX_KEY_LEN = 64
const MAX_LABEL_LEN = 80

async function notifyAppCacheBust() {
  const url = process.env.APP_URL
  const secret = process.env.INTERNAL_REVALIDATE_SECRET
  if (!url || !secret) {
    console.warn('[care-types] APP_URL or INTERNAL_REVALIDATE_SECRET unset; app will lag on cache TTL')
    return
  }
  try {
    await fetch(`${url}/api/internal/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ tag: 'care-types' }),
    })
  } catch (e) {
    console.error('[care-types] revalidation webhook failed', e)
  }
}

export async function listCareTypes(): Promise<AdminCareType[]> {
  return db.select().from(careTypes).orderBy(asc(careTypes.createdAt))
}

export async function getCareTypesMap(): Promise<Record<string, string>> {
  const rows = await db.select().from(careTypes)
  return Object.fromEntries(rows.map((r) => [r.key, r.label]))
}

export async function createCareType(input: { key: string; label: string }):
  Promise<{ success: true; row: AdminCareType } | { success: false; error: string }> {
  const key = input.key.trim().toLowerCase()
  const label = input.label.trim()
  if (!key || key.length > MAX_KEY_LEN) return { success: false, error: 'Key must be 1–64 characters.' }
  if (!KEY_RE.test(key)) return { success: false, error: 'Key must be kebab-case (lowercase letters, digits, hyphens).' }
  if (!label || label.length > MAX_LABEL_LEN) return { success: false, error: 'Label must be 1–80 characters.' }

  const existing = await db.select({ id: careTypes.id }).from(careTypes).where(eq(careTypes.key, key)).limit(1)
  if (existing.length > 0) return { success: false, error: `Key "${key}" already exists.` }

  const [row] = await db.insert(careTypes).values({ key, label }).returning()
  revalidatePath('/care-types')
  await notifyAppCacheBust()
  return { success: true, row }
}

export async function updateCareTypeLabel(id: string, label: string):
  Promise<{ success: true; row: AdminCareType } | { success: false; error: string }> {
  const trimmed = label.trim()
  if (!trimmed || trimmed.length > MAX_LABEL_LEN) return { success: false, error: 'Label must be 1–80 characters.' }
  const [row] = await db.update(careTypes)
    .set({ label: trimmed, updatedAt: new Date() })
    .where(eq(careTypes.id, id))
    .returning()
  if (!row) return { success: false, error: 'Care type not found.' }
  revalidatePath('/care-types')
  await notifyAppCacheBust()
  return { success: true, row }
}

export async function setCareTypeActive(id: string, isActive: boolean):
  Promise<{ success: true; row: AdminCareType } | { success: false; error: string }> {
  const [row] = await db.update(careTypes)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(careTypes.id, id))
    .returning()
  if (!row) return { success: false, error: 'Care type not found.' }
  revalidatePath('/care-types')
  await notifyAppCacheBust()
  return { success: true, row }
}
