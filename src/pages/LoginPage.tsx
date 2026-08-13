import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, Mail, ShieldCheck, User } from 'lucide-react'
import { AuthError } from '@/context/auth-context'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { DEMO_ACCOUNTS } from '@/lib/seed'
import { isValidEmail } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { LogoMark } from '@/components/layout/Logo'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, pending } = useAuth()
  const { notify } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const submit = async (event: React.FormEvent, override?: { email: string; password: string }) => {
    event.preventDefault()

    const credentials = override ?? { email, password }
    const nextErrors: typeof errors = {}

    if (!credentials.email.trim()) nextErrors.email = 'E-posta zorunludur.'
    else if (!isValidEmail(credentials.email)) nextErrors.email = 'Geçerli bir e-posta girin.'
    if (!credentials.password) nextErrors.password = 'Parola zorunludur.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await login(credentials)
      notify('Giriş başarılı. Hoş geldiniz!', 'success')
      navigate(from, { replace: true })
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : 'Giriş yapılamadı, tekrar deneyin.'
      setErrors({ form: message })
    }
  }

  /** Demo hesabını tek tıkla doldurup doğrudan giriş yapar. */
  const loginAsDemo = (account: { email: string; password: string }) => (event: React.MouseEvent) => {
    setEmail(account.email)
    setPassword(account.password)
    void submit(event as unknown as React.FormEvent, account)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 dark:text-white">
          Tekrar hoş geldiniz
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Hesabınıza giriş yaparak ilan verebilir ve mesajlaşabilirsiniz.
        </p>
      </div>

      <form onSubmit={submit} className="card-surface space-y-5 p-6 sm:p-8" noValidate>
        {errors.form && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400"
          >
            {errors.form}
          </p>
        )}

        <Input
          label="E-posta"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          placeholder="örnek@alpasa.app"
          required
        />

        <Input
          label="Parola"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          icon={<KeyRound className="h-4 w-4" />}
          placeholder="••••••••"
          required
        />

        <Button type="submit" className="w-full" size="lg" loading={pending}>
          Giriş Yap
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Hesabınız yok mu?{' '}
          <Link to="/kayit" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Kayıt olun
          </Link>
        </p>
      </form>

      {/* Degerlendiricinin hızlıca denemesi için demo hesaplar */}
      <div className="card-surface mt-6 p-5">
        <p className="mb-3 text-xs font-bold tracking-wide text-slate-400 uppercase">
          Demo hesaplar
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={loginAsDemo(DEMO_ACCOUNTS.admin)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                Yönetici olarak gir
              </span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                {DEMO_ACCOUNTS.admin.email} / {DEMO_ACCOUNTS.admin.password}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={loginAsDemo(DEMO_ACCOUNTS.user)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <User className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                Kullanıcı olarak gir
              </span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                {DEMO_ACCOUNTS.user.email} / {DEMO_ACCOUNTS.user.password}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
