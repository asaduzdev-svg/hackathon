import { wait } from './store.js'
import { storage } from '../utils/storage.js'

const SESSION_KEY = 'session'

export const DEMO_USERS = [
  {
    id: 'USR-OWNER',
    name: 'Sardor Karimov',
    email: 'owner@servicecore.app',
    password: 'demo123',
    role: 'OWNER',
    phone: '+998 90 123 45 67',
  },
]

function makeToken() {
  return `mock-token-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
}

/**
 * Mock authentication. Will be replaced by real JWT auth against the
 * Node.js backend in the next phase.
 */
export const authService = {
  async login(email, password) {
    await wait(400)
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === String(email || '').trim().toLowerCase() && u.password === password,
    )
    if (!user) throw new Error('invalid_credentials')
    const session = { user: publicUser(user), token: makeToken() }
    storage.set(SESSION_KEY, session)
    return session
  },

  async register({ name, email, password, role = 'OWNER' }) {
    await wait(400)
    if (!name || !email || !password) throw new Error('invalid_credentials')
    const session = {
      user: { id: `USR-${Date.now()}`, name, email, role, phone: '' },
      token: makeToken(),
    }
    storage.set(SESSION_KEY, session)
    return session
  },

  async logout() {
    await wait(150)
    storage.remove(SESSION_KEY)
  },

  getSession() {
    return storage.get(SESSION_KEY, null)
  },

  async updateProfile(patch) {
    await wait(200)
    const session = storage.get(SESSION_KEY, null)
    if (!session) return null
    session.user = { ...session.user, ...patch }
    storage.set(SESSION_KEY, session)
    return session
  },
}
