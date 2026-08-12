/**
 * Görsel yükleme yardımcıları.
 *
 * localStorage kotası ~5 MB olduğundan, yüklenen her görsel canvas üzerinde
 * küçültülüp JPEG olarak yeniden kodlanır. Böylece 4 MB'lık bir telefon
 * fotoğrafı ~80-150 KB'a iner ve onlarca ilan sığar.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MB (küçültmeden önceki sınır)
export const MAX_IMAGES_PER_PRODUCT = 4

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export class ImageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageError'
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new ImageError('Görsel okunamadı. Dosya bozuk olabilir.'))
    img.src = src
  })
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new ImageError('Dosya okunamadı.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Dosyayı en fazla `maxDimension` piksel olacak şekilde küçültüp
 * JPEG data URI döndürür.
 */
export async function compressImage(
  file: File,
  maxDimension = 1000,
  quality = 0.72,
): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new ImageError('Yalnızca JPEG, PNG, WebP, GIF veya AVIF görseller yüklenebilir.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageError('Görsel 8 MB sınırını aşıyor. Daha küçük bir dosya seçin.')
  }

  const dataUrl = await readAsDataUrl(file)
  const img = await loadImage(dataUrl)

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageError('Tarayıcı görseli işleyemedi.')

  // Şeffaf PNG'ler JPEG'e çevrilirken siyah olmasın diye beyaz zemin.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', quality)
}

/** Birden fazla dosyayı sırayla işler; hatalı olanları atlayıp sebebini toplar. */
export async function compressImages(
  files: File[],
  limit = MAX_IMAGES_PER_PRODUCT,
): Promise<{ images: string[]; errors: string[] }> {
  const images: string[] = []
  const errors: string[] = []

  for (const file of files.slice(0, limit)) {
    try {
      images.push(await compressImage(file))
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Bilinmeyen görsel hatası.')
    }
  }

  return { images, errors }
}
