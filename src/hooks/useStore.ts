import { useContext } from 'react'
import { StoreContext } from '@/context/store-context'

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore, StoreProvider içinde kullanılmalıdır.')
  }
  return context
}
