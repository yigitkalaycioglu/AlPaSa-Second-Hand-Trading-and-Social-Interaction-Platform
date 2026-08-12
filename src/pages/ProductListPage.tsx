import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react'
import type { ProductFilters } from '@/interfaces'
import { useStore } from '@/hooks/useStore'
import { useDebounce } from '@/hooks/useDebounce'
import { getCategoryPath } from '@/lib/categoryTree'
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  countActiveFilters,
  filterProducts,
  paginate,
} from '@/lib/productFilters'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/Feedback'
import { Pagination } from '@/components/common/Pagination'
import { CategoryTree } from '@/components/category/CategoryTree'
import { FilterPanel } from '@/components/product/FilterPanel'
import { ProductCard } from '@/components/product/ProductCard'

const PER_PAGE = 12

/**
 * İlan listeleme sayfası - LİSTELEME işlemi.
 * Arama, iç içe kategori filtresi, fiyat/durum/şehir filtreleri,
 * sıralama ve sayfalama tek ekranda toplanır.
 */
export function ProductListPage() {
  const { productListItems, categories, categoryTree, cities } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get('q') ?? '',
    categoryId: searchParams.get('kategori'),
  }))
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const debouncedSearch = useDebounce(filters.search, 300)

  // URL <-> filtre eşleşmesi: paylaşılabilir bağlantılar için.
  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim())
    if (filters.categoryId) next.set('kategori', filters.categoryId)
    setSearchParams(next, { replace: true })
  }, [debouncedSearch, filters.categoryId, setSearchParams])

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  )

  const filtered = useMemo(
    () => filterProducts(productListItems, effectiveFilters, categories),
    [productListItems, effectiveFilters, categories],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visible = paginate(filtered, currentPage, PER_PAGE)

  const activeCount = countActiveFilters(effectiveFilters)
  const breadcrumb = filters.categoryId ? getCategoryPath(categories, filters.categoryId) : []

  const patchFilters = (patch: Partial<ProductFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, search: filters.search })
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">İlanlar</h1>

        {breadcrumb.length > 0 ? (
          <nav aria-label="Kategori yolu" className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => patchFilters({ categoryId: null })}
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              Tüm kategoriler
            </button>
            {breadcrumb.map((category, index) => (
              <span key={category.id} className="flex items-center gap-1.5">
                <span className="text-slate-300">/</span>
                {index === breadcrumb.length - 1 ? (
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {category.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => patchFilters({ categoryId: category.id })}
                    className="text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {category.name}
                  </button>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Platformdaki tüm ikinci el ilanları keşfet.
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* ============ Yan panel ============ */}
        <aside
          className={`space-y-5 lg:block ${mobileFiltersOpen ? 'block' : 'hidden'}`}
          aria-label="Filtreler"
        >
          <div className="card-surface p-5">
            <h2 className="mb-4 font-bold text-slate-800 dark:text-slate-100">Kategoriler</h2>
            <CategoryTree
              nodes={categoryTree}
              selectedId={filters.categoryId}
              onSelect={(id) => patchFilters({ categoryId: id })}
              totalCount={productListItems.filter((p) => !p.isSold).length}
            />
          </div>

          <FilterPanel
            filters={effectiveFilters}
            cities={cities}
            onChange={patchFilters}
            onReset={resetFilters}
            activeCount={activeCount}
          />
        </aside>

        {/* ============ Sonuçlar ============ */}
        <div>
          <div className="card-surface mb-6 flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => patchFilters({ search: event.target.value })}
                placeholder="İlan, kategori veya satıcı ara..."
                aria-label="İlan ara"
                className="h-11 w-full rounded-xl border border-slate-300 pr-4 pl-10 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => patchFilters({ search: '' })}
                  aria-label="Aramayı temizle"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="w-52">
              <Select
                aria-label="Sıralama"
                value={effectiveFilters.sort}
                onChange={(event) =>
                  patchFilters({ sort: event.target.value as ProductFilters['sort'] })
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtre{activeCount > 0 && ` (${activeCount})`}
            </Button>
          </div>

          <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
            <strong className="font-semibold text-slate-700 dark:text-slate-200">
              {filtered.length}
            </strong>{' '}
            ilan bulundu
            {filtered.length > PER_PAGE && ` · sayfa ${currentPage}/${totalPages}`}
          </p>

          {visible.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="h-8 w-8" />}
              title="Aradığınız kriterlere uygun ilan yok"
              description="Filtreleri gevşetmeyi veya farklı bir arama terimi denemeyi deneyin."
              action={
                activeCount > 0 || filters.search ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters(DEFAULT_FILTERS)
                      setPage(1)
                    }}
                  >
                    Tüm filtreleri temizle
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-10">
                <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
