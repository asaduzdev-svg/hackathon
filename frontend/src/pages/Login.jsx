import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { homeForRole } from '../utils/roles.js'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@gmail.com', password: 'admin123' },
  { label: 'Demo Owner', email: 'owner@autocore.app', password: 'demo123' },
]

export default function Login() {
  const { t } = useI18n()
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const session = await login(form.email, form.password)
      toast.success('toasts.loggedIn', { name: session.user.name })
      navigate(homeForRole(session.user.role), { replace: true })
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  const useDemo = (acc) => {
    setForm({ email: acc.email, password: acc.password })
    setError('')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-strong">
          <Sparkles size={11} />
          {t('common.appName')}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('auth.title')}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.subtitle')}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          label={t('auth.email')}
          value={form.email}
          onChange={set('email')}
          placeholder="admin@gmail.com"
          leftIcon={Mail}
          autoComplete="email"
          required
        />
        <Input
          type="password"
          label={t('auth.password')}
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          leftIcon={Lock}
          showPasswordToggle
          autoComplete="current-password"
          required
        />
        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 cursor-pointer rounded border-border text-primary focus:ring-primary/30"
            />
            Eslab qolish
          </label>
          <button
            type="button"
            className="cursor-pointer text-primary-strong transition-colors hover:underline"
          >
            Parolni unutdingizmi?
          </button>
        </div>
        {error && (
          <div className="animate-rise rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <Button type="submit" loading={loading} icon={LogIn} className="w-full" size="lg">
          {t('auth.submit')}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-gradient-to-br from-surface-muted/50 to-surface p-4">
        <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <LogIn size={12} />
          Demo hisoblar
        </p>
        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => useDemo(acc)}
              className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-xs transition-all hover:border-border hover:bg-surface"
            >
              <span className="font-medium text-foreground transition-colors group-hover:text-primary-strong">
                {acc.label}
              </span>
              <span className="font-mono text-muted-foreground">
                {acc.email} / {acc.password}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link
          to="/register"
          className="cursor-pointer font-semibold text-primary-strong transition-colors hover:underline"
        >
          {t('auth.registerLink')}
        </Link>
      </p>
    </div>
  )
}
