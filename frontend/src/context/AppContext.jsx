import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cloneState, loadState, updateState, wait } from '../services/store.js'
import { orderService } from '../services/orderService.js'
import { customerService } from '../services/customerService.js'
import { notificationService } from '../services/notificationService.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    wait(350).then(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  const refresh = useCallback((result) => {
    setState(cloneState())
    return result
  }, [])

  const actions = useMemo(() => {
    const wrap = (fn) => async (...args) => refresh(await fn(...args))
    return {
      createOrder: wrap(orderService.createOrder),
      updateOrderStatus: wrap(orderService.updateStatus),
      cancelOrder: wrap(orderService.cancelOrder),
      addPayment: wrap(({ orderId, amount, method }) =>
        orderService.addPayment(orderId, amount, method),
      ),
      createCustomer: wrap(customerService.create),
      markAllNotificationsRead: wrap(notificationService.markAllRead),
    }
  }, [refresh])

  const value = useMemo(
    () => ({
      state,
      loading,
      orders: state.orders,
      customers: state.customers,
      payments: state.payments,
      activity: state.activity,
      notifications: state.notifications,
      settings: state.settings,
      ...actions,
    }),
    [state, loading, actions],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
