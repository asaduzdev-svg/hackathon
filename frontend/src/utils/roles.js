export const ROLE_HOME = {
  OWNER: '/dashboard',
  WORKER: '/worker',
  CUSTOMER: '/consumer',
}

export function homeForRole(role) {
  return ROLE_HOME[role] || '/dashboard'
}

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-9)
}
