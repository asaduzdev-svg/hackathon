import { useState } from 'react'
import { Check, Languages } from 'lucide-react'
import { useI18n, LANGS } from '../i18n/index.jsx'
import { useClickOutside } from '../hooks/useClickOutside.js'

export default function LanguageSwitcher() {
  const { t, lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('common.language')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold uppercase text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <Languages size={16} />
        {lang}
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 top-11 w-32 rounded-xl border border-border bg-surface p-1.5 shadow-pop">
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setLang(code)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm uppercase transition-colors ${
                lang === code
                  ? 'bg-primary/15 font-medium text-primary-strong'
                  : 'text-foreground hover:bg-surface-hover'
              }`}
            >
              {code}
              {lang === code && <Check size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
