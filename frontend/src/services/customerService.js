import { customersApi } from './modules/customersApi.js'

export const customerService = {
  list: () => customersApi.list().then((r) => r.data || []),
  get: (id) => customersApi.get(id).then((r) => r.data),
  create: (payload) => customersApi.create(payload).then((r) => r.data),
  update: (id, payload) => customersApi.update(id, payload).then((r) => r.data),
}
