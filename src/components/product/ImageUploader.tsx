import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { MAX_IMAGES_PER_PRODUCT, compressImages } from '@/lib/image'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

/**
 * Sürükle-bırak destekli görsel yükleyici.
 * Görseller küçültülüp base64 olarak saklanır (backend olmadığı için).
 */
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { notify } = useToast()
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  const remaining = MAX_IMAGES_PER_PRODUCT - images.length

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    if (remaining <= 0) {
      notify(`En fazla ${MAX_IMAGES_PER_PRODUCT} görsel ekleyebilirsiniz.`, 'warning')
      return
    }

    setBusy(true)
    try {
      const { images: added, errors } = await compressImages(Array.from(fileList), remaining)
      if (added.length > 0) {
        onChange([...images, ...added])
        notify(`${added.length} görsel eklendi.`, 'success')
      }
      errors.forEach((message) => notify(message, 'error'))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  /** Seçilen görseli kapak yapar (ilk sıraya taşır). */
  const makeCover = (index: number) => {
    if (index === 0) return
    const next = [...images]
    const [picked] = next.splice(index, 1)
    onChange([picked, ...next])
    notify('Kapak görseli güncellendi.', 'success')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Görseller
        <span className="ml-1.5 text-xs font-normal text-slate-400">
          ({images.length}/{MAX_IMAGES_PER_PRODUCT})
        </span>
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${index}-${image.slice(-24)}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            >
              <img src={image} alt={`Görsel ${index + 1}`} className="h-full w-full object-cover" />

              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-md bg-brand-600 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
                  KAPAK
                </span>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    aria-label="Kapak yap"
                    title="Kapak yap"
                    className="rounded-lg bg-white/90 p-2 text-slate-700 transition-colors hover:bg-white"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="Görseli kaldır"
                  title="Kaldır"
                  className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void handleFiles(event.dataTransfer.files)
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
            dragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50',
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          {busy ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
              <p className="mt-2 text-sm text-slate-500">Görseller işleniyor...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-7 w-7 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                Görsel seçmek için tıklayın veya sürükleyip bırakın
              </p>
              <p className="mt-1 text-xs text-slate-400">
                JPEG, PNG, WebP · en fazla {remaining} görsel daha · otomatik küçültülür
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
    </div>
  )
}
