import { api } from '../api.js'

export const systemApi = {
  notifications: () => api.get('/notifications'),
  markNotificationsRead: () => api.post('/notifications/read-all'),
  settings: () => api.get('/settings'),
  updateSettings: (payload) => api.patch('/settings', payload),
  telegramStatus: () => api.get('/telegram/status'),
  telegramTest: () => api.post('/telegram/test'),
}
