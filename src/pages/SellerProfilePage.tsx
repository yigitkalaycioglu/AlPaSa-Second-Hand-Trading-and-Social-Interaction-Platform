import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapPin, PackageSearch, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/format'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { ProductCard } from '@/components/product/ProductCard'

export function SellerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { currentUser, isAuthenticated } = useAuth()
  const {
    findUserById,
    productListItems,
    followerCountOf,
    followingCountOf,
    isFollowing,
    toggleFollow,
  } = useStore()
  const { notify } = useToast()

  const seller = id ? findUserById(id) : undefined

  const listings = useMemo(
    () =>
      productListItems
        .filter((product) => product.sellerId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [productListItems, id],
  )

  if (!seller) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Kullanıcı bulunamadı
        </h1>
        <Link to="/ilanlar" className="mt-6 inline-block">
          <Button>Ilanlara dön</Button>
        </Link>
      </div>
    )
  }

  const isSelf = currentUser?.id === seller.id
  const following = isFollowing(currentUser?.id, seller.id)
  const active = listings.filter((product) => !product.isSold)
  const sold = listings.filter((product) => product.isSold)

  const handleFollow = () => {
    if (!isAuthenticated || !currentUser) {
      notify('Takip etmek için giriş yapmalısınız.', 'info')
      navigate('/giris')
      return
    }
    toggleFollow(currentUser.id, seller.id)
    notify(following ? 'Takipten çıkıldı.' : 'Takip ediliyor.', 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="card-surface mb-10 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Avatar
            firstName={seller.firstName}
            lastName={seller.lastName}
            src={seller.avatar}
            size="xl"
          />

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
              {seller.firstName} {seller.lastName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
              {seller.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {seller.address}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {followerCountOf(seller.id)} takipçi · {followingCountOf(seller.id)} takip
              </span>
              <span>{formatDate(seller.createdAt)} tarihinde katıldı</span>
            </div>

            {seller.bio && (
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">{seller.bio}</p>
            )}
          </div>

          {!isSelf && (
            <Button variant={following ? 'secondary' : 'primary'} onClick={handleFollow}>
              {following ? 'Takibi bırak' : 'Takip et'}
            </Button>
          )}
          {isSelf && (
            <Link to="/profil">
              <Button variant="outline">Profili düzenle</Button>
            </Link>
          )}
        </div>

        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <Stat label="Aktif ilan" value={active.length} />
          <Stat label="Satılan" value={sold.length} />
          <Stat label="Toplam ilan" value={listings.length} />
        </dl>
      </header>

      <h2 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">
        {isSelf ? 'İlanlarım' : 'Satıcının ilanları'}
      </h2>

      {active.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="h-8 w-8" />}
          title="Aktif ilan yok"
          description={
            isSelf
              ? 'Yeni bir ilan vererek baslayabilirsiniz.'
              : 'Bu satıcının şu anda yayında olan ilanı bulunmuyor.'
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {active.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {sold.length > 0 && (
        <>
          <h2 className="mt-14 mb-6 text-xl font-bold text-slate-700 dark:text-slate-300">
            Satılan ilanlar
          </h2>
          <div className="grid gap-5 opacity-70 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sold.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <dd className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</dd>
      <dt className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</dt>
    </div>
  )
}
