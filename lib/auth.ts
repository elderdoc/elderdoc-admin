import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@elderdoc/db'
import { users } from '@elderdoc/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
        if (!user?.password) return null
        if (user.role !== 'admin') return null
        if (user.suspendedAt !== null) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name ?? '' }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string
        token.role = 'admin'
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.userId as string
      session.user.role = 'admin'
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
