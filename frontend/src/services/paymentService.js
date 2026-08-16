import { getState, updateState, wait } from './store.js'
import { nextId, uid } from '../utils/id.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { getPaymentStatus, getRemaining } from '../constants/paymentStatus.js'
import { isToday } from '../utils/formatDate.js'
import { activityService } from './activityService.js'
import { notificationService } from './notificationService.js'

export const paymentService = {
  async list() {
    await wait()
    return getState().payments
  },

  async getForOrder(orderId) {
    await wait(80)
    return getState().payments.filter((p) => p.orderId === orderId)
  },

  async add({ orderId, amount, method }) {
    await wait()
    const state = getState()
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) throw new Error('order_not_found')

    const value = Number(amount) || 0
    const remaining = getRemaining(order.price, order.paid)
    if (value <= 0) throw new Error('invalid_amount')
    if (value > remaining) throw new Error('amount_exceeds')

    const now = new Date().toISOString()
    const payment = {
      id: nextId('PAY-', state.payments),
      orderId,
      orderRef: order.id,
      customerName: order.customerName,
      amount: value,
      method,
      date: now,
      status: 'completed',
    }

    const updatedOrder = {
      ...order,
      paid: order.paid + value,
      timeline: [
        ...order.timeline,
        { id: uid(), key: 'orders.timeline.payment', at: now, vars: { amount: formatCurrency(value) } },
      ],
    }

    updateState((s) => ({
      ...s,
      payments: [...s.payments, payment],
      orders: s.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
    }))

    await activityService.add({
      id: uid(),
      type: 'payment',
      key: 'notifications.payment',
      vars: { id: order.id, amount: formatCurrency(value) },
      at: now,
    })
    await notificationService.sendPaymentNotification(updatedOrder, formatCurrency(value))

    return { payment, order: updatedOrder }
  },

  async summary() {
    await wait()
    const state = getState()
    const activeOrders = state.orders.filter((o) => !['cancelled', 'no_show'].includes(o.status))
    const todayRevenue = state.payments
      .filter((p) => isToday(p.date))
      .reduce((sum, p) => sum + p.amount, 0)
    const collected = state.payments.reduce((sum, p) => sum + p.amount, 0)
    const unpaid = activeOrders.reduce(
      (sum, o) => sum + getRemaining(o.price, o.paid),
      0,
    )
    const pending = activeOrders.filter((o) => getPaymentStatus(o.price, o.paid) !== 'paid').length
    return { todayRevenue, collected, unpaid, pending }
  },
}
