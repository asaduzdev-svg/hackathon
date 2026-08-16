import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in"
        onClick={() => closeOnBackdrop && onClose?.()}
      />
      <div
        className={`relative z-10 w-full ${sizes[size] || sizes.md} animate-slide-up rounded-t-2xl border border-border bg-surface shadow-pop sm:rounded-2xl`}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
              {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 safe-bottom">{children}</div>
        {footer && <div className="border-t border-border px-5 py-3 safe-bottom">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
