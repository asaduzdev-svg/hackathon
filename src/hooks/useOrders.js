import { useApp } from '../context/AppContext.jsx'

export function useOrders() {
  const { orders, createOrder, updateOrderStatus, cancelOrder, addPayment } = useApp()
  return { orders, createOrder, updateOrderStatus, cancelOrder, addPayment }
}
