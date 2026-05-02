'use client'

interface StatusFilterProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

export function StatusFilter({ options, value, onChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            'rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors',
            value === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
