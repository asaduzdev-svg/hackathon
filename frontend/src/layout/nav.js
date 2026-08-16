import {
  LayoutDashboard,
  Wrench,
  Car,
  Users,
  Boxes,
  Settings,
  UserRound,
  ClipboardList,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

// Role-based navigation groups.
//   roles: undefined = everyone. 'OWNER' (admin) sees the full admin nav.
export const NAV_GROUPS = [
  {
    id: 'main',
    labelKey: 'nav.groupMain',
    items: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['OWNER'] },
      { to: '/orders', labelKey: 'nav.orders', icon: Wrench, roles: ['OWNER', 'WORKER'] },
      { to: '/cars', labelKey: 'nav.cars', icon: Car, roles: ['OWNER', 'CUSTOMER'] },
      { to: '/workers', labelKey: 'nav.workers', icon: UserRound, roles: ['OWNER'] },
      { to: '/customers', labelKey: 'nav.customers', icon: Users, roles: ['OWNER'] },
      { to: '/payments', labelKey: 'nav.payments', icon: Wallet, roles: ['OWNER'] },
      { to: '/inventory', labelKey: 'nav.inventory', icon: Boxes, roles: ['OWNER'] },
      { to: '/admin', labelKey: 'nav.admin', icon: ShieldCheck, roles: ['OWNER'] },
      { to: '/worker', labelKey: 'nav.worker', icon: ClipboardList, roles: ['WORKER'] },
      { to: '/consumer', labelKey: 'nav.consumer', icon: Users, roles: ['CUSTOMER'] },
    ],
  },
  {
    id: 'general',
    labelKey: 'nav.groupGeneral',
    items: [{ to: '/settings', labelKey: 'nav.settings', icon: Settings }],
  },
]

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)
