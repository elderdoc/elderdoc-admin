'use client'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  title: string
  body: string
  actionLabel: string
  onConfirm: () => void
  isPending?: boolean
  variant?: 'destructive' | 'warning' | 'safe'
}

export function ConfirmModal({
  open, onClose, title, body, actionLabel, onConfirm, isPending, variant = 'destructive',
}: ConfirmModalProps) {
  if (!open) return null

  const btnCls =
    variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' :
    variant === 'warning'     ? 'bg-amber-600 text-white hover:bg-amber-700' :
    'bg-primary text-primary-foreground hover:bg-[var(--forest-deep)]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[420px] rounded-2xl bg-card shadow-[var(--shadow-modal)] p-6">
        <h2 className="text-[16px] font-semibold mb-2">{title}</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{body}</p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-10 rounded-full border border-border text-[13.5px] font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 h-10 rounded-full text-[13.5px] font-semibold disabled:opacity-50 transition-colors ${btnCls}`}
          >
            {isPending ? 'Please wait…' : actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
