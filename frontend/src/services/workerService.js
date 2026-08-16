import { workersApi } from './modules/workersApi.js'

export const workerService = {
  list: () => workersApi.list().then((r) => r.data || []),
  get: (id) => workersApi.get(id).then((r) => r.data),
}
