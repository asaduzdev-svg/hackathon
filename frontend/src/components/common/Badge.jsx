const TONES = {
  neutral: 'border-transparent bg-surface-muted text-foreground',
  muted: 'border-transparent bg-surface-muted text-muted-foreground',
  primary: 'border-primary/30 bg-primary/15 text-primary-strong',
  success: 'border-success-border bg-success-bg text-success',
  warning: 'border-warning-border bg-warning-bg text-warning',
  danger: 'border-danger-border bg-danger-bg text-danger',
  info: 'border-info-border bg-info-bg text-info',
}

const DOT_COLORS = {
  neutral: 'bg-foreground/40',
  muted: 'bg-muted',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

export default function Badge({ tone = 'neutral', dot = false, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[tone]}`} />}
      {children}
    </span>
  )
}

export function StatusDot({ tone = 'neutral', className = '' }) {
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[tone]} ${className}`} />
}
