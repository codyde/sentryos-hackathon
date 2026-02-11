'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  provider: 'google' | 'github'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (provider: 'google' | 'github', user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Simulated users for demo (in production, these would come from OAuth)
export const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Rob Dillisse',
    email: 'rob.dillisse@sentry.io',
    avatar: 'https://avatar.iran.liara.run/public/42',
    provider: 'google'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@sentry.io',
    avatar: 'https://avatar.iran.liara.run/public/43',
    provider: 'google'
  },
  {
    id: '3',
    name: 'Tom Anderson',
    email: 'tom.anderson@sentry.io',
    avatar: 'https://avatar.iran.liara.run/public/44',
    provider: 'github'
  },
  {
    id: '4',
    name: 'Laura Martinez',
    email: 'laura.martinez@sentry.io',
    avatar: 'https://avatar.iran.liara.run/public/45',
    provider: 'google'
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('poc-tracker-user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        Sentry.setUser({ id: parsedUser.id, email: parsedUser.email })
        Sentry.logger.info('User session restored', { user_id: parsedUser.id })
      } catch (error) {
        localStorage.removeItem('poc-tracker-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (provider: 'google' | 'github', userData: User) => {
    setUser(userData)
    localStorage.setItem('poc-tracker-user', JSON.stringify(userData))
    Sentry.setUser({ id: userData.id, email: userData.email })
    Sentry.logger.info('User logged in', {
      user_id: userData.id,
      provider: provider
    })
    Sentry.metrics.count('poc_tracker.login', 1, {
      attributes: { provider: provider }
    })
  }

  const logout = () => {
    Sentry.logger.info('User logged out', { user_id: user?.id })
    Sentry.metrics.count('poc_tracker.logout', 1)
    setUser(null)
    localStorage.removeItem('poc-tracker-user')
    Sentry.setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
