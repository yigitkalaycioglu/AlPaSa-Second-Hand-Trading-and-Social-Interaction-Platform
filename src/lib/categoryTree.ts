import type { Category, CategoryNode } from '@/interfaces'

/**
 * Düz kategori listesini ağaca çevirir ve her düğüme, kendisi dahil tüm
 * alt dallarındaki ilan sayısını yazar.
 */
export function buildCategoryTree(
  categories: Category[],
  productCountByCategory: Map<string, number>,
): CategoryNode[] {
  const nodeById = new Map<string, CategoryNode>()

  for (const category of categories) {
    nodeById.set(category.id, {
      ...category,
      children: [],
      productCount: productCountByCategory.get(category.id) ?? 0,
      depth: 0,
    })
  }

  const roots: CategoryNode[] = []

  for (const node of nodeById.values()) {
    if (node.parentId && nodeById.has(node.parentId)) {
      nodeById.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // Derinlikleri ata ve alt dallardaki sayımları yukarı topla.
  const assign = (node: CategoryNode, depth: number): number => {
    node.depth = depth
    node.children.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    let total = node.productCount
    for (const child of node.children) {
      total += assign(child, depth + 1)
    }
    node.productCount = total
    return total
  }

  roots.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  roots.forEach((root) => assign(root, 0))

  return roots
}

/**
 * Bir kategorinin kendisi ve tüm alt kategorilerinin kimliklerini döndürür.
 * "Elektronik" seçildiğinde alt dallardaki ilanların da listelenmesini sağlar.
 */
export function getDescendantIds(categories: Category[], rootId: string): Set<string> {
  const childrenByParent = new Map<string, string[]>()
  for (const category of categories) {
    if (!category.parentId) continue
    const siblings = childrenByParent.get(category.parentId) ?? []
    siblings.push(category.id)
    childrenByParent.set(category.parentId, siblings)
  }

  const result = new Set<string>([rootId])
  const queue = [rootId]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const child of childrenByParent.get(current) ?? []) {
      if (result.has(child)) continue // döngüsel veriye karşı koruma
      result.add(child)
      queue.push(child)
    }
  }

  return result
}

/** Kökten hedefe kadar olan kategori zinciri (breadcrumb için). */
export function getCategoryPath(categories: Category[], categoryId: string): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const path: Category[] = []
  const seen = new Set<string>()

  let current = byId.get(categoryId)
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    path.unshift(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }

  return path
}

/** Ağacı, girintili <select> seçenekleri için düz listeye açar. */
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = []
  const walk = (list: CategoryNode[]) => {
    for (const node of list) {
      result.push(node)
      walk(node.children)
    }
  }
  walk(nodes)
  return result
}

/**
 * Bir kategoriyi başka bir kategorinin altına taşımak döngü oluşturur mu?
 * (Kategori kendi torununun altına taşınamaz.)
 */
export function wouldCreateCycle(
  categories: Category[],
  categoryId: string,
  newParentId: string | null,
): boolean {
  if (!newParentId) return false
  if (categoryId === newParentId) return true
  return getDescendantIds(categories, categoryId).has(newParentId)
}
