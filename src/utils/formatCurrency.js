const numberFmt = new Intl.NumberFormat('en-US')

export function formatCurrency(value) {
  const n = Number(value) || 0
  return `${numberFmt.format(n)} so'm`
}

export function formatNumber(value) {
  return numberFmt.format(Number(value) || 0)
}

export function formatCompact(value) {
  const n = Number(value) || 0
  if (n >= 1000000000) return `${(n / 1000000000).toFixed(1).replace(/\.0$/, '')} mlrd`
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')} mln`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} ming`
  return `${n}`
}
