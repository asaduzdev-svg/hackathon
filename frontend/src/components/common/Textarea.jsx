import { useId } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Textarea({ label, error, hint, id, required, className = '', rows = 3, ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:outline-2 focus:outline-ring/60 ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...props}
      />
      {error ? (
        <p className="flex items-center gap-1 text-xs text-danger">
          <AlertCircle size={13} />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
