import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeProvider'
import { ToastProvider } from '@/context/ToastProvider'
import { StoreProvider } from '@/context/StoreProvider'
import { AuthProvider } from '@/context/AuthProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminRoute, ProtectedRoute } from '@/components/common/RouteGuards'

import { HomePage } from '@/pages/HomePage'
import { ProductListPage } from '@/pages/ProductListPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { ProductFormPage } from '@/pages/ProductFormPage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { SellerProfilePage } from '@/pages/SellerProfilePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminLogsPage } from '@/pages/admin/AdminLogsPage'

/*
  Saglayici sırası önemlidir:
  Theme -> Toast -> Store -> Auth
  Store, kota hatalarını bildirmek için Toast'a; Auth ise kullanıcı
  kayıtlarını okumak için Store'a ihtiyaç duyar.
*/
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <StoreProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  {/* --- Herkese açık --- */}
                  <Route index element={<HomePage />} />
                  <Route path="ilanlar" element={<ProductListPage />} />
                  <Route path="ilan/:id" element={<ProductDetailPage />} />
                  <Route path="satici/:id" element={<SellerProfilePage />} />
                  <Route path="giris" element={<LoginPage />} />
                  <Route path="kayit" element={<RegisterPage />} />

                  {/* --- Giriş gerektiren --- */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="ilan/yeni" element={<ProductFormPage />} />
                    <Route path="ilan/:id/duzenle" element={<ProductFormPage />} />
                    <Route path="ilanlarim" element={<MyListingsPage />} />
                    <Route path="favorilerim" element={<FavoritesPage />} />
                    <Route path="mesajlar" element={<MessagesPage />} />
                    <Route path="profil" element={<ProfilePage />} />
                  </Route>

                  {/* --- Yalnızca yönetici --- */}
                  <Route element={<AdminRoute />}>
                    <Route path="yonetim" element={<AdminDashboardPage />} />
                    <Route path="yonetim/kategoriler" element={<AdminCategoriesPage />} />
                    <Route path="yonetim/kullanicilar" element={<AdminUsersPage />} />
                    <Route path="yonetim/gunluk" element={<AdminLogsPage />} />
                  </Route>

                  {/* Eski/yanlış adresler ana sayfaya, geri kalani 404'e */}
                  <Route path="home" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </StoreProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
