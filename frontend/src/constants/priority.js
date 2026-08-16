export const PRIORITY = ['low', 'normal', 'high', 'urgent']

export const PRIORITIES = PRIORITY

export const PRIORITY_LABEL_KEY = {
  low: 'priority.low',
  normal: 'priority.normal',
  high: 'priority.high',
  urgent: 'priority.urgent',
}

export const PRIORITY_TONE = {
  low: 'muted',
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
}

export const CANCELLATION_REASONS = ['customer', 'parts', 'no_show', 'other']

export const CANCELLATION_REASON_LABEL_KEY = {
  customer: 'orders.cancelReasons.customer',
  parts: 'orders.cancelReasons.parts',
  no_show: 'orders.cancelReasons.no_show',
  other: 'orders.cancelReasons.other',
}
