import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md',
  accent:
    'bg-accent text-accent-foreground hover:opacity-95 active:opacity-90 shadow-sm hover:shadow-md',
  secondary:
    'bg-secondary text-secondary-foreground hover:opacity-95 active:opacity-90',
  outline:
    'border border-border-strong bg-surface text-foreground hover:bg-surface-muted hover:border-primary/50',
  ghost:
    'text-foreground hover:bg-surface-muted active:bg-surface-hover',
  danger:
    'bg-danger text-danger-foreground hover:opacity-95 active:opacity-90 shadow-sm hover:shadow-md',
  soft: 'bg-primary/10 text-primary-strong hover:bg-primary/15 active:bg-primary/20',
}

const SIZES = {
  xs: 'h-8 px-2.5 text-xs gap-1.5',
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const cls = [
    'inline-flex items-center justify-center rounded-lg font-medium',
    'cursor-pointer select-none whitespace-nowrap',
    'transition-all duration-150 ease-out',
    'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} disabled={disabled || loading} className={cls} {...props}>
      {loading ? (
        <Loader2 size={size === 'lg' ? 18 : 16} className="shrink-0 animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'lg' ? 18 : 16} className="shrink-0" />
      ) : null}
      {children && <span className="truncate">{children}</span>}
      {IconRight && !loading && <IconRight size={size === 'lg' ? 18 : 16} className="shrink-0" />}
    </button>
  )
}
