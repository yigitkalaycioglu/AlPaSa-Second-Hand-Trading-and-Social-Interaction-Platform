import { Link, useNavigate } from 'react-router-dom'
import { Eye, Heart, MapPin, Sparkles } from 'lucide-react'
import type { ProductListItem } from '@/interfaces'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { formatPrice, formatRelativeTime } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { SmartImage } from '@/components/ui/SmartImage'

interface ProductCardProps {
  product: ProductListItem
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()
  const { isFavorited, toggleFavorite } = useStore()
  const { notify } = useToast()

  const favorited = isFavorited(currentUser?.id, product.id)

  const handleFavorite = (event: React.MouseEvent) => {
    // Karta gömülü buton: karta gitmeyi engelle.
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated || !currentUser) {
      notify('Favorilere eklemek için giriş yapmalısınız.', 'info')
      navigate('/giris')
      return
    }
    toggleFavorite(currentUser.id, product.id)
    notify(favorited ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi.', 'success')
  }

  return (
    <article className="group card-surface overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to={`/ilan/${product.id}`} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <SmartImage
            src={product.images[0]}
            alt={product.title}
            fallbackSeed={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {product.isFeatured && (
              <Badge tone="accent">
                <Sparkles className="h-3 w-3" />
                Öne Çıkan
              </Badge>
            )}
            {product.isSold && <Badge tone="danger">Satıldı</Badge>}
          </div>

          <button
            type="button"
            onClick={handleFavorite}
            aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            aria-pressed={favorited}
            className={cn(
              'absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all',
              favorited
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/85 text-slate-600 hover:bg-white hover:text-red-500 dark:bg-slate-900/85 dark:text-slate-300',
            )}
          >
            <Heart className={cn('h-4 w-4 transition-transform', favorited && 'fill-current scale-110')} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="brand">{product.categoryName}</Badge>
            <span className="text-xs text-slate-400">{product.condition}</span>
          </div>

          <h3 className="line-clamp-2 min-h-11 font-semibold text-slate-800 transition-colors group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
            {product.title}
          </h3>

          <p className="mt-2.5 text-xl font-extrabold text-brand-600 dark:text-brand-400">
            {formatPrice(product.price)}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{product.city}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2.5">
              <span className="flex items-center gap-1" title={`${product.viewCount} görüntülenme`}>
                <Eye className="h-3.5 w-3.5" />
                {product.viewCount}
              </span>
              <span className="flex items-center gap-1" title={`${product.favoriteCount} favori`}>
                <Heart className="h-3.5 w-3.5" />
                {product.favoriteCount}
              </span>
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(product.createdAt)}</p>
        </div>
      </Link>
    </article>
  )
}
