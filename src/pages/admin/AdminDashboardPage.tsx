import { Link } from 'react-router-dom'
import {
  FolderTree,
  Heart,
  MessageSquare,
  Package,
  ScrollText,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { formatPrice, formatRelativeTime } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { SmartImage } from '@/components/ui/SmartImage'

export function AdminDashboardPage() {
  const { currentUser } = useAuth()
  const { stats, productListItems, adminLogs, toggleFeatured } = useStore()
  const { notify } = useToast()

  const recent = [...productListItems]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  const topFavorited = [...productListItems]
    .sort((a, b) => b.favoriteCount - a.favoriteCount)
    .slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Yönetim Paneli</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Platformun genel durumu ve hızlı yönetim işlemleri.
        </p>
      </header>

      {/* ============ İstatistik kartları ============ */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Aktif ilan"
          value={String(stats.activeProducts)}
          sub={`${stats.soldProducts} satıldı`}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Kayıtlı üye"
          value={String(stats.totalUsers)}
        />
        <StatCard
          icon={<FolderTree className="h-5 w-5" />}
          label="Kategori"
          value={String(stats.totalCategories)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Vitrin değeri"
          value={formatPrice(stats.totalValue)}
        />
      </div>

      {/* ============ Hızlı erişim ============ */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <QuickLink
          to="/yonetim/kategoriler"
          icon={<FolderTree className="h-5 w-5" />}
          title="Kategoriler"
          description="Kategori ağacını düzenleyin"
        />
        <QuickLink
          to="/yonetim/kullanicilar"
          icon={<Users className="h-5 w-5" />}
          title="Kullanıcılar"
          description="Rolleri yönetin, hesap silin"
        />
        <QuickLink
          to="/yonetim/gunluk"
          icon={<ScrollText className="h-5 w-5" />}
          title="İşlem gunlugu"
          description={`${adminLogs.length} kayıt`}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ============ Son ilanlar ============ */}
        <section className="card-surface p-6">
          <h2 className="mb-5 font-bold text-slate-800 dark:text-slate-100">Son eklenen ilanlar</h2>
          <div className="space-y-3">
            {recent.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <Link
                  to={`/ilan/${product.id}`}
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <SmartImage
                    src={product.images[0]}
                    alt={product.title}
                    fallbackSeed={product.title}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/ilan/${product.id}`}
                    className="block truncate text-sm font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100"
                  >
                    {product.title}
                  </Link>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {product.sellerName} · {formatRelativeTime(product.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) return
                    toggleFeatured(product.id, currentUser)
                    notify(
                      product.isFeatured ? 'Vitrinden çıkarıldı.' : 'Vitrine eklendi.',
                      'success',
                    )
                  }}
                  aria-label={product.isFeatured ? 'Vitrinden çıkar' : 'Vitrine ekle'}
                  title={product.isFeatured ? 'Vitrinden çıkar' : 'Vitrine ekle'}
                  className={`shrink-0 rounded-lg p-2 transition-colors ${
                    product.isFeatured
                      ? 'bg-accent-500 text-white'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-accent-500 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ============ En çok favorilenen ============ */}
        <section className="card-surface p-6">
          <h2 className="mb-5 font-bold text-slate-800 dark:text-slate-100">
            En çok favorilenen ilanlar
          </h2>
          <ol className="space-y-3">
            {topFavorited.map((product, index) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {index + 1}
                </span>
                <Link
                  to={`/ilan/${product.id}`}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 hover:text-brand-600 dark:text-slate-200"
                >
                  {product.title}
                </Link>
                <Badge tone="danger">
                  <Heart className="h-3 w-3" />
                  {product.favoriteCount}
                </Badge>
              </li>
            ))}
          </ol>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <MiniStat
              icon={<MessageSquare className="h-4 w-4" />}
              label="Toplam mesaj"
              value={stats.totalMessages}
            />
            <MiniStat
              icon={<Heart className="h-4 w-4" />}
              label="Toplam favori"
              value={stats.totalFavorites}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-slate-400">{icon}</span>
      <div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

function QuickLink({
  to,
  icon,
  title,
  description,
}: {
  to: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link to={to} className="card-surface group p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        {icon}
      </span>
      <h3 className="mt-3 font-bold text-slate-800 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
        {title}
      </h3>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </Link>
  )
}
