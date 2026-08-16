import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/index.jsx'
import { NAV_SECTIONS } from './nav.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ROLE_LABEL_KEY } from '../constants/userRoles.js'

export function BrandMark({ className = '' }) {
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm ${className}`}
      aria-hidden="true"
    >
      SC
    </span>
  )
}

function NavItem({ item, onNavigate }) {
  const { t } = useI18n()
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary/15 text-primary-strong'
            : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
        }`
      }
    >
      <Icon size={18} className="shrink-0 transition-transform group-hover:scale-105" />
      {t(item.labelKey)}
    </NavLink>
  )
}

export default function Sidebar({ onNavigate, force = false }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const { settings } = useApp()
  const sections = NAV_SECTIONS

  return (
    <aside
      className={`${
        force ? 'flex w-full' : 'hidden w-64'
      } shrink-0 flex-col border-r border-border bg-surface lg:flex`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <BrandMark />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{settings.business.name}</p>
          <p className="text-[11px] text-muted">{t('common.slogan')}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.groupKey}>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="rounded-lg bg-surface-muted px-3 py-2.5">
          <p className="text-xs font-medium text-foreground">{t(ROLE_LABEL_KEY[user?.role])}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{t('sidebar.hint')}</p>
        </div>
      </div>
    </aside>
  )
}
