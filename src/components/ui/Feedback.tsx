import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react'
import type { ToastVariant } from '@/interfaces'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { Button } from './Button'

// =============== Bildirimler ===============

const TOAST_STYLES: Record<ToastVariant, { icon: ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    className: 'border-emerald-200 dark:border-emerald-500/30',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    className: 'border-red-200 dark:border-red-500/30',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    className: 'border-amber-200 dark:border-amber-500/30',
  },
  info: {
    icon: <Info className="h-5 w-5 text-brand-500" />,
    className: 'border-brand-200 dark:border-brand-500/30',
  },
}

/** Sağ üst kosede yığılan bildirimler. */
export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed top-20 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.variant]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex animate-slide-in-right items-start gap-3 rounded-xl border bg-white p-4 shadow-lg',
              'dark:bg-slate-900',
              style.className,
            )}
          >
            <span className="shrink-0">{style.icon}</span>
            <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Bildirimi kapat"
              className="shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// =============== Boş durum ===============

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// =============== Yükleniyor ===============

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-6 w-6 animate-spin text-brand-500', className)} aria-hidden />
}

export function PageLoader({ label = 'Yükleniyor...' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

/** İçerik yuklenirken gösterilen parlayan yer tutucu. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-slate-200 dark:bg-slate-800',
        'bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%]',
        className,
      )}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  )
}

// =============== Onay penceresi ===============

interface ConfirmBodyProps {
  message: string
  detail?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

/** Modal içine yerleştirilecek onay govdesi + butonları. */
export function ConfirmBody({
  message,
  detail,
  confirmLabel = 'Evet, devam et',
  cancelLabel = 'Vazgeç',
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmBodyProps) {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            destructive
              ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
              : 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
          )}
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{message}</p>
          {detail && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}
