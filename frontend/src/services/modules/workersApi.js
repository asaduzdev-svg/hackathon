import { api } from '../api.js'

export const workersApi = {
  list: () => api.get('/workers'),
  get: (id) => api.get(`/workers/${id}`),
  create: (input) => api.post('/workers', input),
  update: (code, patch) => api.patch(`/workers/${code}`, patch),
}
