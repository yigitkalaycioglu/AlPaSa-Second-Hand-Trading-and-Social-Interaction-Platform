import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { LoginCredentials, ProfileUpdatePayload, PublicUser, RegisterPayload, User } from '@/interfaces'
import { createId, hashPassword, verifyPassword } from '@/lib/crypto'
import { STORAGE_KEYS, read, write, remove } from '@/lib/storage'
import { useStore } from '@/hooks/useStore'
import { AuthContext, AuthError } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { findUserByEmail, findUserById, createUser, updateUser } = useStore()

  /*
    Oturum SENKRON geri yüklenir.

    Bunu bir useEffect içinde yapmak, ilk render'da isAuthenticated'in false
    gorunmesine ve ProtectedRoute'un kullanıcıyı daha effect calismadan giriş
    sayfasina yonlendirmesine yol aciyordu (korumalı bir sayfada F5'e basmak
    oturumu dusuruyordu). Veriler bootstrap sırasında hazır oldugundan
    localStorage'i doğrudan ilk değer olarak okuyabiliyoruz.
  */
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    read<string | null>(STORAGE_KEYS.session, null),
  )
  const [pending, setPending] = useState(false)

  const currentUser: PublicUser | null = useMemo(
    () => (currentUserId ? (findUserById(currentUserId) ?? null) : null),
    [currentUserId, findUserById],
  )

  const persistSession = useCallback((id: string | null) => {
    try {
      if (id) write(STORAGE_KEYS.session, id)
      else remove(STORAGE_KEYS.session)
    } catch {
      /* oturum yalnızca bellekte kalır */
    }
    setCurrentUserId(id)
  }, [])

  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
      setPending(true)
      try {
        const user = findUserByEmail(email)
        // Kullanıcı bulunamasa bile aynı mesaj: hangi e-postanın kayıtlı
        // olduğunu sızdırmamak için.
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
          throw new AuthError('E-posta veya parola hatalı.')
        }
        persistSession(user.id)
      } finally {
        setPending(false)
      }
    },
    [findUserByEmail, persistSession],
  )

  const register = useCallback(
    async ({ email, password, firstName, lastName }: RegisterPayload) => {
      setPending(true)
      try {
        if (findUserByEmail(email)) {
          throw new AuthError('Bu e-posta adresi zaten kayıtlı.')
        }
        const user: User = {
          id: createId('usr'),
          email: email.trim().toLowerCase(),
          passwordHash: await hashPassword(password),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: 'User',
          createdAt: new Date().toISOString(),
        }
        createUser(user)
        persistSession(user.id)
      } finally {
        setPending(false)
      }
    },
    [findUserByEmail, createUser, persistSession],
  )

  const logout = useCallback(() => persistSession(null), [persistSession])

  const updateProfile = useCallback(
    (payload: ProfileUpdatePayload) => {
      if (!currentUserId) return
      updateUser(currentUserId, payload)
    },
    [currentUserId, updateUser],
  )

  const changePassword = useCallback(
    async (currentPassword: string, nextPassword: string) => {
      if (!currentUser) throw new AuthError('Önce giriş yapmalısınız.')

      const stored = findUserByEmail(currentUser.email)
      if (!stored || !(await verifyPassword(currentPassword, stored.passwordHash))) {
        throw new AuthError('Mevcut parolanız hatalı.')
      }
      updateUser(currentUser.id, { passwordHash: await hashPassword(nextPassword) })
    },
    [currentUser, findUserByEmail, updateUser],
  )

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isAdmin: currentUser?.role === 'Admin',
      pending,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [currentUser, pending, login, register, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
