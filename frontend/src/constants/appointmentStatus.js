export const APPOINTMENT_STATUSES = ['confirmed', 'waiting', 'completed', 'cancelled', 'no_show']

export const APPOINTMENT_STATUS_LABEL_KEY = {
  confirmed: 'status.appointment.confirmed',
  waiting: 'status.appointment.waiting',
  completed: 'status.appointment.completed',
  cancelled: 'status.appointment.cancelled',
  no_show: 'status.appointment.no_show',
}

export const APPOINTMENT_STATUS_TONE = {
  confirmed: 'info',
  waiting: 'warning',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'danger',
}

export const APPOINTMENT_ACTIONS = {
  confirmed: ['waiting', 'completed', 'cancelled', 'no_show'],
  waiting: ['confirmed', 'completed', 'cancelled', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
}
