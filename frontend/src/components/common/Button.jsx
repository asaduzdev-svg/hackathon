import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-surface-muted active:bg-secondary',
  outline:
    'border border-border-strong bg-surface text-foreground hover:bg-surface-hover active:bg-surface-muted',
  ghost: 'text-foreground hover:bg-surface-hover active:bg-surface-muted',
  danger: 'bg-danger text-danger-foreground hover:opacity-90 active:opacity-80 shadow-sm',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
  iconSm: 'h-8 w-8 p-0',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex select-none items-center justify-center rounded-lg font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 16} />
      )}
      {children}
    </button>
  )
}
