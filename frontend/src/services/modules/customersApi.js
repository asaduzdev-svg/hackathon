import { api } from '../api.js'

export const customersApi = {
  list: () => api.get('/customers'),
  get: (id) => api.get(`/customers/${id}`),
  create: (payload) => api.post('/customers', payload),
  update: (id, payload) => api.patch(`/customers/${id}`, payload),
}
