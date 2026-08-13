import { createContext } from 'react'
import type { LoginCredentials, ProfileUpdatePayload, PublicUser, RegisterPayload } from '@/interfaces'

export interface AuthContextValue {
  currentUser: PublicUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  /** Giriş/kayıt isteği işlenirken true. */
  pending: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateProfile: (payload: ProfileUpdatePayload) => void
  changePassword: (currentPassword: string, nextPassword: string) => Promise<void>
}

/** Kimlik doğrulama işlemleri kullanıcıya gösterilebilir mesajla başarısız olur. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export const AuthContext = createContext<AuthContextValue | null>(null)
