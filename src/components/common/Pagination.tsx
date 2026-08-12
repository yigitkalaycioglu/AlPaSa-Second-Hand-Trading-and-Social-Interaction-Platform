import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Çok sayfali listelerde 1 ... 4 5 6 ... 20 şeklinde kisaltilmis sayfalama. */
function buildPages(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: (number | 'gap')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  if (start > 2) pages.push('gap')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('gap')

  pages.push(totalPages)
  return pages
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPages(page, totalPages)

  const buttonClass = (active = false) =>
    cn(
      'flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
      active
        ? 'bg-brand-600 text-white shadow-sm'
        : 'border border-slate-300 text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500',
      'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-600',
    )

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Sayfalama">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Önceki sayfa"
        className={buttonClass()}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((entry, index) =>
        entry === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-slate-400">
            &hellip;
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            aria-current={entry === page ? 'page' : undefined}
            className={buttonClass(entry === page)}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Sonraki sayfa"
        className={buttonClass()}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
