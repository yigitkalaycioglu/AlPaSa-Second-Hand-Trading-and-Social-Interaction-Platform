import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Pencil,
  Send,
  Tag,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { getCategoryPath } from '@/lib/categoryTree'
import { formatDate, formatPrice, formatRelativeTime } from '@/lib/format'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmBody } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { SmartImage } from '@/components/ui/SmartImage'
import { Textarea } from '@/components/ui/Field'
import { ProductCard } from '@/components/product/ProductCard'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { currentUser, isAuthenticated, isAdmin } = useAuth()
  const {
    productListItems,
    categories,
    findUserById,
    isFavorited,
    toggleFavorite,
    deleteProduct,
    incrementViewCount,
    sendMessage,
    followerCountOf,
    isFollowing,
    toggleFollow,
  } = useStore()
  const { notify } = useToast()

  const [activeImage, setActiveImage] = useState(0)
  const [galleryFor, setGalleryFor] = useState(id)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageText, setMessageText] = useState('')

  // Aynı rotada başka bir ilana geçildiğinde galeriyi ilk görsele al.
  if (id !== galleryFor) {
    setGalleryFor(id)
    setActiveImage(0)
  }

  const product = productListItems.find((item) => item.id === id)
  const seller = product ? findUserById(product.sellerId) : undefined

  // Görüntülenme sayacı: her ilan için oturumda bir kez artir.
  const countedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!product || countedRef.current === product.id) return
    countedRef.current = product.id
    incrementViewCount(product.id)
  }, [product, incrementViewCount])

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">İlan bulunamadı</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Bu ilan kaldirilmis veya adres hatalı olabilir.
        </p>
        <Link to="/ilanlar" className="mt-6 inline-block">
          <Button>Ilanlara dön</Button>
        </Link>
      </div>
    )
  }

  const isOwner = currentUser?.id === product.sellerId
  const canManage = isOwner || isAdmin
  const favorited = isFavorited(currentUser?.id, product.id)
  const breadcrumb = getCategoryPath(categories, product.categoryId)

  const related = productListItems
    .filter(
      (item) => item.categoryId === product.categoryId && item.id !== product.id && !item.isSold,
    )
    .slice(0, 4)

  const handleFavorite = () => {
    if (!currentUser) {
      notify('Favorilere eklemek için giriş yapmalısınız.', 'info')
      navigate('/giris')
      return
    }
    toggleFavorite(currentUser.id, product.id)
    notify(favorited ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi.', 'success')
  }

  const handleDelete = () => {
    deleteProduct(product.id)
    setConfirmOpen(false)
    notify('İlan silindi.', 'success')
    navigate('/ilanlarim')
  }

  const handleSendMessage = () => {
    if (!currentUser || !seller) return
    if (messageText.trim().length < 2) {
      notify('Mesaj çok kısa.', 'error')
      return
    }
    sendMessage(currentUser.id, seller.id, messageText, product.id)
    setMessageOpen(false)
    setMessageText('')
    notify('Mesajınız gönderildi.', 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/ilanlar"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Ilanlara dön
      </Link>

      <nav aria-label="Kategori yolu" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
        {breadcrumb.map((category, index) => (
          <span key={category.id} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-slate-300">/</span>}
            <Link
              to={`/ilanlar?kategori=${category.id}`}
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              {category.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        {/* ============ Galeri ============ */}
        <div>
          <div className="card-surface overflow-hidden">
            <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800">
              <SmartImage
                src={product.images[activeImage]}
                alt={product.title}
                fallbackSeed={product.title}
                loading="eager"
                className="h-full w-full object-cover"
              />
              {product.isSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/55">
                  <span className="rounded-xl bg-red-600 px-6 py-2.5 text-xl font-extrabold tracking-wide text-white">
                    SATILDI
                  </span>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2.5 p-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`${index + 1}. görseli göster`}
                    aria-current={index === activeImage}
                    className={cn(
                      'h-18 w-18 overflow-hidden rounded-lg border-2 transition-all',
                      index === activeImage
                        ? 'border-brand-500 ring-2 ring-brand-500/25'
                        : 'border-transparent opacity-70 hover:opacity-100',
                    )}
                  >
                    <SmartImage
                      src={image}
                      alt=""
                      fallbackSeed={`${product.title}-${index}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="card-surface mt-6 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Açıklama</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
              {product.description}
            </p>
          </section>
        </div>

        {/* ============ Bilgi paneli ============ */}
        <div className="space-y-6">
          <div className="card-surface p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="brand">
                <Tag className="h-3 w-3" />
                {product.categoryName}
              </Badge>
              <Badge tone="neutral">{product.condition}</Badge>
              {product.isFeatured && <Badge tone="accent">Öne Çıkan</Badge>}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {product.title}
            </h1>

            <p className="mt-4 text-4xl font-extrabold text-brand-600 dark:text-brand-400">
              {formatPrice(product.price)}
            </p>

            <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
              <MetaRow icon={<MapPin className="h-4 w-4" />} label="Konum" value={product.city} />
              <MetaRow
                icon={<CalendarDays className="h-4 w-4" />}
                label="Yayın tarihi"
                value={`${formatDate(product.createdAt)} (${formatRelativeTime(product.createdAt)})`}
              />
              <MetaRow
                icon={<Eye className="h-4 w-4" />}
                label="Görüntülenme"
                value={String(product.viewCount)}
              />
              <MetaRow
                icon={<Heart className="h-4 w-4" />}
                label="Favori"
                value={String(product.favoriteCount)}
              />
            </dl>

            <div className="mt-6 space-y-3">
              {canManage ? (
                <div className="flex gap-3">
                  <Link to={`/ilan/${product.id}/duzenle`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Düzenle
                    </Button>
                  </Link>
                  <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={product.isSold}
                  onClick={() => {
                    if (!isAuthenticated) {
                      notify('Mesaj göndermek için giriş yapmalısınız.', 'info')
                      navigate('/giris')
                      return
                    }
                    setMessageOpen(true)
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  {product.isSold ? 'Bu ürün satıldı' : 'Satıcıya mesaj gönder'}
                </Button>
              )}

              <Button
                variant={favorited ? 'secondary' : 'outline'}
                className="w-full"
                onClick={handleFavorite}
              >
                <Heart className={cn('h-4 w-4', favorited && 'fill-red-500 text-red-500')} />
                {favorited ? 'Favorilerimde' : 'Favorilere ekle'}
              </Button>
            </div>
          </div>

          {/* Satıcı kartı */}
          {seller && (
            <div className="card-surface p-6">
              <h2 className="mb-4 text-sm font-bold tracking-wide text-slate-400 uppercase">
                Satıcı
              </h2>

              <Link to={`/satici/${seller.id}`} className="group flex items-center gap-3">
                <Avatar
                  firstName={seller.firstName}
                  lastName={seller.lastName}
                  src={seller.avatar}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-800 transition-colors group-hover:text-brand-600 dark:text-slate-100">
                    {seller.firstName} {seller.lastName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {followerCountOf(seller.id)} takipçi
                  </p>
                </div>
              </Link>

              {seller.bio && (
                <p className="mt-4 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                  {seller.bio}
                </p>
              )}

              {isAuthenticated && currentUser && currentUser.id !== seller.id && (
                <Button
                  variant={isFollowing(currentUser.id, seller.id) ? 'secondary' : 'outline'}
                  className="mt-4 w-full"
                  size="sm"
                  onClick={() => {
                    toggleFollow(currentUser.id, seller.id)
                    notify(
                      isFollowing(currentUser.id, seller.id)
                        ? 'Takipten çıkıldı.'
                        : 'Satıcı takip ediliyor.',
                      'success',
                    )
                  }}
                >
                  {isFollowing(currentUser.id, seller.id) ? 'Takibi bırak' : 'Takip et'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============ Benzer ilanlar ============ */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Benzer ilanlar
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* ============ Silme onayı ============ */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="İlanı sil"
        size="sm"
      >
        <ConfirmBody
          message={`"${product.title}" ilanını silmek istediğinize emin misiniz?`}
          detail="Bu işlem geri alınamaz. Ilana ait favori kayıtları da silinir."
          confirmLabel="Evet, sil"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </Modal>

      {/* ============ Mesaj gonderme ============ */}
      <Modal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title="Satıcıya mesaj gönder"
        description={seller ? `Alici: ${seller.firstName} ${seller.lastName}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>
              Vazgeç
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
              Gönder
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
            <p className="font-medium text-slate-700 dark:text-slate-200">{product.title}</p>
            <p className="text-brand-600 dark:text-brand-400">{formatPrice(product.price)}</p>
          </div>

          <Textarea
            label="Mesajınız"
            rows={5}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Merhaba, ürün hala satılık mi? Pazarlik payi var mi?"
            maxLength={1000}
            hint={`${messageText.length}/1000`}
          />
        </div>
      </Modal>
    </div>
  )
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-medium text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  )
}
