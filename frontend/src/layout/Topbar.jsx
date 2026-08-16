import { Menu, Search } from 'lucide-react'
import { useI18n } from '../i18n/index.jsx'
import ThemeSwitcher from './ThemeSwitcher.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import NotificationsMenu from './NotificationsMenu.jsx'
import UserMenu from './UserMenu.jsx'

export default function Topbar({ onOpenSidebar, onOpenSearch }) {
  const { t } = useI18n()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-surface/85 px-4 backdrop-blur-md sm:px-5">
      <button
        type="button"
        aria-label="Menu"
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-hover hover:text-foreground lg:hidden"
      >
        <Menu size={20} />
      </button>

      <button
        type="button"
        onClick={onOpenSearch}
        className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-surface-muted/60 px-3 text-sm text-muted-foreground hover:border-border-strong hover:text-foreground sm:max-w-sm"
      >
        <Search size={15} />
        <span className="flex-1 truncate text-left">{t('common.search')}</span>
      </button>

      <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
        <ThemeSwitcher />
        <LanguageSwitcher />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  )
}
