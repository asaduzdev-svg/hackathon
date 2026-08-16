import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

const TONE = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  muted: 'bg-surface-muted text-muted-foreground',
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconTone = 'muted',
  delta,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-xs ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONE[iconTone] || TONE.muted}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{value}</p>
      {delta && (
        <p
          className={`inline-flex items-center gap-1 text-xs ${
            delta.direction === 'up'
              ? 'text-success'
              : delta.direction === 'down'
              ? 'text-danger'
              : 'text-muted-foreground'
          }`}
        >
          {delta.direction === 'up' ? (
            <ArrowUpRight size={14} />
          ) : delta.direction === 'down' ? (
            <ArrowDownRight size={14} />
          ) : (
            <Minus size={14} />
          )}
          {delta.label}
        </p>
      )}
    </div>
  )
}
