import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Phone, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'

export default function Register() {
  const { t } = useI18n()
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError(t('auth.passwordShort'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const session = await register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        phone: form.phone,
      })
      toast.success('toasts.registered')
      navigate('/orders', { replace: true })
      return session
    } catch (err) {
      setError(err?.message || t('error.title'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-strong">
          <Sparkles size={11} />
          {t('common.appName')}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('auth.registerTitle')}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.registerSubtitle')}</p>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <Input
          label={t('auth.name')}
          value={form.name}
          onChange={set('name')}
          placeholder="Ism Familiya"
          leftIcon={User}
          required
          autoComplete="name"
        />
        <Input
          type="email"
          label={t('auth.email')}
          value={form.email}
          onChange={set('email')}
          placeholder="owner@autocore.app"
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
          hint={t('auth.passwordShort')}
          autoComplete="new-password"
          required
        />
        <Input
          label={t('common.phone')}
          value={form.phone}
          onChange={set('phone')}
          placeholder="+998 90 000 00 00"
          leftIcon={Phone}
        />
        {error && (
          <div className="animate-rise rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <Button type="submit" loading={loading} icon={UserPlus} className="w-full" size="lg">
          {t('auth.registerSubmit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <Link
          to="/login"
          className="cursor-pointer font-semibold text-primary-strong transition-colors hover:underline"
        >
          {t('auth.loginLink')}
        </Link>
      </p>
    </div>
  )
}
