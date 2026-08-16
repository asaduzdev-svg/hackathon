import { Search, X } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder, className = '', 'aria-label': ariaLabel }) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-9 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:outline-2 focus:outline-ring/60 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear"
          onClick={() => onChange?.('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
