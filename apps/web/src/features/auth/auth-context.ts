import { createContext, useContext } from 'react'
import type { AuthUser } from '../../services/api'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
