import { forwardRef, useId } from 'react'

const Textarea = forwardRef(function Textarea(
  { label, hint, error, className = '', rows = 3, ...props },
  ref,
) {
  const reactId = useId()
  const id = props.id || `ta-${reactId}`

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={!!error}
        className={`block w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-primary/15'
        }`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
})

export default Textarea
