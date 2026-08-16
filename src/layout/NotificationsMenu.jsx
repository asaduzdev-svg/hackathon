import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useClickOutside } from '../hooks/useClickOutside.js'
import { formatRelativeTime } from '../utils/formatDate.js'
import { useToast } from '../context/ToastContext.jsx'

export default function NotificationsMenu() {
  const { t, lang } = useI18n()
  const { notifications, markAllNotificationsRead } = useApp()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))

  const unread = notifications.filter((n) => !n.read).length

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    toast.info('notifications.markedRead')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('notifications.title')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{t('notifications.title')}</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-medium text-primary-strong hover:underline"
              >
                <CheckCheck size={13} />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t('notifications.none')}</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 border-b border-border px-4 py-3 last:border-0 ${
                    n.read ? 'opacity-70' : 'bg-surface-muted/40'
                  }`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-border-strong' : 'bg-primary'}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{t(n.bodyKey, n.vars)}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatRelativeTime(n.at, lang)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
