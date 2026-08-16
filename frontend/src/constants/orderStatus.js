export const ORDER_STATUSES = ['new', 'diagnosing', 'repairing', 'ready', 'completed', 'cancelled']

export const ORDER_STATUS_LABEL_KEY = {
  new: 'status.order.new',
  diagnosing: 'status.order.diagnosing',
  repairing: 'status.order.repairing',
  ready: 'status.order.ready',
  completed: 'status.order.completed',
  cancelled: 'status.order.cancelled',
}

export const ORDER_STATUS_FLOW = {
  new: ['diagnosing', 'cancelled'],
  diagnosing: ['repairing', 'cancelled'],
  repairing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const ORDER_STATUS_TONE = {
  new: 'info',
  diagnosing: 'warning',
  repairing: 'primary',
  ready: 'info',
  completed: 'success',
  cancelled: 'danger',
}

export const STATUS_TIMELINE_KEY = {
  new: 'orders.timeline.created',
  diagnosing: 'orders.timeline.diagnosis',
  repairing: 'orders.timeline.repair',
  ready: 'orders.timeline.ready',
  completed: 'orders.timeline.completed',
  cancelled: 'orders.timeline.cancelled',
}

export const ACTIVE_STATUSES = ['new', 'diagnosing', 'repairing', 'ready']
