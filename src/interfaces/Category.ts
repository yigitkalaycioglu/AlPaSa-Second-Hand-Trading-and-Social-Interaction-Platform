/**
 * Kategori. `parentId` ile sınırsız derinlikte ağaç kurulabilir
 * (örn. Elektronik > Bilgisayar > Donanım > Ekran Kartı).
 */
export interface Category {
  id: string
  name: string
  description: string
  /** Üst kategori kimliği; kök kategorilerde null. */
  parentId: string | null
  /** Lucide ikon adı (örn. "Laptop"). Arayüzde kategori rozetinde kullanılır. */
  icon?: string
  createdAt: string
}

/** Ağaç görünümü için alt dalları çözülmüş kategori. */
export interface CategoryNode extends Category {
  children: CategoryNode[]
  /** Bu kategori ve tüm alt kategorilerindeki ilan sayısı. */
  productCount: number
  /** Kökten uzaklık (0 = ana kategori). Girinti hesabında kullanılır. */
  depth: number
}

export interface CategoryFormValues {
  name: string
  description: string
  parentId: string | null
  icon?: string
}
