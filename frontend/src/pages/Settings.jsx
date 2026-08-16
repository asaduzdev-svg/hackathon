import { Check } from 'lucide-react'
import { useTheme, THEMES } from '../context/ThemeContext.jsx'
import { useI18n, LANGS } from '../i18n/index.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Card from '../components/common/Card.jsx'

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

export default function Settings() {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useI18n()

  const themeOptions = THEMES.map((value) => ({
    value,
    label: t(`common.${value}`),
  }))
  const langOptions = Object.values(LANGS).map((l) => ({
    value: l.code,
    label: l.label,
  }))

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="max-w-xl space-y-4">
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
