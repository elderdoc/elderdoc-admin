'use client'

import { X } from 'lucide-react'

interface EditPanelProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function EditPanel({ open, onClose, title, children, footer }: EditPanelProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative flex flex-col w-full max-w-[440px] h-full bg-card border-l border-border shadow-[-8px_0_24px_-8px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-border bg-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export const inputCls = 'w-full rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-[13.5px] placeholder:text-muted-foreground/50 focus:border-[var(--forest)] focus:outline-none focus:ring-2 focus:ring-[var(--forest-soft)] transition-shadow'
export const labelCls = 'block text-[12px] font-semibold text-muted-foreground mb-1.5'
