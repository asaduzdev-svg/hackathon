import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { DEMO_USERS } from '../services/authService.js'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'

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
      navigate('/dashboard', { replace: true })
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email) => {
    setForm({ email, password: 'demo123' })
    setError('')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{t('auth.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('auth.subtitle')}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          label={t('auth.email')}
          value={form.email}
          onChange={set('email')}
          placeholder="owner@demo.local"
          autoComplete="email"
          required
        />
        <Input
          type="password"
          label={t('auth.password')}
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          {t('auth.submit')}
        </Button>
      </form>

      <div className="mt-5 rounded-xl border border-border bg-surface-muted/50 p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles size={13} className="text-primary-strong" />
          {t('auth.demoTitle')}
        </p>
        <p className="mt-1 text-xs text-muted">{t('auth.demoHint')}</p>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {[
            { email: DEMO_USERS[0].email, label: t('auth.demoOwner') },
            { email: DEMO_USERS[1].email, label: t('auth.demoWorker') },
            { email: DEMO_USERS[2].email, label: t('auth.demoCustomer') },
          ].map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => fillDemo(d.email)}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-surface-hover"
            >
              <span className="text-foreground">{d.label}</span>
              <span className="font-mono text-[11px] text-muted">demo123</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary-strong hover:underline">
          {t('auth.registerLink')}
        </Link>
      </p>
    </div>
  )
}
