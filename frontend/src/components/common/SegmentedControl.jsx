export default function SegmentedControl({ options, value, onChange, size = 'md', className = '' }) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(opt.value)}
            className={`rounded-md font-medium transition-colors duration-150 ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
            } ${
              active
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
