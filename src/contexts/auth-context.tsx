import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  authenticateUser,
  getUserPermissions,
  type User,
  type UserRole,
  type RolePermissions,
} from '../lib/users'

export type { User, UserRole, RolePermissions }

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  permissions: RolePermissions | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hrms_user')
    return saved ? JSON.parse(saved) : null
  })

  const [permissions, setPermissions] = useState<RolePermissions | null>(() => {
    const saved = localStorage.getItem('hrms_user')
    if (saved) {
      const userData: User = JSON.parse(saved)
      return getUserPermissions(userData.role)
    }
    return null
  })

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))

    const authenticatedUser = authenticateUser(email, password)

    if (!authenticatedUser) {
      return { success: false, error: 'Invalid email or password' }
    }

    setUser(authenticatedUser)
    setPermissions(getUserPermissions(authenticatedUser.role))
    localStorage.setItem('hrms_user', JSON.stringify(authenticatedUser))
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setPermissions(null)
    localStorage.removeItem('hrms_user')
  }, [])

  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!user || !permissions) return false

      const keys = permission.split('.')
      let current: any = permissions
      for (const key of keys) {
        if (current === undefined || current === null) return false
        current = current[key]
      }
      return !!current
    },
    [user, permissions]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        permissions,
        login,
        logout,
        hasPermission: checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
