import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { PageLoader } from '@/components/ui/Feedback'

/** Giriş yapmamış kullanıcıyı, dönüş adresini koruyarak giriş sayfasına yollar. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const { loading } = useStore()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!isAuthenticated) {
    return <Navigate to="/giris" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}

/** Yalnızca Admin rolündeki kullanıcılara açık rotalar. */
export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { loading } = useStore()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!isAuthenticated) {
    return <Navigate to="/giris" state={{ from: location.pathname }} replace />
  }
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
