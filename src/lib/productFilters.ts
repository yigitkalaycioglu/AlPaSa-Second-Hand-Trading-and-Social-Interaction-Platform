import type { Category, ProductFilters, ProductListItem, ProductSortKey } from '@/interfaces'
import { getDescendantIds } from './categoryTree'

export const SORT_OPTIONS: Array<{ value: ProductSortKey; label: string }> = [
  { value: 'newest', label: 'En yeni' },
  { value: 'oldest', label: 'En eski' },
  { value: 'price-asc', label: 'Fiyat: düşükten yükseğe' },
  { value: 'price-desc', label: 'Fiyat: yüksekten düşüğe' },
  { value: 'most-viewed', label: 'En çok görüntülenen' },
  { value: 'most-favorited', label: 'En çok favorilenen' },
]

export const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  condition: null,
  city: null,
  includeSold: false,
  sort: 'newest',
}

/** Türkçe arama için büyük/küçük harf ve aksan farkını yok sayar. */
function normalize(value: string): string {
  return (
    value
      .toLocaleLowerCase('tr')
      .normalize('NFD')
      // Birleşik aksan işaretlerini (U+0300-U+036F) at: "sarj" ile "şarj" eşleşsin.
      .replace(/[̀-ͯ]/g, '')
  )
}

/** Varsayılandan sapan filtre sayısı (rozet olarak gösterilir). */
export function countActiveFilters(filters: ProductFilters): number {
  let count = 0
  if (filters.categoryId) count++
  if (filters.minPrice !== null) count++
  if (filters.maxPrice !== null) count++
  if (filters.condition) count++
  if (filters.city) count++
  if (filters.includeSold) count++
  return count
}

export function filterProducts(
  products: ProductListItem[],
  filters: ProductFilters,
  categories: Category[],
): ProductListItem[] {
  // Ana kategori seçildiğinde alt kategorilerdeki ilanlar da gelsin.
  const allowedCategories = filters.categoryId
    ? getDescendantIds(categories, filters.categoryId)
    : null

  const query = filters.search.trim() ? normalize(filters.search) : null

  const result = products.filter((product) => {
    if (!filters.includeSold && product.isSold) return false
    if (allowedCategories && !allowedCategories.has(product.categoryId)) return false
    if (filters.condition && product.condition !== filters.condition) return false
    if (filters.city && product.city !== filters.city) return false
    if (filters.minPrice !== null && product.price < filters.minPrice) return false
    if (filters.maxPrice !== null && product.price > filters.maxPrice) return false

    if (query) {
      const haystack = normalize(
        `${product.title} ${product.description} ${product.categoryName} ${product.city} ${product.sellerName}`,
      )
      if (!haystack.includes(query)) return false
    }

    return true
  })

  return sortProducts(result, filters.sort)
}

function sortProducts(products: ProductListItem[], sort: ProductFilters['sort']): ProductListItem[] {
  const sorted = [...products]

  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'most-viewed':
      return sorted.sort((a, b) => b.viewCount - a.viewCount)
    case 'most-favorited':
      return sorted.sort((a, b) => b.favoriteCount - a.favoriteCount)
    default:
      return sorted
  }
}

/** Diziyi sayfalara böler. */
export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}
