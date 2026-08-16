import { useApp } from '../context/AppContext.jsx'

export function useCustomers() {
  const { customers, createCustomer } = useApp()
  return { customers, createCustomer }
}
