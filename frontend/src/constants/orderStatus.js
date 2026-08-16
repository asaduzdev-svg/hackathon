// Order status palette — ServiceCore uses semantic, calm tones that
// read well on mobile and in both light/dark themes.
export const ORDER_STATUSES = ['new', 'diagnosing', 'repairing', 'ready', 'completed', 'cancelled']

export const ORDER_STATUS_LABEL_KEY = {
  new: 'status.order.new',
  diagnosing: 'status.order.diagnosing',
  repairing: 'status.order.repairing',
  ready: 'status.order.ready',
  completed: 'status.order.completed',
  cancelled: 'status.order.cancelled',
}

// Soft, semantic tones (bg + fg) instead of hard pill colors.
export const ORDER_STATUS_TONE = {
  new: 'info',
  diagnosing: 'warning',
  repairing: 'accent',
  ready: 'success',
  completed: 'muted',
  cancelled: 'danger',
}

export const ACTIVE_STATUSES = ['new', 'diagnosing', 'repairing', 'ready']

export const STATUS_FLOW = ['new', 'diagnosing', 'repairing', 'ready', 'completed']

export const ORDER_STATUS_FLOW = {
  new: ['diagnosing'],
  diagnosing: ['repairing'],
  repairing: ['ready'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
}
