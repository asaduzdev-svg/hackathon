const PALETTE = [
  'bg-primary/25 text-primary-strong',
  'bg-info-bg text-info',
  'bg-success-bg text-success',
  'bg-warning-bg text-warning',
  'bg-danger-bg text-danger',
]

function hashName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return hash
}

export default function Avatar({ name, size = 'md', className = '' }) {
  const initials = String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
  const tone = PALETTE[hashName(name || '?') % PALETTE.length]
  const sizeCls =
    size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-xs'
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${tone} ${sizeCls} ${className}`}
    >
      {initials}
    </span>
  )
}
