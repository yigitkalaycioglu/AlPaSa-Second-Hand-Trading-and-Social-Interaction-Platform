import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { createPlaceholder } from '@/lib/placeholder'

interface SmartImageProps {
  src?: string
  alt: string
  /** Görsel yüklenemezse bu metinden degradeli yer tutucu üretilir. */
  fallbackSeed: string
  className?: string
  loading?: 'lazy' | 'eager'
}

/**
 * Kaynak adres boş ya da yüklenemez olduğunda, metinden türetilmiş
 * SVG yer tutucuya düşen görsel. Böylece kırık resim ikonu hiç görünmez.
 */
export function SmartImage({ src, alt, fallbackSeed, className, loading = 'lazy' }: SmartImageProps) {
  const placeholder = useMemo(() => createPlaceholder(fallbackSeed), [fallbackSeed])

  const [source, setSource] = useState(src || placeholder)
  const [loaded, setLoaded] = useState(false)
  const [renderedSrc, setRenderedSrc] = useState(src)

  // src değiştiğinde (galeride gezinme, liste sanallaştırma) durumu render
  // sırasında sıfırla - useEffect ile yapmak fazladan bir render turu maliyeti
  // getirir ve bu, React'in "prop değişince state'i ayarla" önerdiği desendir.
  if (src !== renderedSrc) {
    setRenderedSrc(src)
    setSource(src || placeholder)
    setLoaded(false)
  }

  return (
    <img
      src={source}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        setSource(placeholder)
        setLoaded(true)
      }}
      className={cn(
        'transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  )
}
