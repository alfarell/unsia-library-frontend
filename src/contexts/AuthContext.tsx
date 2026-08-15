import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import * as api from '../lib/api'
import type { AuthUser } from '../lib/api'
import {
  clearStoredAuth,
  clearStoredUser,
  getStoredAuth,
  getStoredUser,
  setStoredAuth,
  setStoredUser,
} from '../lib/storage'
import type { StoredUser } from '../lib/storage'
import { useToast } from './ToastContext'

type AuthContextValue = {
  isInitializing: boolean
  signIn: (email: string, password: string) => Promise<AuthUser>
  signOut: () => void
  signUp: (name: string, email: string, password: string) => Promise<AuthUser>
  token: string | null
  user: StoredUser | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser())
  const [token, setToken] = useState<string | null>(() => getStoredAuth())
  const [isInitializing, setIsInitializing] = useState(() =>
    Boolean(getStoredAuth()),
  )

  const signOut = useCallback(() => {
    clearStoredAuth()
    clearStoredUser()
    setUser(null)
    setToken(null)
  }, [])

  useEffect(() => {
    const storedToken = getStoredAuth()

    if (!storedToken) {
      return
    }

    let cancelled = false

    api
      .getMe(storedToken)
      .then(({ user: currentUser }) => {
        if (cancelled) return
        setUser(currentUser)
        setStoredUser(currentUser)
        setIsInitializing(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof api.ApiError && error.status === 401) {
          signOut()
          showToast(error.message, 'error')
        }
        setIsInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [showToast, signOut])

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: nextToken, user: nextUser } = await api.login({
      email,
      password,
    })
    setStoredAuth(nextToken)
    setStoredUser(nextUser)
    setToken(nextToken)
    setUser(nextUser)
    return nextUser
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { token: nextToken, user: nextUser } = await api.register({
        email,
        name,
        password,
      })
      setStoredAuth(nextToken)
      setStoredUser(nextUser)
      setToken(nextToken)
      setUser(nextUser)
      return nextUser
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{ isInitializing, signIn, signOut, signUp, token, user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
