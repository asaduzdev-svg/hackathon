import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { storage } from '../utils/storage.js'

export const THEMES = ['light', 'dark', 'system']

function systemPrefersDark() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function resolveTheme(theme) {
  return theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => storage.get('theme', 'light'))

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(theme)
    }
    apply()
    if (theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
    return undefined
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    storage.set('theme', next)
  }, [])

  const resolved = resolveTheme(theme)

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme: resolved }),
    [theme, setTheme, resolved],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
