const dayFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const dateShortFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' })

export function toDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(iso) {
  const d = toDate(iso)
  return d ? dayFmt.format(d) : '—'
}

export function formatDateShort(iso) {
  const d = toDate(iso)
  return d ? dateShortFmt.format(d) : '—'
}

export function formatTime(iso) {
  const d = toDate(iso)
  if (!d) return '—'
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDateTime(iso) {
  const d = toDate(iso)
  if (!d) return '—'
  return `${dayFmt.format(d)} ${formatTime(iso)}`
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  const da = toDate(a)
  const db = toDate(b)
  if (!da || !db) return false
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export function isToday(iso) {
  return isSameDay(iso, new Date())
}

export function isYesterday(iso) {
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return isSameDay(iso, y)
}

export function relativeDayKey(iso) {
  if (isToday(iso)) return 'today'
  if (isYesterday(iso)) return 'yesterday'
  return 'date'
}

export function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function addDays(d, n) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

export function todayAt(hours, minutes = 0) {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function daysAgo(n, hours = 10, minutes = 0) {
  const d = addDays(new Date(), -n)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function dayKey(iso) {
  const d = toDate(iso)
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatRelativeTime(iso, lang = 'uz') {
  const d = toDate(iso)
  if (!d) return '—'
  const diff = d.getTime() - Date.now()
  const abs = Math.abs(diff)
  let locale = lang
  if (!['en', 'ru', 'uz'].includes(locale)) locale = 'uz'
  let rtf
  try {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  } catch {
    rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  }
  const minutes = Math.round(diff / 60000)
  if (abs < 60000) return rtf.format(0, 'minute')
  if (abs < 3600000) return rtf.format(minutes, 'minute')
  if (abs < 86400000) return rtf.format(Math.round(minutes / 60), 'hour')
  if (abs < 604800000) return rtf.format(Math.round(minutes / 1440), 'day')
  return formatDate(iso)
}
