import { Link } from 'react-router-dom'
import { ArrowRight, Heart, PackagePlus, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { formatCompact, formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/product/ProductCard'

export function HomePage() {
  const { productListItems, categoryTree, stats } = useStore()

  const available = productListItems.filter((product) => !product.isSold)

  const featured = available.filter((product) => product.isFeatured).slice(0, 4)
  const newest = [...available]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)

  // "En çok favorilenen" ilan - ana sayfada öne çıkarılan tek ürün.
  const mostFavorited = available.reduce<(typeof available)[number] | null>(
    (best, product) => (!best || product.favoriteCount > best.favoriteCount ? product : best),
    null,
  )

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0, transparent 45%), radial-gradient(circle at 80% 70%, rgba(236,72,153,0.35) 0, transparent 45%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {formatCompact(stats.activeProducts)} aktif ilan seni bekliyor
            </span>

            <h1 className="mt-5 text-4xl leading-tight font-extrabold text-white sm:text-5xl lg:text-6xl">
              Kullanmadığın eşya
              <br />
              <span className="bg-gradient-to-r from-accent-400 to-pink-400 bg-clip-text text-transparent">
                birinin ihtiyacı
              </span>{' '}
              olabilir.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              AlPaSa'da ikinci el eşyalarını dakikalar içinde satışa çıkar, aradığını uygun
              fiyata bul, satıcılarla doğrudan mesajlaş.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/ilan/yeni">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-white/90 hover:brightness-100">
                  <PackagePlus className="h-5 w-5" />
                  Hemen İlan Ver
                </Button>
              </Link>
              <Link to="/ilanlar">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:border-white hover:text-white">
                  <Search className="h-5 w-5" />
                  İlanları Keşfet
                </Button>
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              <HeroStat label="Aktif ilan" value={formatCompact(stats.activeProducts)} />
              <HeroStat label="Kategori" value={formatCompact(stats.totalCategories)} />
              <HeroStat label="Üye" value={formatCompact(stats.totalUsers)} />
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ============ Kategoriler ============ */}
        <section className="py-16">
          <SectionHeading
            title="Kategorileri keşfet"
            description="Aradığın ürünü kategoriler arasinda hızlıca bul."
            action={{ to: '/ilanlar', label: 'Tümünü gör' }}
          />

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categoryTree.map((category) => (
              <Link
                key={category.id}
                to={`/ilanlar?kategori=${category.id}`}
                className="card-surface group flex flex-col items-start gap-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
                  {category.name.charAt(0)}
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 transition-colors group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
                    {category.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {category.productCount} ilan
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ Gunun ilanı ============ */}
        {mostFavorited && (
          <section className="pb-16">
            <div className="card-surface overflow-hidden">
              <div className="grid gap-0 md:grid-cols-2">
                <Link to={`/ilan/${mostFavorited.id}`} className="relative aspect-video md:aspect-auto">
                  <img
                    src={mostFavorited.images[0]}
                    alt={mostFavorited.title}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                </Link>

                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-500/15 dark:text-red-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    EN ÇOK FAVORİLENEN
                  </span>

                  <h2 className="mt-4 text-2xl font-extrabold text-slate-900 lg:text-3xl dark:text-white">
                    {mostFavorited.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-slate-500 dark:text-slate-400">
                    {mostFavorited.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                      {formatPrice(mostFavorited.price)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      {mostFavorited.favoriteCount} kişi favoriledi
                    </span>
                  </div>

                  <Link to={`/ilan/${mostFavorited.id}`} className="mt-7">
                    <Button size="lg">
                      İlanı Incele
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============ Öne cikanlar ============ */}
        {featured.length > 0 && (
          <section className="pb-16">
            <SectionHeading
              title="Öne çıkan ilanlar"
              description="Editorlerin seçtiği, dikkat ceken firsatlar."
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ============ Yeni eklenenler ============ */}
        <section className="pb-16">
          <SectionHeading
            title="Yeni eklenenler"
            description="Platforma en son eklenen ilanlar."
            action={{ to: '/ilanlar', label: 'Tüm ilanlar' }}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {newest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ============ Nasil çalışır ============ */}
        <section className="pb-20">
          <div className="rounded-3xl bg-slate-100 p-8 lg:p-12 dark:bg-slate-900">
            <h2 className="text-center text-2xl font-extrabold text-slate-900 lg:text-3xl dark:text-white">
              Uc adımda satışa başla
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <Step
                index={1}
                icon={<PackagePlus className="h-6 w-6" />}
                title="Ilanini oluştur"
                description="Fotograflarini yükle, fiyatini belirle ve kategorisini seç. Tüm bunlar bir dakikadan kısa sürer."
              />
              <Step
                index={2}
                icon={<Search className="h-6 w-6" />}
                title="Alicilar seni bulsun"
                description="İlanın kategori agacinda ve aramalarda görünür. Favorilenen ilanlar öne çıkar."
              />
              <Step
                index={3}
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Güvenle anlas"
                description="Alicilarla platform üzerinden mesajlaş, detaylari konus, satışı tamamla."
              />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-white/60 uppercase">{label}</dt>
      <dd className="mt-1 text-3xl font-extrabold text-white">{value}</dd>
    </div>
  )
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: { to: string; label: string }
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 lg:text-3xl dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

function Step({
  index,
  icon,
  title,
  description,
}: {
  index: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        {icon}
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
          {index}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  )
}
