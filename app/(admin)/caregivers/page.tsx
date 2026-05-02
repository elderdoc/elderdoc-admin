import { getAllCaregivers } from '@/domains/caregivers'
import { CaregiversClient } from './_components/caregivers-client'

export default async function CaregiversPage() {
  const caregivers = await getAllCaregivers()
  return (
    <div className="px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Caregivers</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{caregivers.length} profiles</p>
      </div>
      <CaregiversClient caregivers={caregivers} />
    </div>
  )
}
