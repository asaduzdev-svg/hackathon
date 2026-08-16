import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { storage } from '../utils/storage.js'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import en from './locales/en.json'

export const LANGS = {
  uz: { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  ru: { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  en: { code: 'en', label: 'English', flag: '🇬🇧' },
}

export const DEFAULT_LANG = 'uz'

const resources = { uz, ru, en }

function getByPath(obj, path) {
  if (path == null || typeof path !== 'string') return undefined
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj)
}

function resolveValue(template, vars = {}) {
  if (!template) return null
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) =>
    vars[key] != null ? String(vars[key]) : match,
  )
}

const I18nContext = createContext(null)

function detectInitialLang() {
  const saved = storage.get('lang')
  if (saved && resources[saved]) return saved
  const nav = typeof navigator !== 'undefined' ? navigator.language : ''
  if (nav.startsWith('ru')) return 'ru'
  if (nav.startsWith('uz')) return 'uz'
  return DEFAULT_LANG
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((code) => {
    if (!resources[code]) return
    setLangState(code)
    storage.set('lang', code)
  }, [])

  const t = useCallback(
    (key, vars) => {
      if (key == null) return ''
      const value = getByPath(resources[lang], key) ?? getByPath(resources[DEFAULT_LANG], key)
      if (value == null) return key
      return resolveValue(value, vars)
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, languages: LANGS }),
    [lang, setLang, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
