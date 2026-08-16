import { LayoutDashboard, Users, Wallet, Wrench, Settings } from 'lucide-react'

export const NAV_SECTIONS = [
  {
    groupKey: 'nav.main',
    items: [
      { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/orders', labelKey: 'nav.orders', icon: Wrench },
      { to: '/customers', labelKey: 'nav.customers', icon: Users },
      { to: '/payments', labelKey: 'nav.payments', icon: Wallet },
      { to: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  },
]
