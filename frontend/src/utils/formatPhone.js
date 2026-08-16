export function formatPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 9) {
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`
  }
  return raw || ''
}

export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 9) return `998${digits}`
  if (digits.length === 12) return digits
  return digits
}
