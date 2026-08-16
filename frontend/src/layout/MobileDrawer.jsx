import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Sidebar from './Sidebar.jsx'

export default function MobileDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[85] lg:hidden">
      <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={onClose} aria-hidden="true" />
      <div className="animate-slide-in-left absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-pop">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar onNavigate={onClose} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
