import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

const ICON_TONES = {
  primary: 'bg-primary/15 text-primary-strong',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-surface-muted text-muted-foreground',
}

export default function StatCard({ label, value, icon: Icon, delta, iconTone = 'neutral' }) {
  const DeltaIcon = delta?.direction === 'up' ? ArrowUpRight : delta?.direction === 'down' ? ArrowDownRight : Minus
  const deltaColor =
    delta?.direction === 'up'
      ? 'text-success'
      : delta?.direction === 'down'
        ? 'text-danger'
        : 'text-muted-foreground'
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={`shrink-0 rounded-lg p-2 ${ICON_TONES[iconTone] || ICON_TONES.neutral}`}>
            <Icon size={17} />
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {delta && (
        <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${deltaColor}`}>
          <DeltaIcon size={13} />
          {delta.label}
        </p>
      )}
    </div>
  )
}
