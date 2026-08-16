import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react'
import { useI18n } from '../i18n/index.jsx'

const ToastContext = createContext(null)

let idSeq = 0

const TOAST_META = {
  success: { icon: CheckCircle2, ring: 'text-success', bg: 'bg-success-bg' },
  error: { icon: XCircle, ring: 'text-danger', bg: 'bg-danger-bg' },
  warning: { icon: AlertTriangle, ring: 'text-warning', bg: 'bg-warning-bg' },
  info: { icon: Info, ring: 'text-info', bg: 'bg-info-bg' },
}

function ToastItem({ toast, onDismiss }) {
  const { t } = useI18n()
  const meta = TOAST_META[toast.type] || TOAST_META.info
  const Icon = meta.icon
  return (
    <div
      role="status"
      className="animate-slide-in-right pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-pop"
    >
      <span className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${meta.bg}`}>
        <Icon size={18} className={meta.ring} />
      </span>
      <p className="min-w-0 flex-1 pt-0.5 text-sm font-medium text-foreground">
        {t(toast.key, toast.vars)}
      </p>
      <button
        type="button"
        aria-label="Close"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <X size={15} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, key, vars, duration = 3200) => {
      idSeq += 1
      const id = idSeq
      setToasts((list) => [...list.slice(-3), { id, type, key, vars }])
      setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (key, vars) => push('success', key, vars),
      error: (key, vars) => push('error', key, vars),
      warning: (key, vars) => push('warning', key, vars),
      info: (key, vars) => push('info', key, vars),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
