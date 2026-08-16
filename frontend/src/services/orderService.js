import { getState, updateState, wait } from './store.js'
import { nextId, uid } from '../utils/id.js'
import { STATUS_TIMELINE_KEY } from '../constants/orderStatus.js'
import { activityService } from './activityService.js'
import { notificationService } from './notificationService.js'
import { paymentService } from './paymentService.js'

function statusTimelineKey(status) {
  return STATUS_TIMELINE_KEY[status] || 'orders.timeline.created'
}

export const orderService = {
  async list() {
    await wait()
    return getState().orders
  },

  async getById(id) {
    await wait(140)
    return getState().orders.find((o) => o.id === id) || null
  },

  async createOrder(input) {
    await wait()
    const state = getState()
    const now = new Date().toISOString()
    const order = {
      id: nextId('ORD-', state.orders),
      customerId: input.customerId || '',
      customerName: input.customerName,
      phone: input.phone,
      deviceType: input.deviceType,
      brand: input.brand,
      model: input.model,
      imei: input.imei || '',
      issue: input.issue,
      condition: input.condition || '',
      workerId: input.workerId || '',
      workerName: state.workers.find((w) => w.id === input.workerId)?.name || '',
      status: 'new',
      priority: input.priority || 'normal',
      price: Number(input.price) || 0,
      paid: 0,
      createdAt: now,
      expectedDate: input.expectedDate || '',
      notes: input.notes || '',
      cancelledReason: '',
      timeline: [{ id: uid(), key: 'orders.timeline.created', at: now }],
      notesHistory: [],
    }
    updateState((s) => ({ ...s, orders: [order, ...s.orders] }))
    await activityService.add({
      id: uid(),
      type: 'order_created',
      key: 'notifications.orderCreated',
      vars: { id: order.id, customer: order.customerName },
      at: now,
    })
    await notificationService.sendOrderCreatedNotification(order)
    return order
  },

  async updateStatus(id, status) {
    await wait()
    const state = getState()
    const order = state.orders.find((o) => o.id === id)
    if (!order) return null
    const now = new Date().toISOString()
    const updated = {
      ...order,
      status,
      timeline: [
        ...order.timeline,
        { id: uid(), key: statusTimelineKey(status), at: now },
      ],
    }
    updateState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? updated : o)),
    }))
    await activityService.add({
      id: uid(),
      type: 'order_status',
      key: 'notifications.orderStatus',
      vars: { id: order.id, status: status },
      at: now,
    })
    return updated
  },

  async assignWorker(id, workerId) {
    await wait()
    const state = getState()
    const order = state.orders.find((o) => o.id === id)
    const worker = state.workers.find((w) => w.id === workerId)
    if (!order || !worker) return null
    const now = new Date().toISOString()
    const updated = {
      ...order,
      workerId,
      workerName: worker.name,
      timeline: [
        ...order.timeline,
        { id: uid(), key: 'orders.timeline.assigned', at: now, vars: { worker: worker.name } },
      ],
    }
    updateState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? updated : o)),
    }))
    return updated
  },

  async addNote(id, text) {
    await wait()
    const state = getState()
    const order = state.orders.find((o) => o.id === id)
    if (!order) return null
    const updated = {
      ...order,
      notesHistory: [...(order.notesHistory || []), { id: uid(), text, at: new Date().toISOString() }],
    }
    updateState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? updated : o)),
    }))
    return updated
  },

  async cancelOrder(id, reason) {
    await wait()
    const state = getState()
    const order = state.orders.find((o) => o.id === id)
    if (!order) return null
    const now = new Date().toISOString()
    const updated = {
      ...order,
      status: 'cancelled',
      cancelledReason: reason,
      timeline: [
        ...order.timeline,
        { id: uid(), key: 'orders.timeline.cancelled', at: now },
      ],
    }
    updateState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? updated : o)),
    }))
    await activityService.add({
      id: uid(),
      type: 'order_cancelled',
      key: 'notifications.orderStatus',
      vars: { id: order.id, status: 'cancelled' },
      at: now,
    })
    await notificationService.sendOrderStatusNotification(updated, 'cancelled')
    return updated
  },

  async addPayment(orderId, amount, method) {
    return paymentService.add({ orderId, amount, method })
  },
}
