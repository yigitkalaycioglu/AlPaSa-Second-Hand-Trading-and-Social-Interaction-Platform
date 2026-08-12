import { Link } from 'react-router-dom'
import { Github, HardDriveDownload } from 'lucide-react'
import { formatBytes } from '@/lib/format'
import { useStore } from '@/hooks/useStore'
import { LogoMark } from './Logo'

const REPO_URL =
  'https://github.com/yigitkalaycioglu/AlPaSa-Second-Hand-Trading-and-Social-Interaction-Platform'

export function Footer() {
  const { storageUsage, stats } = useStore()

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="text-lg font-extrabold text-slate-800 dark:text-white">AlPaSa</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Kullanmadığın eşyaları değerlendirebileceğin, ihtiyacın olani uygun fiyata
              bulabilecegin ve satıcılarla doğrudan iletisime gecebilecegin ikinci el pazar yeri.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
            >
              <Github className="h-4 w-4" />
              Kaynak kodu GitHub'da
            </a>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Keşfet</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <FooterLink to="/ilanlar">Tüm İlanlar</FooterLink>
              <FooterLink to="/ilan/yeni">İlan Ver</FooterLink>
              <FooterLink to="/favorilerim">Favorilerim</FooterLink>
              <FooterLink to="/mesajlar">Mesajlarim</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Platform</h3>
            <dl className="mt-4 space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex justify-between gap-4">
                <dt>Aktif ilan</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">
                  {stats.activeProducts}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Kategori</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">
                  {stats.totalCategories}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Üye</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">
                  {stats.totalUsers}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p>&copy; {new Date().getFullYear()} AlPaSa. Açık kaynak örnek proje.</p>
          <p className="flex items-center gap-1.5" title="Veriler tarayıcınızın localStorage alanında tutulur">
            <HardDriveDownload className="h-3.5 w-3.5" />
            Yerel depolama: {formatBytes(storageUsage)}
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        {children}
      </Link>
    </li>
  )
}
