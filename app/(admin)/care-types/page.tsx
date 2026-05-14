import { listCareTypes } from '@/domains/care-types'
import { CareTypesClient } from './_components/care-types-client'

export default async function CareTypesPage() {
  const rows = await listCareTypes()
  return (
    <div className="px-8 py-7">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-semibold">Care Types</h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Manage the care types available to clients and caregivers.
          </p>
        </div>
      </div>
      <CareTypesClient rows={rows} />
    </div>
  )
}
