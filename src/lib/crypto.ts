/**
 * Parola özetleme.
 *
 * ÖNEMLİ: Bu proje tamamen istemci tarafında çalışır ve backend'i yoktur.
 * Parolalar düz metin olarak saklanmasın diye SHA-256 özeti tutulur, ancak
 * istemci tarafı özetleme gerçek bir güvenlik sınırı sağlamaz — herkes
 * localStorage'ı okuyabilir. Üretim ortamında parola doğrulaması sunucuda,
 * bcrypt/argon2 gibi yavaş ve tuzlu bir algoritmayla yapılmalıdır.
 */

const SALT = 'alpasa::v2::static-demo-salt'

/** Web Crypto olmayan (güvensiz bağlam) ortamlar için yedek özet — FNV-1a 64 bit. */
function fallbackHash(input: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0
    h2 = Math.imul(h2 ^ (c + i), 0x85ebca6b) >>> 0
  }
  return `fnv$${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`
}

/** Parolayı tuzlayıp SHA-256 özetini onaltılık dize olarak döndürür. */
export async function hashPassword(password: string): Promise<string> {
  const payload = `${SALT}::${password}`

  if (typeof globalThis.crypto?.subtle?.digest !== 'function') {
    return fallbackHash(payload)
  }

  try {
    const bytes = new TextEncoder().encode(payload)
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return fallbackHash(payload)
  }
}

/** Girilen parolanın kayıtlı özetle eşleşip eşleşmediğini doğrular. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password)
  return computed === hash
}

/** Çakışma ihtimali ihmal edilebilir benzersiz kimlik üretir. */
export function createId(prefix = 'id'): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`
  }
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now().toString(36)}${random}`
}
