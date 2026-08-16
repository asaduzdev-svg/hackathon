import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ open, onClose, title, description, children, footer, size = 'md', hideClose = false }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        className={`animate-scale-in relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-border bg-surface shadow-pop outline-none sm:rounded-2xl ${SIZES[size]}`}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
            </div>
            {!hideClose && (
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-3.5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
