import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getToken, setToken, type AuthResponse, type AuthUser } from '../../services/api'
import { AuthContext, type AuthStatus, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'anonymous'))

  useEffect(() => {
    if (!getToken()) return
    let active = true

    api.me()
      .then(current => {
        if (!active) return
        setUser(current)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        setToken(null)
        setUser(null)
        setStatus('anonymous')
      })

    return () => {
      active = false
    }
  }, [])

  const applySession = useCallback((response: AuthResponse) => {
    setToken(response.access_token)
    setUser(response.user)
    setStatus('authenticated')
    return response.user
  }, [])

  const login = useCallback(
    (email: string, password: string) => api.login(email, password).then(applySession),
    [applySession],
  )

  const register = useCallback(
    (name: string, email: string, password: string) => api.register(name, email, password).then(applySession),
    [applySession],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
