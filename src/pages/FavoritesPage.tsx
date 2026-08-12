import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { HeartOff, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { ProductCard } from '@/components/product/ProductCard'

export function FavoritesPage() {
  const { currentUser } = useAuth()
  const { favorites, productListItems } = useStore()

  const favoriteProducts = useMemo(() => {
    const mine = favorites
      .filter((favorite) => favorite.userId === currentUser?.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return mine
      .map((favorite) => productListItems.find((product) => product.id === favorite.productId))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
  }, [favorites, productListItems, currentUser])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Favorilerim</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {favoriteProducts.length > 0
            ? `Beğendiğiniz ${favoriteProducts.length} ilan burada.`
            : 'Beğendiğiniz ilanları buradan takip edebilirsiniz.'}
        </p>
      </header>

      {favoriteProducts.length === 0 ? (
        <EmptyState
          icon={<HeartOff className="h-8 w-8" />}
          title="Henüz favori ilanınız yok"
          description="Ilanlarda kalp simgesine dokunarak beğendiklerinizi buraya ekleyebilirsiniz."
          action={
            <Link to="/ilanlar">
              <Button>
                <Search className="h-4 w-4" />
                İlanları keşfet
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
