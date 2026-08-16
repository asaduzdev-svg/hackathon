import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    authService
      .fetchMe()
      .then((s) => {
        if (mounted) setSession(s)
      })
      .catch(() => {
        if (mounted) setSession(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const s = await authService.login(email, password)
    setSession(s)
    return s
  }, [])

  const register = useCallback(async (data) => {
    const s = await authService.register(data)
    setSession(s)
    return s
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setSession(null)
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const s = await authService.updateProfile(patch)
    if (s) setSession(s)
    return s
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
      login,
      register,
      logout,
      updateProfile,
      loading,
    }),
    [session, login, register, logout, updateProfile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
