import { useMemo } from 'react'
import type { CategoryNode } from '@/interfaces'
import { flattenTree } from '@/lib/categoryTree'
import { Select } from '@/components/ui/Field'

interface CategorySelectProps {
  tree: CategoryNode[]
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  hint?: string
  required?: boolean
  /** Bu kimlige sahip kategori ve alt dalları listelenmez (kendi altina taşıma engeli). */
  excludeId?: string
  placeholder?: string
  allowEmpty?: boolean
}

/** Kategori ağacını girintili tek bir açılır listeye dönüştürür. */
export function CategorySelect({
  tree,
  value,
  onChange,
  label = 'Kategori',
  error,
  hint,
  required,
  excludeId,
  placeholder = 'Kategori seçin',
  allowEmpty = true,
}: CategorySelectProps) {
  const options = useMemo(() => {
    const flat = flattenTree(tree)
    if (!excludeId) return flat

    // Haric tutulan dugum ve tüm torunlarini ele.
    const excluded = new Set<string>()
    const collect = (nodes: CategoryNode[]) => {
      for (const node of nodes) {
        if (node.id === excludeId) {
          const mark = (target: CategoryNode) => {
            excluded.add(target.id)
            target.children.forEach(mark)
          }
          mark(node)
        } else {
          collect(node.children)
        }
      }
    }
    collect(tree)

    return flat.filter((node) => !excluded.has(node.id))
  }, [tree, excludeId])

  return (
    <Select
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={error}
      hint={hint}
      required={required}
    >
      {allowEmpty && <option value="">{placeholder}</option>}
      {options.map((node) => (
        <option key={node.id} value={node.id}>
          {`${'  '.repeat(node.depth)}${node.depth > 0 ? '└ ' : ''}${node.name}`}
        </option>
      ))}
    </Select>
  )
}
