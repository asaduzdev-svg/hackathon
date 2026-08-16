import { getState, updateState, wait } from './store.js'

export const activityService = {
  async add(entry) {
    await wait(40)
    updateState((s) => ({
      ...s,
      activity: [entry, ...s.activity].slice(0, 80),
    }))
    return entry
  },

  async list() {
    await wait(80)
    return getState().activity
  },
}
