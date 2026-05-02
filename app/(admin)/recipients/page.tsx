import { getAllRecipients } from '@/domains/recipients'
import { RecipientsClient } from './_components/recipients-client'

export default async function RecipientsPage() {
  const recipients = await getAllRecipients()
  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Care Recipients</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{recipients.length} profiles</p>
      </div>
      <RecipientsClient recipients={recipients} />
    </div>
  )
}
