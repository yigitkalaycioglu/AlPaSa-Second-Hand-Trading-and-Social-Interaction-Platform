import { describe, expect, it } from 'vitest'
import type { Category, ProductFilters, ProductListItem } from '@/interfaces'
import { countActiveFilters, DEFAULT_FILTERS, filterProducts, paginate } from '@/lib/productFilters'

const categories: Category[] = [
  { id: 'elektronik', name: 'Elektronik', parentId: null, description: '', createdAt: '2026-01-01' },
  { id: 'telefon', name: 'Telefon', parentId: 'elektronik', description: '', createdAt: '2026-01-01' },
  { id: 'giyim', name: 'Giyim', parentId: null, description: '', createdAt: '2026-01-01' },
]

function product(overrides: Partial<ProductListItem> & Pick<ProductListItem, 'id'>): ProductListItem {
  return {
    title: 'Ilan',
    description: '',
    price: 100,
    condition: 'İyi',
    categoryId: 'elektronik',
    sellerId: 'u1',
    images: [],
    city: 'İstanbul',
    isSold: false,
    isFeatured: false,
    viewCount: 0,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    sellerName: 'Elif',
    categoryName: 'Elektronik',
    favoriteCount: 0,
    ...overrides,
  }
}

const products: ProductListItem[] = [
  product({ id: 'p1', title: 'Şarj aleti', categoryId: 'telefon', categoryName: 'Telefon', price: 150, createdAt: '2026-01-03T00:00:00.000Z', viewCount: 5 }),
  product({ id: 'p2', title: 'Kış montu', categoryId: 'giyim', categoryName: 'Giyim', price: 900, city: 'Ankara', createdAt: '2026-01-01T00:00:00.000Z', favoriteCount: 7 }),
  product({ id: 'p3', title: 'Laptop', price: 12000, condition: 'Yeni Gibi', createdAt: '2026-01-02T00:00:00.000Z', viewCount: 40 }),
  product({ id: 'p4', title: 'Eski telefon', categoryId: 'telefon', categoryName: 'Telefon', price: 500, isSold: true }),
]

const ids = (list: ProductListItem[]) => list.map((p) => p.id)
const filters = (overrides: Partial<ProductFilters>): ProductFilters => ({ ...DEFAULT_FILTERS, ...overrides })

describe('filterProducts', () => {
  it('varsayilan olarak satilmis ilanlari gizler ve en yeniyi basa koyar', () => {
    expect(ids(filterProducts(products, DEFAULT_FILTERS, categories))).toEqual(['p1', 'p3', 'p2'])
  })

  it('istenirse satilmis ilanlari da listeler', () => {
    expect(ids(filterProducts(products, filters({ includeSold: true }), categories))).toContain('p4')
  })

  it('ana kategori secilince alt kategorilerdeki ilanlar da gelir', () => {
    expect(ids(filterProducts(products, filters({ categoryId: 'elektronik' }), categories)).sort()).toEqual(['p1', 'p3'])
  })

  it('aramada buyuk-kucuk harf ve Turkce aksan farkini yok sayar', () => {
    expect(ids(filterProducts(products, filters({ search: 'SARJ' }), categories))).toEqual(['p1'])
    expect(ids(filterProducts(products, filters({ search: 'kis' }), categories))).toEqual(['p2'])
  })

  it('aramada sehir ve satici adi da taranir', () => {
    expect(ids(filterProducts(products, filters({ search: 'ankara' }), categories))).toEqual(['p2'])
  })

  it('fiyat araligini sinir degerler dahil uygular', () => {
    expect(ids(filterProducts(products, filters({ minPrice: 150, maxPrice: 900 }), categories)).sort()).toEqual(['p1', 'p2'])
  })

  it('durum ve sehir filtrelerini uygular', () => {
    expect(ids(filterProducts(products, filters({ condition: 'Yeni Gibi' }), categories))).toEqual(['p3'])
    expect(ids(filterProducts(products, filters({ city: 'Ankara' }), categories))).toEqual(['p2'])
  })

  it('fiyata, goruntulenmeye ve favoriye gore siralar', () => {
    expect(ids(filterProducts(products, filters({ sort: 'price-asc' }), categories))).toEqual(['p1', 'p2', 'p3'])
    expect(ids(filterProducts(products, filters({ sort: 'price-desc' }), categories))).toEqual(['p3', 'p2', 'p1'])
    expect(ids(filterProducts(products, filters({ sort: 'most-viewed' }), categories))[0]).toBe('p3')
    expect(ids(filterProducts(products, filters({ sort: 'most-favorited' }), categories))[0]).toBe('p2')
    expect(ids(filterProducts(products, filters({ sort: 'oldest' }), categories))).toEqual(['p2', 'p3', 'p1'])
  })

  it('verilen diziyi degistirmez', () => {
    const copy = [...products]
    filterProducts(products, filters({ sort: 'price-desc' }), categories)
    expect(products).toEqual(copy)
  })
})

describe('countActiveFilters', () => {
  it('varsayilan filtrelerde sifirdir', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0)
  })

  it('arama ve siralama sayilmaz, diger filtreler sayilir', () => {
    expect(
      countActiveFilters(filters({ search: 'laptop', sort: 'price-asc', categoryId: 'telefon', minPrice: 0, includeSold: true })),
    ).toBe(3)
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)

  it('istenen sayfayi dondurur', () => {
    expect(paginate(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(paginate(items, 3, 10)).toEqual([21, 22, 23, 24, 25])
  })

  it('son sayfadan sonrasi bos doner', () => {
    expect(paginate(items, 4, 10)).toEqual([])
  })
})
