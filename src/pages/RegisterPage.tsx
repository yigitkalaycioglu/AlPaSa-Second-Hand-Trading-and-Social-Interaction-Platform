import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Mail, UserRound } from 'lucide-react'
import { AuthError } from '@/context/auth-context'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { isValidEmail, minLength, required, validatePassword } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { LogoMark } from '@/components/layout/Logo'

interface FormState {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

const EMPTY: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, pending } = useAuth()
  const { notify } = useToast()

  const [values, setValues] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'form', string>>>({})

  const patch = (update: Partial<FormState>) => setValues((current) => ({ ...current, ...update }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const next: typeof errors = {
      firstName: required(values.firstName, 'Ad') ?? minLength(values.firstName, 2, 'Ad'),
      lastName: required(values.lastName, 'Soyad') ?? minLength(values.lastName, 2, 'Soyad'),
      email: !values.email.trim()
        ? 'E-posta zorunludur.'
        : !isValidEmail(values.email)
          ? 'Geçerli bir e-posta girin.'
          : undefined,
      password: validatePassword(values.password),
      confirmPassword:
        values.confirmPassword !== values.password ? 'Parolalar eşleşmiyor.' : undefined,
    }

    setErrors(next)
    if (Object.values(next).some(Boolean)) return

    try {
      await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      })
      notify('Hesabınız oluşturuldu. AlPaSa ailesine hoş geldiniz!', 'success')
      navigate('/', { replace: true })
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : 'Kayıt tamamlanamadi, tekrar deneyin.'
      setErrors({ form: message })
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 dark:text-white">
          Hesap oluşturun
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Ücretsiz üye olun, ilk ilanınızı dakikalar içinde yayınlayın.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-surface space-y-5 p-6 sm:p-8" noValidate>
        {errors.form && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400"
          >
            {errors.form}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Ad"
            value={values.firstName}
            onChange={(event) => patch({ firstName: event.target.value })}
            error={errors.firstName}
            icon={<UserRound className="h-4 w-4" />}
            autoComplete="given-name"
            required
          />
          <Input
            label="Soyad"
            value={values.lastName}
            onChange={(event) => patch({ lastName: event.target.value })}
            error={errors.lastName}
            autoComplete="family-name"
            required
          />
        </div>

        <Input
          label="E-posta"
          type="email"
          value={values.email}
          onChange={(event) => patch({ email: event.target.value })}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          placeholder="örnek@alpasa.app"
          required
        />

        <Input
          label="Parola"
          type="password"
          value={values.password}
          onChange={(event) => patch({ password: event.target.value })}
          error={errors.password}
          hint="En az 6 karakter, bir harf ve bir rakam icermeli."
          icon={<KeyRound className="h-4 w-4" />}
          autoComplete="new-password"
          required
        />

        <Input
          label="Parola (tekrar)"
          type="password"
          value={values.confirmPassword}
          onChange={(event) => patch({ confirmPassword: event.target.value })}
          error={errors.confirmPassword}
          icon={<KeyRound className="h-4 w-4" />}
          autoComplete="new-password"
          required
        />

        <Button type="submit" className="w-full" size="lg" loading={pending}>
          Kayıt Ol
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Zaten hesabınız var mi?{' '}
          <Link to="/giris" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Giriş yapin
          </Link>
        </p>
      </form>

      <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
        Bu bir demo uygulamadir. Verileriniz sunucuya gönderilmez, yalnızca bu tarayıcının
        localStorage alanında saklanır.
      </p>
    </div>
  )
}
