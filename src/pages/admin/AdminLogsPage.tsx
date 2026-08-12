import { ScrollText } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { EmptyState } from '@/components/ui/Feedback'

export function AdminLogsPage() {
  const { adminLogs } = useStore()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">İşlem Gunlugu</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Yoneticilerin yaptigi degisikliklerin kaydı (son 200 işlem).
        </p>
      </header>

      {adminLogs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-8 w-8" />}
          title="Henüz kayıt yok"
          description="Yönetici işlemleri gerceklestikce burada listelenecek."
        />
      ) : (
        <ol className="relative space-y-1 border-l-2 border-slate-200 pl-6 dark:border-slate-800">
          {adminLogs.map((log) => (
            <li key={log.id} className="relative pb-6">
              <span
                aria-hidden
                className="absolute top-1.5 -left-[1.9375rem] h-3 w-3 rounded-full border-2 border-white bg-brand-500 dark:border-slate-950"
              />
              <div className="card-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{log.action}</p>
                  <time
                    dateTime={log.createdAt}
                    title={formatDateTime(log.createdAt)}
                    className="text-xs text-slate-400"
                  >
                    {formatRelativeTime(log.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{log.detail}</p>
                <p className="mt-2 text-xs text-slate-400">{log.actorName}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
