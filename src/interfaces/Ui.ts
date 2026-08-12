export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  variant: ToastVariant
  message: string
}

export interface SortOption<T extends string = string> {
  value: T
  label: string
}

/** Yönetici panosundaki özet istatistikler. */
export interface Stats {
  totalUsers: number
  totalProducts: number
  soldProducts: number
  activeProducts: number
  totalCategories: number
  totalMessages: number
  totalFavorites: number
  totalValue: number
}
