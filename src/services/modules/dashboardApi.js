import { api } from '../api.js'

export const dashboardApi = {
  summary: () => api.get('/dashboard'),
  activity: () => api.get('/activity'),
}
