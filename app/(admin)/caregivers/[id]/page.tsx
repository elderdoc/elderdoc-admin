import { getCaregiverById, type AdminCaregiverDetail } from '@/domains/caregivers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[13.5px]">{value ?? '—'}</p>
    </div>
  )
}

export default async function CaregiverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data: AdminCaregiverDetail | null = await getCaregiverById(id)
  if (!data) notFound()

  const profile = data.caregiver_profiles
  const user = data.users
  const loc = data.caregiver_locations

  return (
    <div className="px-8 py-7 max-w-3xl">
      <Link href="/caregivers" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Caregivers
      </Link>

      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">{user?.name ?? '—'}</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{user?.email}</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-[14px] border border-border bg-card p-6">
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Profile</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Status" value={profile?.status} />
            <Field label="Rate" value={profile?.hourlyMin ? `$${Number(profile.hourlyMin).toFixed(0)}–$${Number(profile.hourlyMax ?? profile.hourlyMin).toFixed(0)}/hr` : null} />
            <Field label="Headline" value={profile?.headline} />
            <Field label="Experience" value={profile?.experience} />
            <Field label="Location" value={[loc?.city, loc?.state].filter(Boolean).join(', ') || null} />
            <Field label="Phone" value={user?.phone} />
          </div>
        </div>

        {data.careTypes.length > 0 && (
          <div className="rounded-[14px] border border-border bg-card p-6">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Care Types</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.careTypes.map((ct) => (
                <span key={ct.careType} className="rounded-full bg-[var(--forest-soft)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--forest-deep)]">{ct.careType}</span>
              ))}
            </div>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rounded-[14px] border border-border bg-card p-6">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Certifications</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.certifications.map((c) => (
                <span key={c.certification} className="rounded-full border border-border px-2.5 py-0.5 text-[12px] font-medium">{c.certification}</span>
              ))}
            </div>
          </div>
        )}

        {profile?.about && (
          <div className="rounded-[14px] border border-border bg-card p-6">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h2>
            <p className="text-[13.5px] leading-relaxed">{profile.about}</p>
          </div>
        )}
      </div>
    </div>
  )
}
