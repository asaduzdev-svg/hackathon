import { Navigate, Outlet } from 'react-router-dom'
import { useI18n } from '../i18n/index.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { homeForRole } from '../utils/roles.js'
import { Sparkles, ShieldCheck, Wallet, Wrench } from 'lucide-react'

function AuthMark() {
  return (
    <span
      className="inline-flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 text-base font-bold text-white shadow-pop"
      aria-hidden="true"
    >
      SC
    </span>
  )
}

const FEATURES = [
  { icon: Wrench, key: 'orders.title' },
  { icon: Wallet, key: 'payments.title' },
  { icon: ShieldCheck, key: 'inventory.title' },
]

export default function AuthLayout() {
  const { t } = useI18n()
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left side — branding */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-10 text-white lg:flex lg:flex-col">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)]" />

        <div className="relative z-10 flex items-center gap-3">
          <AuthMark />
          <div>
            <p className="text-base font-semibold tracking-tight">{t('common.appName')}</p>
            <p className="text-xs text-white/70">{t('common.appTagline')}</p>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
            <Sparkles size={12} />
            v1.0 · AI-powered
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
            {t('auth.headline')}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/80 text-balance">
            {t('auth.headlineLine2')}
          </p>
          <p className="mt-2 text-sm text-white/60">{t('auth.description')}</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {FEATURES.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <Icon size={18} className="text-cyan-300" />
                <p className="mt-2 text-xs font-medium text-white/90">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center gap-2.5 text-center lg:hidden">
            <AuthMark />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {t('common.appName')}
              </h1>
              <p className="text-sm text-muted-foreground">{t('common.slogan')}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-pop sm:p-8 animate-fade-in">
            <Outlet />
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            © {new Date().getFullYear()} {t('common.appName')} · {t('common.slogan')}
          </p>
        </div>
      </div>
    </div>
  )
}
