import { useEffect, useState } from 'react'
import { Check, Send } from 'lucide-react'
import { useTheme, THEMES } from '../context/ThemeContext.jsx'
import { useI18n, LANGS } from '../i18n/index.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { systemApi } from '../services/modules/systemApi.js'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'

function OptionGroup({ label, hint, options, value, onChange }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4 flex flex-col gap-2">
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${
                active
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                {opt.icon && <opt.icon size={16} className="text-muted" />}
                {opt.label}
              </span>
              {active && <Check size={16} className="text-primary-strong" />}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-border-strong'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function Settings() {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useI18n()
  const { settings, updateSettings } = useApp()
  const toast = useToast()

  const [botStatus, setBotStatus] = useState(null)
  const [notifyTelegram, setNotifyTelegram] = useState(settings?.notifyTelegram ?? false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    setNotifyTelegram(settings?.notifyTelegram ?? false)
  }, [settings?.notifyTelegram])

  useEffect(() => {
    systemApi
      .telegramStatus()
      .then((r) => setBotStatus(r.data || null))
      .catch(() => {})
  }, [])

  const toggleNotify = async (value) => {
    setNotifyTelegram(value)
    setSaving(true)
    try {
      await updateSettings({ notifyTelegram: value })
    } catch {
      setNotifyTelegram(!value)
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    setTesting(true)
    try {
      await systemApi.telegramTest()
      toast.success('settings.telegram.testSent')
    } catch {
      toast.error('settings.telegram.testFailed')
    } finally {
      setTesting(false)
    }
  }

  const themeOptions = THEMES.map((value) => ({
    value,
    label: t(`common.${value}`),
  }))
  const langOptions = Object.values(LANGS).map((l) => ({
    value: l.code,
    label: l.label,
  }))

  const botUsername = botStatus?.username
  const botUrl = botUsername ? `https://t.me/${botUsername}` : null

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="max-w-xl space-y-4">
        <Card className="p-5">
          <p className="text-sm font-semibold text-foreground">{t('settings.section.telegram')}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('settings.telegram.hint')}</p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">@{botUsername || '—'}</p>
                <p className="text-xs text-muted-foreground">
                  {botUsername
                    ? `${t('settings.telegram.connected')} · ${botStatus.chatCount} ${t('settings.telegram.subscribers')}`
                    : t('settings.telegram.notConfigured')}
                </p>
              </div>
              {botUrl && (
                <a
                  href={botUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary-strong hover:underline"
                >
                  {t('settings.telegram.openBot')}
                </a>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{t('settings.telegram.notify')}</p>
              </div>
              <Toggle checked={notifyTelegram} onChange={toggleNotify} disabled={saving} />
            </div>

            <Button variant="outline" size="sm" icon={Send} loading={testing} disabled={!botUsername} onClick={sendTest}>
              {t('settings.telegram.test')}
            </Button>
          </div>
        </Card>

        <OptionGroup
          label={t('settings.section.appearance')}
          hint={t('settings.appearanceHint')}
          options={themeOptions}
          value={theme}
          onChange={setTheme}
        />
        <OptionGroup
          label={t('settings.section.language')}
          hint={t('settings.languageHint')}
          options={langOptions}
          value={lang}
          onChange={setLang}
        />
      </div>
    </div>
  )
}
