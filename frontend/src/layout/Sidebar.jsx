import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/index.jsx'
import { NAV_GROUPS } from './nav.js'
import { useAuth } from '../context/AuthContext.jsx'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function BrandMark({ className = '' }) {
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 text-xs font-bold text-white shadow-sm ring-1 ring-white/10 ${className}`}
      aria-hidden="true"
    >
      SC
    </span>
  )
}

function RoleBadge({ role }) {
  const { t } = useI18n()
  const tone =
    role === 'OWNER'
      ? 'bg-primary/15 text-primary-strong ring-1 ring-primary/20'
      : role === 'WORKER'
        ? 'bg-accent/15 text-accent ring-1 ring-accent/20'
        : 'bg-success-bg text-success ring-1 ring-success-border'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone}`}>
      {role === 'OWNER' ? 'Admin' : t(`roles.${role?.toLowerCase()}`)}
    </span>
  )
}

export default function Sidebar({ onNavigate, force = false }) {
  const { t } = useI18n()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = user?.role

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((g) => g.items.length > 0)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={`${force ? 'flex w-full' : 'hidden w-64'} shrink-0 flex-col border-r border-border bg-surface lg:flex`}
    >
      {/* Brand header — taller, more breathing room */}
      <div className="flex h-20 items-center gap-3 border-b border-border px-5">
        <BrandMark className="h-11 w-11 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-tight text-foreground">
            {t('common.appName')}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{t('common.slogan')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {t(group.labelKey)}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-primary/10 text-primary-strong shadow-xs'
                          : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-sm" />
                        )}
                        <Icon
                          size={18}
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        />
                        <span className="truncate">{t(item.labelKey)}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-border p-3">
          <div className="group flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-surface-muted/80 to-surface-muted/40 p-2.5 ring-1 ring-border">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-400 text-sm font-bold uppercase text-white shadow-sm">
              {(user.name || 'U')[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
