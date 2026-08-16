export const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid']

export const PAYMENT_STATUS_LABEL_KEY = {
  unpaid: 'status.payment.unpaid',
  partial: 'status.payment.partial',
  paid: 'status.payment.paid',
}

export const PAYMENT_STATUS_TONE = {
  unpaid: 'danger',
  partial: 'warning',
  paid: 'success',
}

export const PAYMENT_METHODS = ['cash', 'card', 'transfer']

export const PAYMENT_METHOD_LABEL_KEY = {
  cash: 'payments.method.cash',
  card: 'payments.method.card',
  transfer: 'payments.method.transfer',
}

export function getPaymentStatus(price, paid) {
  const p = Number(price) || 0
  const paidValue = Number(paid) || 0
  if (paidValue <= 0) return 'unpaid'
  if (paidValue >= p) return 'paid'
  return 'partial'
}

export function getRemaining(price, paid) {
  const p = Number(price) || 0
  const paidValue = Number(paid) || 0
  return Math.max(0, p - paidValue)
}
