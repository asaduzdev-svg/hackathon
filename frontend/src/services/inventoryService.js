import { getState, updateState, wait } from './store.js'
import { nextId, uid } from '../utils/id.js'

export const inventoryService = {
  async list() {
    await wait()
    return getState().inventory
  },

  async getById(id) {
    await wait()
    return getState().inventory.find((i) => i.id === id) || null
  },

  async create(input) {
    await wait()
    const state = getState()
    const item = {
      id: nextId('INV-', state.inventory),
      name: input.name,
      category: input.category,
      quantity: Number(input.quantity) || 0,
      minimum: Number(input.minimum) || 0,
      purchasePrice: Number(input.purchasePrice) || 0,
      sellingPrice: Number(input.sellingPrice) || 0,
      history: [{ id: uid(), type: 'stock', quantity: Number(input.quantity) || 0, note: input.note || '', at: new Date().toISOString() }],
    }
    updateState((s) => ({ ...s, inventory: [...s.inventory, item] }))
    return item
  },

  async update(id, patch) {
    await wait()
    let updated = null
    updateState((s) => ({
      ...s,
      inventory: s.inventory.map((i) => {
        if (i.id !== id) return i
        updated = { ...i, ...patch }
        return updated
      }),
    }))
    return updated
  },

  async addStock(id, { quantity, note }) {
    await wait()
    const state = getState()
    const item = state.inventory.find((i) => i.id === id)
    if (!item) return null
    const qty = Number(quantity) || 0
    const updated = {
      ...item,
      quantity: item.quantity + qty,
      history: [
        ...item.history,
        { id: uid(), type: 'stock', quantity: qty, note: note || '', at: new Date().toISOString() },
      ],
    }
    updateState((s) => ({
      ...s,
      inventory: s.inventory.map((i) => (i.id === id ? updated : i)),
    }))
    return updated
  },
}
