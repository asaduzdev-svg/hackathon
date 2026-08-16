import { systemApi } from './modules/systemApi.js'

export const notificationService = {
  list: () => systemApi.notifications().then((r) => r.data || []),
  markAllRead: () => systemApi.markNotificationsRead().then((r) => r.data),
}

export const settingsService = {
  get: () => systemApi.settings().then((r) => r.data),
  update: (payload) => systemApi.updateSettings(payload).then((r) => r.data),
}
