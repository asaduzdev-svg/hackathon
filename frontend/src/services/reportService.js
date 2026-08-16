import { getState, wait } from './store.js'
import { addDays, dayKey, formatDateShort, startOfDay, toDate } from '../utils/formatDate.js'
import { getRemaining } from '../constants/paymentStatus.js'
import { getStockStatus } from '../constants/inventoryStatus.js'

function rangeStart(key) {
  const now = new Date()
  if (key === 'today') return startOfDay(now)
  if (key === '7d') return startOfDay(addDays(now, -7))
  return startOfDay(addDays(now, -30))
}

function inRange(date, start) {
  const d = toDate(date)
  return !!d && d >= start
}

function filterOrders(state, key) {
  const start = rangeStart(key)
  return state.orders.filter((o) => inRange(o.createdAt, start))
}

function filterPayments(state, key) {
  const start = rangeStart(key)
  return state.payments.filter((p) => inRange(p.date, start))
}

function filterAppointments(state, key) {
  const start = rangeStart(key)
  return state.appointments.filter((a) => inRange(a.date, start))
}

export const reportService = {
  async revenue(key) {
    await wait()
    const state = getState()
    const payments = filterPayments(state, key)
    const now = new Date()

    if (key === 'today') {
      const buckets = []
      for (let h = 8; h <= 21; h += 1) {
        const sum = payments
          .filter((p) => toDate(p.date)?.getHours() === h)
          .reduce((acc, p) => acc + p.amount, 0)
        buckets.push({ label: `${String(h).padStart(2, '0')}:00`, value: sum })
      }
      return buckets
    }

    const days = key === '7d' ? 7 : 30
    const buckets = []
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = addDays(startOfDay(now), -i)
      const dk = dayKey(d)
      const sum = payments.filter((p) => dayKey(p.date) === dk).reduce((acc, p) => acc + p.amount, 0)
      buckets.push({ label: formatDateShort(d.toISOString()), value: sum })
    }
    return buckets
  },

  async summary(key) {
    await wait()
    const state = getState()
    const orders = filterOrders(state, key)
    const payments = filterPayments(state, key)
    const appointments = filterAppointments(state, key)

    const revenue = payments.reduce((acc, p) => acc + p.amount, 0)
    const count = orders.length
    const completed = orders.filter((o) => o.status === 'completed').length
    const cancelled = orders.filter((o) => o.status === 'cancelled').length
    const noShow = appointments.filter((a) => a.status === 'no_show').length
    const avgOrder = count > 0 ? Math.round(revenue / count) : 0

    return { revenue, orders: count, completed, cancelled, noShow, avgOrder }
  },

  async workerPerformance(key) {
    await wait()
    const state = getState()
    const orders = filterOrders(state, key).filter((o) => !['cancelled', 'no_show'].includes(o.status))
    const map = new Map()
    for (const o of orders) {
      if (!map.has(o.workerId)) {
        map.set(o.workerId, { workerId: o.workerId, workerName: o.workerName || '—', count: 0, revenue: 0 })
      }
      const row = map.get(o.workerId)
      row.count += 1
      row.revenue += o.paid
    }
    const rows = [...map.values()]
      .map((r) => ({ ...r, avg: r.count > 0 ? Math.round(r.revenue / r.count) : 0 }))
      .sort((a, b) => b.revenue - a.revenue)
    return rows
  },

  async popularServices(key) {
    await wait()
    const state = getState()
    const orders = filterOrders(state, key).filter((o) => !['cancelled', 'no_show'].includes(o.status))
    const map = new Map()
    for (const o of orders) {
      const type = o.deviceType
      map.set(type, (map.get(type) || 0) + 1)
    }
    return [...map.entries()].map(([deviceType, count]) => ({ deviceType, count })).sort((a, b) => b.count - a.count)
  },

  async inventoryReport() {
    await wait()
    const state = getState()
    const items = state.inventory
    const stockValue = items.reduce((acc, i) => acc + i.quantity * i.purchasePrice, 0)
    const lowCount = items.filter((i) => getStockStatus(i.quantity, i.minimum) === 'low_stock').length
    const outCount = items.filter((i) => getStockStatus(i.quantity, i.minimum) === 'out_of_stock').length
    const topItems = [...items]
      .sort((a, b) => b.sellingPrice - a.sellingPrice)
      .slice(0, 5)
      .map((i) => ({ ...i, status: getStockStatus(i.quantity, i.minimum) }))
    return { stockValue, lowCount, outCount, topItems }
  },

  async debtBalance() {
    await wait()
    const state = getState()
    return state.orders
      .filter((o) => !['cancelled', 'no_show'].includes(o.status))
      .reduce((acc, o) => acc + getRemaining(o.price, o.paid), 0)
  },
}
