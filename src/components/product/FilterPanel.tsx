import { SlidersHorizontal, X } from 'lucide-react'
import { PRODUCT_CONDITIONS, type ProductCondition, type ProductFilters } from '@/interfaces'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'

interface FilterPanelProps {
  filters: ProductFilters
  cities: string[]
  onChange: (patch: Partial<ProductFilters>) => void
  onReset: () => void
  activeCount: number
}

export function FilterPanel({ filters, cities, onChange, onReset, activeCount }: FilterPanelProps) {
  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
          <SlidersHorizontal className="h-4 w-4" />
          Filtreler
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-3.5 w-3.5" />
            Temizle
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="En az"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={filters.minPrice ?? ''}
            onChange={(event) =>
              onChange({ minPrice: event.target.value === '' ? null : Number(event.target.value) })
            }
          />
          <Input
            label="En fazla"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="-"
            value={filters.maxPrice ?? ''}
            onChange={(event) =>
              onChange({ maxPrice: event.target.value === '' ? null : Number(event.target.value) })
            }
          />
        </div>

        <Select
          label="Durum"
          value={filters.condition ?? ''}
          onChange={(event) =>
            onChange({ condition: (event.target.value || null) as ProductCondition | null })
          }
        >
          <option value="">Tüm durumlar</option>
          {PRODUCT_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </Select>

        <Select
          label="Şehir"
          value={filters.city ?? ''}
          onChange={(event) => onChange({ city: event.target.value || null })}
        >
          <option value="">Tüm şehirler</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-1 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={filters.includeSold}
            onChange={(event) => onChange({ includeSold: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800"
          />
          Satılmış ilanları da göster
        </label>
      </div>
    </div>
  )
}
