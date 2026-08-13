import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  PackagePlus,
  Search,
  Store,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Logo } from './Logo'

export function Navbar() {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth()
  const { unreadCountOf, favorites } = useStore()
  const { notify } = useToast()

  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const unread = unreadCountOf(currentUser?.id)
  const favoriteCount = currentUser
    ? favorites.filter((favorite) => favorite.userId === currentUser.id).length
    : 0

  // Dışarı tıklanınca kullanıcı menüsünü kapat
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/ilanlar?q=${encodeURIComponent(query)}` : '/ilanlar')
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    setMobileOpen(false)
    notify('Çıkış yapıldı. Görüşmek üzere!', 'info')
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
    )

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Masaüstü arama */}
        <form onSubmit={handleSearch} className="hidden flex-1 justify-center lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ne aramıştınız?"
              aria-label="İlan ara"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white/70 pr-4 pl-10 text-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            />
          </div>
        </form>

        {/* Masaüstü gezinme */}
        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <NavLink to="/ilanlar" className={navLinkClass}>
            İlanlar
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/favorilerim" className={navLinkClass} aria-label="Favorilerim">
                <span className="relative flex items-center gap-1.5">
                  <Heart className="h-4 w-4" />
                  {favoriteCount > 0 && (
                    <span className="rounded-full bg-brand-100 px-1.5 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      {favoriteCount}
                    </span>
                  )}
                </span>
              </NavLink>

              <NavLink to="/mesajlar" className={navLinkClass} aria-label="Mesajlar">
                <span className="relative flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.625rem] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </span>
              </NavLink>
            </>
          )}

          <ThemeToggle />

          {isAuthenticated && currentUser ? (
            <div className="relative ml-1" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Avatar
                  firstName={currentUser.firstName}
                  lastName={currentUser.lastName}
                  src={currentUser.avatar}
                  size="sm"
                />
                <span className="max-w-24 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {currentUser.firstName}
                </span>
              </button>

              {menuOpen && (
                <div
                  role="menü"
                  className="absolute right-0 mt-2 w-60 animate-scale-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {currentUser.email}
                    </p>
                  </div>

                  <div className="p-1.5">
                    <MenuItem to="/ilan/yeni" icon={<PackagePlus className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                      Yeni İlan Ver
                    </MenuItem>
                    <MenuItem to="/ilanlarim" icon={<Store className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                      İlanlarım
                    </MenuItem>
                    <MenuItem to="/profil" icon={<UserIcon className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                      Profilim
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem to="/yonetim" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                        Yönetim Paneli
                      </MenuItem>
                    )}
                  </div>

                  <div className="border-t border-slate-100 p-1.5 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/giris">
                <Button variant="ghost" size="sm">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/kayit">
                <Button size="sm">Kayıt Ol</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobil kontroller */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menüyü aç/kapat"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="animate-slide-up border-t border-slate-200 bg-white px-4 py-4 lg:hidden dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ne aramıştınız?"
                aria-label="İlan ara"
                className="h-11 w-full rounded-xl border border-slate-300 pr-4 pl-10 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </form>

          <div className="flex flex-col gap-1">
            <MobileLink to="/ilanlar" onClick={() => setMobileOpen(false)}>
              Tüm İlanlar
            </MobileLink>

            {isAuthenticated && currentUser ? (
              <>
                <MobileLink to="/ilan/yeni" onClick={() => setMobileOpen(false)}>
                  Yeni İlan Ver
                </MobileLink>
                <MobileLink to="/ilanlarim" onClick={() => setMobileOpen(false)}>
                  İlanlarım
                </MobileLink>
                <MobileLink to="/favorilerim" onClick={() => setMobileOpen(false)}>
                  Favorilerim {favoriteCount > 0 && `(${favoriteCount})`}
                </MobileLink>
                <MobileLink to="/mesajlar" onClick={() => setMobileOpen(false)}>
                  Mesajlar {unread > 0 && `(${unread})`}
                </MobileLink>
                <MobileLink to="/profil" onClick={() => setMobileOpen(false)}>
                  Profilim
                </MobileLink>
                {isAdmin && (
                  <MobileLink to="/yonetim" onClick={() => setMobileOpen(false)}>
                    Yönetim Paneli
                  </MobileLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link to="/giris" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Giriş Yap
                  </Button>
                </Link>
                <Link to="/kayit" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Kayıt Ol</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function MenuItem({
  to,
  icon,
  children,
  onClick,
}: {
  to: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {icon}
      {children}
    </Link>
  )
}

function MobileLink({
  to,
  children,
  onClick,
}: {
  to: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
        )
      }
    >
      {children}
    </NavLink>
  )
}
