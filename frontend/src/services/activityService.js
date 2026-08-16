import { dashboardApi } from './modules/dashboardApi.js'

export const activityService = {
  list: () => dashboardApi.activity().then((r) => r.data || []),
  dashboard: () => dashboardApi.summary().then((r) => r.data),
}
