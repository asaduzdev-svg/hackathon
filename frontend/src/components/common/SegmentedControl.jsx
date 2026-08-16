export default function SegmentedControl({ value, onChange, options, className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
