import { api } from '../api.js'

export const aiApi = {
  chat: (message, history = []) => api.post('/ai/chat', { message, history }),
  status: () => api.get('/ai/status'),
}
