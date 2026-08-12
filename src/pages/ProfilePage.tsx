import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, KeyRound, Save, Trash2 } from 'lucide-react'
import { AuthError } from '@/context/auth-context'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { formatBytes } from '@/lib/format'
import { minLength, required, validatePassword } from '@/lib/validation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Avatar } from '@/components/ui/Avatar'
import { ConfirmBody } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'

export function ProfilePage() {
  const { currentUser, updateProfile, changePassword } = useAuth()
  const { storageUsage, resetDemoData, productListItems, favorites } = useStore()
  const { notify } = useToast()

  const [profile, setProfile] = useState({
    firstName: currentUser?.firstName ?? '',
    lastName: currentUser?.lastName ?? '',
    address: currentUser?.address ?? '',
    phone: currentUser?.phone ?? '',
    birthDate: currentUser?.birthDate ?? '',
    bio: currentUser?.bio ?? '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string | undefined>>({})

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string | undefined>>({})

  const [resetOpen, setResetOpen] = useState(false)

  if (!currentUser) return null

  const myListings = productListItems.filter((product) => product.sellerId === currentUser.id)
  const myFavorites = favorites.filter((favorite) => favorite.userId === currentUser.id)

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const errors = {
      firstName: required(profile.firstName, 'Ad') ?? minLength(profile.firstName, 2, 'Ad'),
      lastName: required(profile.lastName, 'Soyad') ?? minLength(profile.lastName, 2, 'Soyad'),
    }
    setProfileErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    updateProfile(profile)
    notify('Profiliniz güncellendi.', 'success')
  }

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const errors = {
      current: passwords.current ? undefined : 'Mevcut parolanızı girin.',
      next: validatePassword(passwords.next),
      confirm: passwords.confirm !== passwords.next ? 'Parolalar eşleşmiyor.' : undefined,
    }
    setPasswordErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    try {
      await changePassword(passwords.current, passwords.next)
      setPasswords({ current: '', next: '', confirm: '' })
      notify('Parolanız değiştirildi.', 'success')
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : 'Parola değiştirilemedi.'
      setPasswordErrors({ current: message })
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="card-surface mb-8 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar
          firstName={currentUser.firstName}
          lastName={currentUser.lastName}
          src={currentUser.avatar}
          size="xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {currentUser.firstName} {currentUser.lastName}
            </h1>
            <Badge tone={currentUser.role === 'Admin' ? 'brand' : 'neutral'}>
              {currentUser.role === 'Admin' ? 'Yönetici' : 'Üye'}
            </Badge>
          </div>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{currentUser.email}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {myListings.length} ilan · {myFavorites.length} favori
          </p>
        </div>
        <Link to={`/satici/${currentUser.id}`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-3.5 w-3.5" />
            Herkese açık profil
          </Button>
        </Link>
      </header>

      {/* ============ Profil bilgileri ============ */}
      <form onSubmit={handleProfileSubmit} className="card-surface mb-8 p-6" noValidate>
        <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-100">
          Profil bilgileri
        </h2>

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Ad"
              value={profile.firstName}
              onChange={(event) => setProfile({ ...profile, firstName: event.target.value })}
              error={profileErrors.firstName}
              required
            />
            <Input
              label="Soyad"
              value={profile.lastName}
              onChange={(event) => setProfile({ ...profile, lastName: event.target.value })}
              error={profileErrors.lastName}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Şehir / Adres"
              value={profile.address}
              onChange={(event) => setProfile({ ...profile, address: event.target.value })}
              placeholder="Örn. İstanbul"
            />
            <Input
              label="Telefon"
              type="tel"
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              placeholder="5xx xxx xx xx"
            />
          </div>

          <Input
            label="Doğum tarihi"
            type="date"
            value={profile.birthDate}
            onChange={(event) => setProfile({ ...profile, birthDate: event.target.value })}
          />

          <Textarea
            label="Hakkımda"
            rows={4}
            value={profile.bio}
            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            maxLength={300}
            hint={`${profile.bio.length}/300 · Alicilarin sizi taniyabilmesi için kısa bir tanitim.`}
            placeholder="Ne tur ürünler satiyorsunuz?"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit">
            <Save className="h-4 w-4" />
            Kaydet
          </Button>
        </div>
      </form>

      {/* ============ Parola ============ */}
      <form onSubmit={handlePasswordSubmit} className="card-surface mb-8 p-6" noValidate>
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <KeyRound className="h-4 w-4" />
          Parola değiştir
        </h2>

        <div className="space-y-5">
          <Input
            label="Mevcut parola"
            type="password"
            autoComplete="current-password"
            value={passwords.current}
            onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
            error={passwordErrors.current}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Yeni parola"
              type="password"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
              error={passwordErrors.next}
            />
            <Input
              label="Yeni parola (tekrar)"
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
              error={passwordErrors.confirm}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="outline">
            Parolayı değiştir
          </Button>
        </div>
      </form>

      {/* ============ Veri yönetimi ============ */}
      <section className="card-surface p-6">
        <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">Veri yönetimi</h2>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Bu uygulamanin sunucusu yoktur; tüm veriler tarayıcınızın localStorage alanında tutulur.
          Şu anda <strong className="text-slate-700 dark:text-slate-200">{formatBytes(storageUsage)}</strong> yer
          kullanılıyor.
        </p>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Demo verilerini sıfırla
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400/80">
            Tüm ilanlar, kullanıcılar, mesajlar ve favoriler silinip baslangictaki örnek veriler
            geri yüklenir. Olusturdugunuz hesap da silinir.
          </p>
          <Button variant="danger" size="sm" className="mt-4" onClick={() => setResetOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" />
            Verileri sıfırla
          </Button>
        </div>
      </section>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Verileri sıfırla" size="sm">
        <ConfirmBody
          message="Tüm veriler silinip demo verisi geri yüklenecek."
          detail="Bu işlem geri alınamaz ve oturumunuz kapanır."
          confirmLabel="Evet, sıfırla"
          onConfirm={() => {
            setResetOpen(false)
            void resetDemoData()
          }}
          onCancel={() => setResetOpen(false)}
        />
      </Modal>
    </div>
  )
}
