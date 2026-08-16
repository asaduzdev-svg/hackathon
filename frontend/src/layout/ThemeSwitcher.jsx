import { useState } from 'react'
import { Check, Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { useClickOutside } from '../hooks/useClickOutside.js'

const OPTIONS = [
  { value: 'light', icon: Sun, labelKey: 'common.light' },
  { value: 'dark', icon: Moon, labelKey: 'common.dark' },
  { value: 'system', icon: Laptop, labelKey: 'common.system' },
]

const CURRENT_ICON = { light: Sun, dark: Moon, system: Laptop }

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  const Icon = CURRENT_ICON[theme]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('common.appearance')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <Icon size={18} />
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 top-11 w-40 rounded-xl border border-border bg-surface p-1.5 shadow-pop">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setTheme(opt.value)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                theme === opt.value
                  ? 'bg-primary/15 font-medium text-primary-strong'
                  : 'text-foreground hover:bg-surface-hover'
              }`}
            >
              <opt.icon size={15} />
              {t(opt.labelKey)}
              {theme === opt.value && <Check size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
