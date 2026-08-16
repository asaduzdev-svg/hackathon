import { getState, updateState, wait } from './store.js'
import { nextId } from '../utils/id.js'

export const workerService = {
  async list() {
    await wait()
    return getState().workers
  },

  async getById(id) {
    await wait()
    return getState().workers.find((w) => w.id === id) || null
  },

  async create(input) {
    await wait()
    const state = getState()
    const worker = {
      id: nextId('WRK-', state.workers),
      name: input.name,
      phone: input.phone || '',
      specialization: input.specialization || 'phoneRepair',
      joinedAt: new Date().toISOString(),
      rating: 4.5,
    }
    updateState((s) => ({ ...s, workers: [...s.workers, worker] }))
    return worker
  },
}
