'use client'

interface DataHeaderProps {
  columns: { label: string; width: string }[]
}

export function DataHeader({ columns }: DataHeaderProps) {
  return (
    <div className="flex items-center px-4 py-2.5 border-b border-border bg-muted/30">
      {columns.map((col) => (
        <span key={col.label} className={`${col.width} text-[11px] font-semibold text-muted-foreground uppercase tracking-wider`}>
          {col.label}
        </span>
      ))}
    </div>
  )
}

interface DataRowProps {
  children: React.ReactNode
  onClick?: () => void
}

export function DataRow({ children, onClick }: DataRowProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'group flex items-center px-4 min-h-[48px] border-b border-border',
        'hover:border-l-2 hover:border-l-[var(--forest)] hover:bg-[var(--forest-soft)]/20 transition-all',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

interface DataListProps {
  children: React.ReactNode
}

export function DataList({ children }: DataListProps) {
  return (
    <div className="rounded-[14px] border border-border bg-card overflow-hidden">
      {children}
    </div>
  )
}
