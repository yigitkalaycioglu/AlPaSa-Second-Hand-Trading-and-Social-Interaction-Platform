import { useState } from 'react'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import type { CategoryNode } from '@/interfaces'
import { cn } from '@/lib/cn'

interface CategoryTreeProps {
  nodes: CategoryNode[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  totalCount: number
}

/** Sınırsız derinlikte, açılır-kapanır kategori ağacı (akordiyon). */
export function CategoryTree({ nodes, selectedId, onSelect, totalCount }: CategoryTreeProps) {
  return (
    <nav aria-label="Kategoriler" className="space-y-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all',
          selectedId === null
            ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm'
            : 'text-slate-700 hover:translate-x-1 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-brand-500/10 dark:hover:text-brand-300',
        )}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Tüm Kategoriler</span>
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-xs font-bold',
            selectedId === null
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
          )}
        >
          {totalCount}
        </span>
      </button>

      {nodes.map((node) => (
        <CategoryBranch key={node.id} node={node} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </nav>
  )
}

function CategoryBranch({
  node,
  selectedId,
  onSelect,
}: {
  node: CategoryNode
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  // Seçili dal aciksa baslasin ki kullanıcı nerede olduğunu gorsun.
  const [expanded, setExpanded] = useState(() => containsId(node, selectedId))
  const hasChildren = node.children.length > 0
  const isSelected = node.id === selectedId

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 rounded-lg transition-all',
          isSelected
            ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm'
            : 'text-slate-700 hover:translate-x-1 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-brand-500/10 dark:hover:text-brand-300',
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-label={expanded ? `${node.name} alt kategorilerini gizle` : `${node.name} alt kategorilerini göster`}
            aria-expanded={expanded}
            className="shrink-0 rounded p-1.5 opacity-70 transition-transform hover:opacity-100"
          >
            <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="flex flex-1 items-center gap-2 py-2 pr-3 text-left text-sm font-medium"
        >
          <span className="flex-1 truncate">{node.name}</span>
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-xs font-bold',
              isSelected
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
            )}
          >
            {node.productCount}
          </span>
        </button>
      </div>

      {hasChildren && expanded && (
        <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 pl-2 dark:border-slate-700">
          {node.children.map((child) => (
            <CategoryBranch key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Seçili kategori bu dalın altinda mi? (başlangıçta açık gelmesi için) */
function containsId(node: CategoryNode, id: string | null): boolean {
  if (!id) return false
  if (node.id === id) return true
  return node.children.some((child) => containsId(child, id))
}
