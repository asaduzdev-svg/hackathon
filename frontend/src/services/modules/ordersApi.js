import { api } from '../api.js'

export const ordersApi = {
  list: (params) => api.get('/orders', params),
  get: (id) => api.get(`/orders/${id}`),
  create: (payload) => api.post('/orders', payload),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  assignWorker: (id, workerId) => api.patch(`/orders/${id}/worker`, { workerId }),
  cancel: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
  addNote: (id, text) => api.post(`/orders/${id}/notes`, { text }),
}
