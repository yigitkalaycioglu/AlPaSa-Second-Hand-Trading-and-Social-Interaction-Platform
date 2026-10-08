import { describe, expect, it } from 'vitest'
import type { Category } from '@/interfaces'
import {
  buildCategoryTree,
  flattenTree,
  getCategoryPath,
  getDescendantIds,
  wouldCreateCycle,
} from '@/lib/categoryTree'

function category(id: string, name: string, parentId: string | null = null): Category {
  return { id, name, parentId, description: '', createdAt: '2026-01-01T00:00:00.000Z' }
}

// Elektronik > Telefon > Aksesuar, Elektronik > Bilgisayar, Giyim
const categories: Category[] = [
  category('elektronik', 'Elektronik'),
  category('telefon', 'Telefon', 'elektronik'),
  category('aksesuar', 'Aksesuar', 'telefon'),
  category('bilgisayar', 'Bilgisayar', 'elektronik'),
  category('giyim', 'Giyim'),
]

describe('buildCategoryTree', () => {
  const counts = new Map([
    ['telefon', 2],
    ['aksesuar', 3],
    ['bilgisayar', 1],
    ['giyim', 4],
  ])
  const tree = buildCategoryTree(categories, counts)

  it('kok kategorileri alfabetik siralar', () => {
    expect(tree.map((n) => n.name)).toEqual(['Elektronik', 'Giyim'])
  })

  it('alt dallardaki ilan sayilarini ust kategoriye toplar', () => {
    const elektronik = tree[0]
    expect(elektronik.productCount).toBe(6)
    expect(elektronik.children.find((c) => c.id === 'telefon')?.productCount).toBe(5)
  })

  it('derinlikleri kokten itibaren atar', () => {
    const flat = flattenTree(tree)
    expect(flat.map((n) => [n.id, n.depth])).toEqual([
      ['elektronik', 0],
      ['bilgisayar', 1],
      ['telefon', 1],
      ['aksesuar', 2],
      ['giyim', 0],
    ])
  })

  it('ust kategorisi listede olmayan kategoriyi koke koyar', () => {
    const orphan = buildCategoryTree([category('yetim', 'Yetim', 'silinmis')], new Map())
    expect(orphan.map((n) => n.id)).toEqual(['yetim'])
  })
})

describe('getDescendantIds', () => {
  it('kategorinin kendisini ve tum alt dallarini dondurur', () => {
    expect([...getDescendantIds(categories, 'elektronik')].sort()).toEqual([
      'aksesuar',
      'bilgisayar',
      'elektronik',
      'telefon',
    ])
  })

  it('yaprak kategoride sadece kendisi doner', () => {
    expect([...getDescendantIds(categories, 'aksesuar')]).toEqual(['aksesuar'])
  })

  it('dongusel veride sonsuz donguye girmez', () => {
    const cyclic = [category('a', 'A', 'b'), category('b', 'B', 'a')]
    expect([...getDescendantIds(cyclic, 'a')].sort()).toEqual(['a', 'b'])
  })
})

describe('getCategoryPath', () => {
  it('kokten hedefe kadar olan zinciri dondurur', () => {
    expect(getCategoryPath(categories, 'aksesuar').map((c) => c.id)).toEqual([
      'elektronik',
      'telefon',
      'aksesuar',
    ])
  })

  it('dongusel veride takilmaz', () => {
    const cyclic = [category('a', 'A', 'b'), category('b', 'B', 'a')]
    expect(getCategoryPath(cyclic, 'a').map((c) => c.id)).toEqual(['b', 'a'])
  })
})

describe('wouldCreateCycle', () => {
  it('kategori kendi altina tasinamaz', () => {
    expect(wouldCreateCycle(categories, 'telefon', 'telefon')).toBe(true)
  })

  it('kategori kendi torununun altina tasinamaz', () => {
    expect(wouldCreateCycle(categories, 'elektronik', 'aksesuar')).toBe(true)
  })

  it('baska bir dala ya da koke tasima serbesttir', () => {
    expect(wouldCreateCycle(categories, 'aksesuar', 'bilgisayar')).toBe(false)
    expect(wouldCreateCycle(categories, 'telefon', null)).toBe(false)
  })
})
