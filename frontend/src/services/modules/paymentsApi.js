import { api } from '../api.js'

export const paymentsApi = {
  list: (params) => api.get('/payments', params),
  summary: () => api.get('/payments/summary'),
  create: ({ orderId, amount, method }) => api.post('/payments', { orderId, amount, method }),
}
