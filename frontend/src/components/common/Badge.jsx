// Badge — soft, semantic pill that reads well in light + dark.
const TONE = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success-bg text-success border border-success-border',
  warning: 'bg-warning-bg text-warning border border-warning-border',
  danger: 'bg-danger-bg text-danger border border-danger-border',
  info: 'bg-info-bg text-info border border-info-border',
  muted: 'bg-surface-muted text-muted-foreground',
}

export default function Badge({
  tone = 'muted',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...props
}) {
  const sizes = {
    xs: 'text-[10px] px-1.5 h-5',
    sm: 'text-[11px] px-2 h-5.5 leading-5 py-0',
    md: 'text-xs px-2.5 h-6',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${TONE[tone] || TONE.muted} ${sizes[size] || sizes.sm} ${className}`}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}
