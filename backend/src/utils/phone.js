export function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '').slice(-9)
  if (digits.length !== 9) return String(phone || '').trim()
  return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
}
