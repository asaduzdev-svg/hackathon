import { api } from '../api.js'

export const inventoryApi = {
  list: () => api.get('/inventory'),
  get: (id) => api.get(`/inventory/${id}`),
  create: (payload) => api.post('/inventory', payload),
  update: (id, payload) => api.patch(`/inventory/${id}`, payload),
  addStock: (id, { quantity, note }) => api.post(`/inventory/${id}/stock`, { quantity, note }),
}
