import { createSeedData } from './seed'
import { SCHEMA_VERSION, STORAGE_KEYS, clearAll, read, write } from './storage'

/**
 * Depoyu React ağacı monte edilmeden ÖNCE hazırlar.
 *
 * Tohumlama, parola özetleri için Web Crypto kullandığından asenkrondur.
 * Bunu bir effect içinde yapmak yerine açılışta bir kez çalıştırmak,
 * hem "yükleniyor" ara durumunu hem de effect kaynaklı zincirleme
 * render'ları tamamen ortadan kaldırır; StoreProvider veriyi senkron okur.
 */
export async function ensureDatabase(): Promise<void> {
  if (read<number>(STORAGE_KEYS.version, 0) === SCHEMA_VERSION) return

  clearAll()
  const seed = await createSeedData()

  try {
    write(STORAGE_KEYS.users, seed.users)
    write(STORAGE_KEYS.categories, seed.categories)
    write(STORAGE_KEYS.products, seed.products)
    write(STORAGE_KEYS.favorites, seed.favorites)
    write(STORAGE_KEYS.follows, seed.follows)
    write(STORAGE_KEYS.messages, seed.messages)
    write(STORAGE_KEYS.adminLogs, seed.adminLogs)
    write(STORAGE_KEYS.version, SCHEMA_VERSION)
  } catch (error) {
    // Kota dolu veya depolama kapalı: uygulama yine açılır, veriler
    // bellek içi yedeğe düşer (bkz. lib/storage.ts).
    console.warn('[alpasa] Demo verisi kaydedilemedi:', error)
  }
}
