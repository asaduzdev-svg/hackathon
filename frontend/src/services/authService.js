import { api } from './api.js'
import { storage } from '../utils/storage.js'

const SESSION_KEY = 'session'

export const authService = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    const session = { user: data.user }
    storage.set(SESSION_KEY, session)
    return session
  },

  async register({ name, email, password, phone = '' }) {
    const data = await api.post('/auth/register', { name, email, password, phone })
    const session = { user: data.user }
    storage.set(SESSION_KEY, session)
    return session
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      /* cookie'lar serverda tozalanmasa ham biz localStorage ni tozalaymiz */
    }
    storage.remove(SESSION_KEY)
  },

  async fetchMe() {
    const data = await api.get('/auth/me')
    const session = { user: data.user }
    storage.set(SESSION_KEY, session)
    return session
  },

  getSession() {
    return storage.get(SESSION_KEY, null)
  },
}
