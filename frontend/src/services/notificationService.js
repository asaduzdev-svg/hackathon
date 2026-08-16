import { getState, updateState, wait } from './store.js'
import { uid } from '../utils/id.js'

function buildNote(type, bodyKey, vars) {
  return { id: uid(), type, bodyKey, vars, at: new Date().toISOString(), read: false }
}

function pushNote(type, bodyKey, vars) {
  const note = buildNote(type, bodyKey, vars)
  updateState((s) => ({
    ...s,
    notifications: [note, ...s.notifications].slice(0, 60),
  }))
  return note
}

/**
 * Mock notification service.
 * In the backend phase these calls will be replaced by real Telegram Bot API
 * calls made from the Node.js server. No secrets ever live in this codebase.
 */
export const notificationService = {
  async sendOrderCreatedNotification(order) {
    await wait(60)
    return pushNote('order_created', 'notifications.orderCreated', {
      id: order.id,
      customer: order.customerName,
    })
  },

  async sendOrderStatusNotification(order, statusLabel) {
    await wait(60)
    return pushNote('order_status', 'notifications.orderStatus', {
      id: order.id,
      status: statusLabel,
    })
  },

  async sendPaymentNotification(order, amountLabel) {
    await wait(60)
    return pushNote('payment', 'notifications.payment', {
      id: order.id,
      amount: amountLabel,
    })
  },

  async sendAppointmentReminder(appointment) {
    await wait(60)
    return pushNote('appointment', 'notifications.appointmentReminder', {
      time: appointment.time,
      customer: appointment.customerName,
    })
  },

  async sendNoShowNotification(appointment) {
    await wait(60)
    return pushNote('no_show', 'notifications.noShow', {
      customer: appointment.customerName,
    })
  },

  async list() {
    return getState().notifications
  },

  async markAllRead() {
    updateState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }))
  },
}
