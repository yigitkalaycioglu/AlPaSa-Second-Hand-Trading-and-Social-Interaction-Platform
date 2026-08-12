import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-28 text-center">
      <p className="bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-8xl font-extrabold text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
        Bu sayfa bulunamadı
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Aradığınız sayfa tasinmis, silinmiş veya adresi yanlış yazilmis olabilir.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button>
            <Home className="h-4 w-4" />
            Ana sayfaya dön
          </Button>
        </Link>
        <Link to="/ilanlar">
          <Button variant="outline">
            <Search className="h-4 w-4" />
            Ilanlara göz at
          </Button>
        </Link>
      </div>
    </div>
  )
}
