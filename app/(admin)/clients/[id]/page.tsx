import { getClientById } from '@/domains/clients'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-[var(--forest-soft)] text-[var(--forest-deep)]',
  draft:     'bg-muted text-muted-foreground',
  matched:   'bg-blue-50 text-blue-700',
  cancelled: 'bg-destructive/10 text-destructive',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getClientById(id)
  if (!data) notFound()

  return (
    <div className="px-8 py-7 max-w-3xl">
      <Link href="/clients" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Clients
      </Link>

      <div className="mb-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">{data.user.name ?? '—'}</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{data.user.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Care recipients', value: data.recipients.length },
          { label: 'Care requests', value: data.requests.length },
          { label: 'Total paid', value: `$${Number(data.totalPaid).toFixed(2)}` },
        ].map((tile) => (
          <div key={tile.label} className="rounded-[14px] border border-border bg-card px-5 py-4">
            <p className="text-[28px] font-black tabular-nums leading-none">{tile.value}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">{tile.label}</p>
          </div>
        ))}
      </div>

      {data.recipients.length > 0 && (
        <div className="rounded-[14px] border border-border bg-card mb-4">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[13px] font-semibold">Care Recipients</h2>
          </div>
          {data.recipients.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-b-0">
              <div>
                <p className="text-[13.5px] font-semibold">{r.name}</p>
                <p className="text-[12px] text-muted-foreground capitalize">{r.relationship ?? '—'}</p>
              </div>
              <p className="text-[12px] text-muted-foreground capitalize">{r.mobilityLevel?.replace(/-/g, ' ') ?? '—'}</p>
            </div>
          ))}
        </div>
      )}

      {data.requests.length > 0 && (
        <div className="rounded-[14px] border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[13px] font-semibold">Care Requests</h2>
          </div>
          {data.requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-b-0">
              <div>
                <p className="text-[13.5px] font-semibold">{req.title ?? req.careType}</p>
                <p className="text-[12px] text-muted-foreground capitalize">{req.careType} · {req.frequency ?? 'No frequency'}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-medium capitalize ${STATUS_BADGE[req.status ?? 'draft'] ?? STATUS_BADGE.draft}`}>
                {req.status ?? 'draft'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
