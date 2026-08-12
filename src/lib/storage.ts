/**
 * LocalStorage üzerine kurulu, tiplenmiş kalıcı depolama katmanı.
 *
 * Koleksiyonlar ayrı anahtarlarda tutulur; böylece tek bir mesaj yazarken
 * tüm ürün listesi (ve içindeki base64 görseller) yeniden serileştirilmez.
 */

export const STORAGE_KEYS = {
  version: 'alpasa.version',
  users: 'alpasa.users',
  categories: 'alpasa.categories',
  products: 'alpasa.products',
  favorites: 'alpasa.favorites',
  follows: 'alpasa.follows',
  messages: 'alpasa.messages',
  adminLogs: 'alpasa.adminLogs',
  session: 'alpasa.session',
  theme: 'alpasa.theme',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/** Tohum verisi değiştiğinde artırılır; eski sürümler sıfırlanıp yeniden tohumlanır. */
export const SCHEMA_VERSION = 4

/** localStorage kullanılabilir mi? (gizli sekme / kapalı çerez durumları) */
export function isStorageAvailable(): boolean {
  try {
    const probe = '__alpasa_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/**
 * localStorage kullanılamadığında devreye giren bellek içi yedek.
 * Uygulama çökmez, veriler yalnızca sekme kapanana kadar yaşar.
 */
const memoryFallback = new Map<string, string>()
const storageWorks = typeof window !== 'undefined' && isStorageAvailable()

function rawGet(key: string): string | null {
  if (!storageWorks) return memoryFallback.get(key) ?? null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function rawSet(key: string, value: string): void {
  if (!storageWorks) {
    memoryFallback.set(key, value)
    return
  }
  window.localStorage.setItem(key, value)
}

/** Kota aşımı hatasını diğerlerinden ayırt eder. */
export class StorageQuotaError extends Error {
  constructor() {
    super(
      'Tarayıcı depolama alanı doldu. Lütfen bazı ilanları veya görselleri silip tekrar deneyin.',
    )
    this.name = 'StorageQuotaError'
  }
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false
  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22
  )
}

/** Bir koleksiyonu okur; kayıt yoksa veya bozuksa `fallback` döner. */
export function read<T>(key: StorageKey, fallback: T): T {
  const raw = rawGet(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    // Bozuk JSON: sessizce varsayılana dön, uygulamayı kilitleme.
    console.warn(`[alpasa] "${key}" bozuk, varsayılan değere dönülüyor.`)
    return fallback
  }
}

/** Bir koleksiyonu yazar. Kota dolarsa StorageQuotaError fırlatır. */
export function write<T>(key: StorageKey, value: T): void {
  try {
    rawSet(key, JSON.stringify(value))
  } catch (error) {
    if (isQuotaError(error)) throw new StorageQuotaError()
    throw error
  }
}

export function remove(key: StorageKey): void {
  if (!storageWorks) {
    memoryFallback.delete(key)
    return
  }
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* yok sayılır */
  }
}

/** Tüm AlPaSa verilerini siler (demo verisini sıfırlamak için). */
export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (key === STORAGE_KEYS.theme) return // tema tercihi korunur
    remove(key)
  })
}

/** Depolamanın yaklaşık ne kadarını kullandığımızı (byte) hesaplar. */
export function estimateUsedBytes(): number {
  return Object.values(STORAGE_KEYS).reduce((total, key) => {
    const raw = rawGet(key)
    // UTF-16: karakter başına ~2 byte
    return total + (raw ? raw.length * 2 : 0)
  }, 0)
}
