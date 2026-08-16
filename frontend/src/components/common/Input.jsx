import { useId } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  id,
  required,
  className = '',
  ...props
}) {
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
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={!!error}
          className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:outline-2 focus:outline-ring/60 ${
            error ? 'border-danger' : 'border-border'
          } ${Icon ? 'pl-9' : ''}`}
          {...props}
        />
      </div>
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
