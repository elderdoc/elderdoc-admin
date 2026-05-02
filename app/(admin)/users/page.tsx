import { getAllUsers } from '@/domains/users'
import { UsersClient } from './_components/users-client'

export default async function UsersPage() {
  const users = await getAllUsers()

  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Users</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{users.length} total accounts</p>
      </div>
      <UsersClient users={users} />
    </div>
  )
}
