import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { ROLE_LABEL_KEY } from '../constants/userRoles.js'
import Avatar from '../components/common/Avatar.jsx'
import { useClickOutside } from '../hooks/useClickOutside.js'

export default function UserMenu() {
  const { t } = useI18n()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-surface-hover"
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[120px] truncate text-sm font-medium text-foreground">{user.name}</span>
          <span className="block text-[11px] text-muted">{t(ROLE_LABEL_KEY[user.role])}</span>
        </span>
        <ChevronDown size={14} className="hidden text-muted sm:block" />
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 top-11 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-pop">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
            >
              <UserIcon size={15} className="text-muted" />
              {t('common.profile')}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
            >
              <Settings size={15} className="text-muted" />
              {t('nav.settings')}
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger transition-colors hover:bg-danger-bg"
            >
              <LogOut size={15} />
              {t('common.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
