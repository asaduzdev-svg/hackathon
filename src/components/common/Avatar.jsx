function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function initials(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const PALETTE = [
  'bg-brand-100 text-brand-800',
  'bg-success-bg text-success',
  'bg-warning-bg text-warning',
  'bg-info-bg text-info',
  'bg-danger-bg text-danger',
]

const SIZES = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const idx = hashString(name) % PALETTE.length
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-border ${PALETTE[idx]} ${SIZES[size] || SIZES.md} ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
