import { getAllClients } from '@/domains/clients'
import { ClientsClient } from './_components/clients-client'

export default async function ClientsPage() {
  const clients = await getAllClients()
  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Clients</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{clients.length} accounts</p>
      </div>
      <ClientsClient clients={clients} />
    </div>
  )
}
