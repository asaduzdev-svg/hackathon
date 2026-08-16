import { forwardRef, useId } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    leftIcon: LeftIcon,
    rightSlot,
    className = '',
    inputClassName = '',
    type = 'text',
    id,
    showPasswordToggle = false,
    ...props
  },
  ref,
) {
  const reactId = useId()
  const inputId = id || `inp-${reactId}`
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const effectiveType = isPassword && showPasswordToggle && revealed ? 'text' : type

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-foreground">
          {label}
        </label>
      )}
      <div
        className={`group relative flex items-center rounded-lg border bg-surface transition-all duration-150 ${
          error
            ? 'border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20'
            : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 focus-within:shadow-sm hover:border-border-strong'
        }`}
      >
        {LeftIcon && (
          <span className="pointer-events-none absolute left-3 flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors group-focus-within:text-primary">
            <LeftIcon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`min-w-0 flex-1 cursor-text bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${
            LeftIcon ? 'pl-9' : ''
          } ${rightSlot || (isPassword && showPasswordToggle) ? 'pr-9' : ''} ${inputClassName}`}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setRevealed((r) => !r)}
            className="absolute right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {rightSlot && !isPassword && (
          <span className="absolute right-1.5 flex items-center">{rightSlot}</span>
        )}
        {error && !LeftIcon && !isPassword && (
          <span className="pointer-events-none absolute right-3 flex h-5 w-5 items-center justify-center text-danger">
            <AlertCircle size={14} />
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="mt-1 flex items-center gap-1 text-xs text-danger">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default Input
