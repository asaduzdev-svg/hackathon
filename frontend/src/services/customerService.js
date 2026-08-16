import { getState, updateState, wait } from './store.js'
import { nextId } from '../utils/id.js'
import { formatPhone } from '../utils/formatPhone.js'

export const customerService = {
  async list() {
    await wait()
    return getState().customers
  },

  async getById(id) {
    await wait()
    return getState().customers.find((c) => c.id === id) || null
  },

  async findByPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '')
    if (!digits) return null
    return (
      getState().customers.find((c) => String(c.phone).replace(/\D/g, '').endsWith(digits.slice(-9))) ||
      null
    )
  },

  async create(input) {
    await wait()
    const state = getState()
    const customer = {
      id: nextId('CUS-', state.customers),
      name: input.name,
      phone: formatPhone(input.phone),
      telegram: input.telegram || '',
      createdAt: new Date().toISOString(),
      notes: input.notes || '',
    }
    updateState((s) => ({ ...s, customers: [...s.customers, customer] }))
    return customer
  },

  async update(id, patch) {
    await wait()
    let updated = null
    updateState((s) => ({
      ...s,
      customers: s.customers.map((c) => {
        if (c.id !== id) return c
        updated = { ...c, ...patch, phone: patch.phone ? formatPhone(patch.phone) : c.phone }
        return updated
      }),
    }))
    return updated
  },
}
