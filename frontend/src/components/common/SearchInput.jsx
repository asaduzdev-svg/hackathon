import { Search, X } from 'lucide-react'

export default function SearchInput({
  value,
  onChange,
  placeholder,
  className = '',
  autoFocus = false,
}) {
  return (
    <div
      className={`relative flex items-center rounded-lg border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${className}`}
    >
      <Search size={16} className="pointer-events-none absolute left-3 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-w-0 flex-1 bg-transparent py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear"
          className="absolute right-2 rounded-md p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
