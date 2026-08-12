import { createContext } from 'react'
import type { Toast, ToastVariant } from '@/interfaces'

export interface ToastContextValue {
  toasts: Toast[]
  notify: (message: string, variant?: ToastVariant) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
