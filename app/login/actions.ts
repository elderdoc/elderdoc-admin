'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
  try {
    await signIn('credentials', { email, password, redirectTo: '/' })
    return {}
  } catch (err) {
    if (err instanceof AuthError) return { error: 'Invalid email or password.' }
    throw err
  }
}
