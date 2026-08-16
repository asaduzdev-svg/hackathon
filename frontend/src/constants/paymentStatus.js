export const PAYMENT_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  UNPAID: 'unpaid',
}

export const PAYMENT_STATUS_LABEL_KEY = {
  paid: 'status.payment.paid',
  partial: 'status.payment.partial',
  unpaid: 'status.payment.unpaid',
}

export const PAYMENT_STATUS_TONE = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
}

export const PAYMENT_METHODS = ['cash', 'card', 'transfer']

export const PAYMENT_METHOD_LABEL_KEY = {
  cash: 'paymentMethod.cash',
  card: 'paymentMethod.card',
  transfer: 'paymentMethod.transfer',
}

export function getPaymentStatus(price, paid) {
  const p = Number(price) || 0
  const pd = Number(paid) || 0
  if (!p || p <= 0) return PAYMENT_STATUS.PAID
  if (pd >= p) return PAYMENT_STATUS.PAID
  if (pd > 0) return PAYMENT_STATUS.PARTIAL
  return PAYMENT_STATUS.UNPAID
}

export function getRemaining(price, paid) {
  const p = Number(price) || 0
  const pd = Number(paid) || 0
  return Math.max(0, p - pd)
}

export function derivePaymentStatus(price, paid) {
  return getPaymentStatus(price, paid)
}
