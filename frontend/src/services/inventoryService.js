import { inventoryApi } from './modules/inventoryApi.js'

export const inventoryService = {
  list: () => inventoryApi.list().then((r) => r.data || []),
  get: (id) => inventoryApi.get(id).then((r) => r.data),
  create: (payload) => inventoryApi.create(payload).then((r) => r.data),
  update: (id, payload) => inventoryApi.update(id, payload).then((r) => r.data),
  addStock: (id, payload) => inventoryApi.addStock(id, payload).then((r) => r.data),
}
