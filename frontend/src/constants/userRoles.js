export const ROLES = {
  OWNER: 'OWNER',
  WORKER: 'WORKER',
  CUSTOMER: 'CUSTOMER',
}

export const ROLE_LABEL_KEY = {
  OWNER: 'roles.owner',
  WORKER: 'roles.worker',
  CUSTOMER: 'roles.customer',
}

export const ROLE_NAV = {
  OWNER: ['dashboard', 'orders', 'customers', 'appointments', 'workers', 'payments', 'inventory', 'reports', 'settings'],
  WORKER: ['dashboard', 'orders', 'customers', 'appointments', 'inventory', 'settings'],
  CUSTOMER: ['dashboard', 'orders', 'appointments', 'settings'],
}
