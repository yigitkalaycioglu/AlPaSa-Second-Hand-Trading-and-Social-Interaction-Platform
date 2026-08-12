/** Ürünün fiziksel durumu. İkinci el pazarında alıcının ilk baktığı bilgi. */
export type ProductCondition = 'Sıfır' | 'Yeni Gibi' | 'İyi' | 'İdare Eder' | 'Yıpranmış'

export const PRODUCT_CONDITIONS: ProductCondition[] = [
  'Sıfır',
  'Yeni Gibi',
  'İyi',
  'İdare Eder',
  'Yıpranmış',
]

export interface Product {
  id: string
  title: string
  description: string
  /** Türk Lirası cinsinden fiyat. */
  price: number
  condition: ProductCondition
  categoryId: string
  sellerId: string
  /** data: URI veya uzak görsel adresi. Boş ise yer tutucu gösterilir. */
  images: string[]
  city: string
  isSold: boolean
  /** Yönetici tarafından öne çıkarılan ilanlar ana sayfada üst sırada listelenir. */
  isFeatured: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

/** Ürün formunun (ekleme + güncelleme) tuttuğu değerler. */
export interface ProductFormValues {
  title: string
  description: string
  price: string
  condition: ProductCondition
  categoryId: string
  city: string
  images: string[]
  isSold: boolean
}

export type ProductSortKey =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'most-viewed'
  | 'most-favorited'

export interface ProductFilters {
  search: string
  categoryId: string | null
  minPrice: number | null
  maxPrice: number | null
  condition: ProductCondition | null
  city: string | null
  /** true ise satılmış ilanlar da listelenir. */
  includeSold: boolean
  sort: ProductSortKey
}

/** Listeleme için ürün + çözülmüş ilişkiler (satıcı adı, kategori adı, favori sayısı). */
export interface ProductListItem extends Product {
  sellerName: string
  categoryName: string
  favoriteCount: number
}
