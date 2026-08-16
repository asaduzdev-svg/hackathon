import { ordersApi } from './modules/ordersApi.js'

export const orderService = {
  list: (params) => ordersApi.list(params).then((r) => r.data || []),
  get: (id) => ordersApi.get(id).then((r) => r.data),
  create: (payload) => ordersApi.create(payload).then((r) => r.data),
  updateStatus: (id, status) => ordersApi.updateStatus(id, status).then((r) => r.data),
  assignWorker: (id, workerId) => ordersApi.assignWorker(id, workerId).then((r) => r.data),
  cancel: (id, reason) => ordersApi.cancel(id, reason).then((r) => r.data),
  addNote: (id, text) => ordersApi.addNote(id, text).then((r) => r.data),
}
