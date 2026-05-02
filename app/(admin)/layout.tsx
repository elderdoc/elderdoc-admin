import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar adminName={session.user.name ?? ''} adminEmail={session.user.email ?? ''} />
      <main className="ml-[240px] flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
