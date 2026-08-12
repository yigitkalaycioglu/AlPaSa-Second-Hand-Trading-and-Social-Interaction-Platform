import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, PackagePlus, Pencil, Store, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { formatPrice, formatRelativeTime } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmBody, EmptyState } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { SmartImage } from '@/components/ui/SmartImage'

type Tab = 'all' | 'active' | 'sold'

/** Kullanıcının kendi ilanlarini yönettiği sayfa - SILME işlemi burada. */
export function MyListingsPage() {
  const { currentUser } = useAuth()
  const { productListItems, deleteProduct } = useStore()
  const { notify } = useToast()

  const [tab, setTab] = useState<Tab>('all')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const mine = useMemo(
    () =>
      productListItems
        .filter((product) => product.sellerId === currentUser?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [productListItems, currentUser],
  )

  const counts = {
    all: mine.length,
    active: mine.filter((product) => !product.isSold).length,
    sold: mine.filter((product) => product.isSold).length,
  }

  const visible = mine.filter((product) => {
    if (tab === 'active') return !product.isSold
    if (tab === 'sold') return product.isSold
    return true
  })

  const target = pendingDelete ? mine.find((product) => product.id === pendingDelete) : null

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteProduct(pendingDelete)
    setPendingDelete(null)
    notify('İlan silindi.', 'success')
  }

  const totalValue = mine
    .filter((product) => !product.isSold)
    .reduce((sum, product) => sum + product.price, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">İlanlarım</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {counts.active} aktif ilan · toplam değer {formatPrice(totalValue)}
          </p>
        </div>
        <Link to="/ilan/yeni">
          <Button>
            <PackagePlus className="h-4 w-4" />
            Yeni İlan Ver
          </Button>
        </Link>
      </header>

      <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
          Tümü ({counts.all})
        </TabButton>
        <TabButton active={tab === 'active'} onClick={() => setTab('active')}>
          Aktif ({counts.active})
        </TabButton>
        <TabButton active={tab === 'sold'} onClick={() => setTab('sold')}>
          Satılan ({counts.sold})
        </TabButton>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Store className="h-8 w-8" />}
          title={tab === 'all' ? 'Henüz ilanınız yok' : 'Bu sekmede ilan yok'}
          description="Kullanmadiginiz eşyaları satışa cikararak başlayın."
          action={
            <Link to="/ilan/yeni">
              <Button>
                <PackagePlus className="h-4 w-4" />
                İlk ilanını ver
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((product) => (
            <article
              key={product.id}
              className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <Link
                to={`/ilan/${product.id}`}
                className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-40 dark:bg-slate-800"
              >
                <SmartImage
                  src={product.images[0]}
                  alt={product.title}
                  fallbackSeed={product.title}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{product.categoryName}</Badge>
                  {product.isSold && <Badge tone="danger">Satıldı</Badge>}
                  {product.isFeatured && <Badge tone="accent">Öne Çıkan</Badge>}
                </div>

                <Link to={`/ilan/${product.id}`}>
                  <h2 className="truncate font-bold text-slate-800 hover:text-brand-600 dark:text-slate-100">
                    {product.title}
                  </h2>
                </Link>

                <p className="mt-1 text-lg font-extrabold text-brand-600 dark:text-brand-400">
                  {formatPrice(product.price)}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {product.viewCount} görüntülenme
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {product.favoriteCount} favori
                  </span>
                  <span>{formatRelativeTime(product.createdAt)}</span>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Link to={`/ilan/${product.id}/duzenle`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-3.5 w-3.5" />
                    Düzenle
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setPendingDelete(product.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Sil
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="İlanı sil"
        size="sm"
      >
        <ConfirmBody
          message={target ? `"${target.title}" ilanını silmek istiyor musunuz?` : 'İlanı sil'}
          detail="Bu işlem geri alınamaz."
          confirmLabel="Evet, sil"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      </Modal>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
        active
          ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400'
          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
      )}
    >
      {children}
    </button>
  )
}
