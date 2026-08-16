import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ordersApi } from '../services/modules/ordersApi.js'
import { customersApi } from '../services/modules/customersApi.js'
import { paymentsApi } from '../services/modules/paymentsApi.js'
import { dashboardApi } from '../services/modules/dashboardApi.js'
import { workersApi } from '../services/modules/workersApi.js'
import { inventoryApi } from '../services/modules/inventoryApi.js'
import { systemApi } from '../services/modules/systemApi.js'
import { useAuth } from './AuthContext.jsx'

const AppContext = createContext(null)

function normalizeInventory(items) {
  return (items || []).map((i) => ({ ...i }))
}

function normalizeSettings(raw) {
  if (!raw) return null
  return {
    ...raw,
    business: {
      name: raw.businessName || '',
      phone: raw.businessPhone || '',
      address: raw.address || '',
      hours: raw.hours || '',
    },
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || null
  const [loading, setLoading] = useState(!!userId)
  const [data, setData] = useState({
    orders: [],
    customers: [],
    payments: [],
    paymentsSummary: null,
    dashboard: null,
    activity: [],
    notifications: [],
    settings: null,
    workers: [],
    inventory: [],
  })

  const refresh = useCallback(async () => {
    const [orders, customers, payments, summary, dashboard, activity, notifications, settings, workers, inventory] =
      await Promise.all([
        ordersApi.list(),
        customersApi.list(),
        paymentsApi.list(),
        paymentsApi.summary().catch(() => ({ data: null })),
        dashboardApi.summary().catch(() => ({ data: null })),
        dashboardApi.activity(),
        systemApi.notifications(),
        systemApi.settings().catch(() => ({ data: null })),
        workersApi.list().catch(() => ({ data: [] })),
        inventoryApi.list(),
      ])
    setData({
      orders: orders.data || [],
      customers: customers.data || [],
      payments: payments.data || [],
      paymentsSummary: summary.data || null,
      dashboard: dashboard.data || null,
      activity: activity.data || [],
      notifications: notifications.data || [],
      settings: normalizeSettings(settings.data),
      workers: workers.data || [],
      inventory: normalizeInventory(inventory.data),
    })
  }, [])

  useEffect(() => {
    if (!userId) {
      setData({
        orders: [],
        customers: [],
        payments: [],
        paymentsSummary: null,
        dashboard: null,
        activity: [],
        notifications: [],
        settings: null,
        workers: [],
        inventory: [],
      })
      setLoading(false)
      return undefined
    }
    setLoading(true)
    refresh()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId, refresh])

  const wrap = useCallback(
    (fn) => async (...args) => {
      const result = await fn(...args)
      await refresh().catch(() => {})
      return result
    },
    [refresh],
  )

  const actions = useMemo(
    () => ({
      createOrder: wrap(async (input) => {
        const res = await ordersApi.create(input)
        return res.data
      }),
      updateOrderStatus: wrap(async (id, status) => {
        const res = await ordersApi.updateStatus(id, status)
        return res.data
      }),
      cancelOrder: wrap(async (id, reason) => {
        const res = await ordersApi.cancel(id, reason)
        return res.data
      }),
      assignWorker: wrap(async (id, workerId) => {
        const res = await ordersApi.assignWorker(id, workerId)
        return res.data
      }),
      addOrderNote: wrap(async (id, text) => {
        const res = await ordersApi.addNote(id, text)
        return res.data
      }),
      addPayment: wrap(async ({ orderId, amount, method }) => {
        const res = await paymentsApi.create({ orderId, amount, method })
        return res
      }),
      createCustomer: wrap(async (input) => {
        const res = await customersApi.create(input)
        return res.data
      }),
      createInventoryItem: wrap(async (input) => {
        const res = await inventoryApi.create(input)
        return res.data
      }),
      updateInventoryItem: wrap(async (id, patch) => {
        const res = await inventoryApi.update(id, patch)
        return res.data
      }),
      addInventoryStock: wrap(async (id, { quantity, note }) => {
        const res = await inventoryApi.addStock(id, { quantity, note })
        return res.data
      }),
      markAllNotificationsRead: wrap(async () => {
        await systemApi.markNotificationsRead()
      }),
      updateSettings: wrap(async (patch) => {
        const res = await systemApi.updateSettings(patch)
        return res.data
      }),
      refresh,
    }),
    [wrap, refresh],
  )

  const value = useMemo(
    () => ({
      ...data,
      loading,
      ...actions,
    }),
    [data, loading, actions],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
