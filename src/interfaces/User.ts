/** Kullanıcı rolleri. Admin, tüm ürün ve kategorileri yönetebilir. */
export type UserRole = 'Admin' | 'User'

/**
 * Depolanan kullanıcı kaydı.
 * `passwordHash` SHA-256 özetidir; düz parola hiçbir zaman saklanmaz.
 */
export interface User {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role: UserRole
  /** ISO 8601 tarih dizesi (yyyy-mm-dd) */
  birthDate?: string
  address?: string
  phone?: string
  /** data: URI veya uzak görsel adresi */
  avatar?: string
  bio?: string
  createdAt: string
}

/** Parola özetini dışarıda bırakan, arayüzde güvenle kullanılabilen kullanıcı. */
export type PublicUser = Omit<User, 'passwordHash'>

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface ProfileUpdatePayload {
  firstName: string
  lastName: string
  birthDate?: string
  address?: string
  phone?: string
  bio?: string
  avatar?: string
}
