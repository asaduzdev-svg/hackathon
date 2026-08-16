import { Outlet } from 'react-router-dom'
import { BrandMark } from '../layout/Sidebar.jsx'
import { useI18n } from '../i18n/index.jsx'

export default function AuthLayout() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background via-background to-primary/15 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2.5 text-center">
          <BrandMark className="h-11 w-11 text-base" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {t('common.appName')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('common.slogan')}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-pop sm:p-8">
          <Outlet />
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} {t('common.appName')}
        </p>
      </div>
    </div>
  )
}
