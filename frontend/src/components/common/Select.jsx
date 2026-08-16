import { useId } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

export default function Select({ label, error, hint, options = [], placeholder, id, required, className = '', children, ...props }) {
  const autoId = useId()
  const selectId = id || autoId
  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={!!error}
          className={`h-10 w-full appearance-none rounded-lg border bg-surface px-3 pr-9 text-sm text-foreground transition-colors focus:border-primary focus:outline-2 focus:outline-ring/60 ${
            error ? 'border-danger' : 'border-border'
          }`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
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
