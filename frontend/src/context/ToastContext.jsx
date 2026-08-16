import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

let idSeq = 0

const TOAST_META = {
  success: { icon: CheckCircle2, ring: 'text-success', bg: 'bg-success-bg' },
  error: { icon: XCircle, ring: 'text-danger', bg: 'bg-danger-bg' },
  warning: { icon: AlertTriangle, ring: 'text-warning', bg: 'bg-warning-bg' },
  info: { icon: Info, ring: 'text-info', bg: 'bg-info-bg' },
}

function ToastItem({ toast, onDismiss }) {
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
        {toast.message}
      </p>
      <button
        type="button"
        aria-label="Close"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
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
    (type, messageOrKey, varsOrMessage, duration = 3500) => {
      idSeq += 1
      const id = idSeq
      // Support both raw strings and (key, vars) translation calls
      const message =
        typeof messageOrKey === 'string' && varsOrMessage && typeof varsOrMessage === 'object'
          ? { key: messageOrKey, vars: varsOrMessage }
          : String(messageOrKey)
      setToasts((list) => [...list.slice(-3), { id, type, message, vars: typeof message === 'object' ? message.vars : undefined }])
      setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  // Convenience: pass through to translator
  const toast = useMemo(
    () => ({
      success: (msg, vars) => push('success', msg, vars),
      error: (msg, vars) => push('error', msg, vars),
      warning: (msg, vars) => push('warning', msg, vars),
      info: (msg, vars) => push('info', msg, vars),
      raw: (msg, type = 'info') => push(type, msg),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-4 sm:items-end"
        >
          {toasts.map((t) => (
            <ToastRenderer key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

// Wrapper that translates if needed
function ToastRenderer({ toast, onDismiss }) {
  const { t } = useI18nSafe()
  const meta = TOAST_META[toast.type] || TOAST_META.info
  const Icon = meta.icon
  const message = typeof toast.message === 'string' ? toast.message : t?.(toast.message?.key, toast.message?.vars) || ''
  return (
    <div
      role="status"
      className="animate-slide-in-right pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-pop"
    >
      <span className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${meta.bg}`}>
        <Icon size={18} className={meta.ring} />
      </span>
      <p className="min-w-0 flex-1 pt-0.5 text-sm font-medium text-foreground">{message}</p>
      <button
        type="button"
        aria-label="Close"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <X size={15} />
      </button>
    </div>
  )
}

function useI18nSafe() {
  try {
    const { useI18n } = require('../i18n/index.jsx')
    return useI18n()
  } catch {
    return { t: (k) => k }
  }
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
