import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useStore } from '@/hooks/useStore'
import { PageLoader, Toaster } from '@/components/ui/Feedback'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

/** Rota değiştiğinde sayfayı başa sarar. */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export function AppLayout() {
  const { loading } = useStore()

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        {loading ? <PageLoader label="AlPaSa hazırlanıyor..." /> : <Outlet />}
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
