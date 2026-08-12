/** Basit, bağımlılıksız form doğrulama yardımcıları. */

export type Errors<T> = Partial<Record<keyof T, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function required(value: string, label: string): string | undefined {
  return value.trim().length === 0 ? `${label} zorunludur.` : undefined
}

export function minLength(value: string, length: number, label: string): string | undefined {
  return value.trim().length < length
    ? `${label} en az ${length} karakter olmalıdır.`
    : undefined
}

export function maxLength(value: string, length: number, label: string): string | undefined {
  return value.trim().length > length
    ? `${label} en fazla ${length} karakter olabilir.`
    : undefined
}

/** Fiyat alanını doğrular; hem "1500" hem "1.500,50" biçimlerini kabul eder. */
export function validatePrice(value: string): string | undefined {
  const raw = value.trim()
  if (raw.length === 0) return 'Fiyat zorunludur.'

  const parsed = parsePrice(raw)
  if (parsed === null) return 'Geçerli bir fiyat girin.'
  if (parsed < 0) return 'Fiyat negatif olamaz.'
  if (parsed > 100_000_000) return 'Fiyat çok yüksek.'
  return undefined
}

/** "1.500,50" ve "1500.50" biçimlerini sayıya çevirir. Geçersizse null. */
export function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function validatePassword(value: string): string | undefined {
  if (value.length === 0) return 'Parola zorunludur.'
  if (value.length < 6) return 'Parola en az 6 karakter olmalıdır.'
  if (!/[a-zA-Z]/.test(value)) return 'Parola en az bir harf içermelidir.'
  if (!/[0-9]/.test(value)) return 'Parola en az bir rakam içermelidir.'
  return undefined
}

/** Hata nesnesinde dolu alan var mı? */
export function hasErrors<T>(errors: Errors<T>): boolean {
  return Object.values(errors).some((value) => Boolean(value))
}
