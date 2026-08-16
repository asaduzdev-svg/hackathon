import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const s = await authService.login(email, password)
      setSession(s)
      return s
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      const s = await authService.register(data)
      setSession(s)
      return s
    } finally {
      setLoading(false)
    }
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
