import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import type { PublicUser, UserRole } from '@/interfaces'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/format'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { ConfirmBody, EmptyState } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'

export function AdminUsersPage() {
  const { currentUser } = useAuth()
  const { users, products, setUserRole, deleteUser } = useStore()
  const { notify } = useToast()

  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<PublicUser | null>(null)

  const listingCountByUser = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of products) {
      counts.set(product.sellerId, (counts.get(product.sellerId) ?? 0) + 1)
    }
    return counts
  }, [products])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr')
    const sorted = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (!needle) return sorted

    return sorted.filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email}`.toLocaleLowerCase('tr').includes(needle),
    )
  }, [users, query])

  const handleRoleChange = (user: PublicUser, role: UserRole) => {
    if (!currentUser) return
    if (user.id === currentUser.id) {
      notify('Kendi rolünüzü değiştiremezsiniz.', 'error')
      return
    }
    setUserRole(user.id, role, currentUser)
    notify(`${user.email} için rol "${role}" olarak güncellendi.`, 'success')
  }

  const handleDelete = () => {
    if (!pendingDelete || !currentUser) return
    deleteUser(pendingDelete.id, currentUser)
    notify('Kullanıcı ve tüm verileri silindi.', 'success')
    setPendingDelete(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Kullanıcılar</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {users.length} kayıtlı üye. Rolleri değiştirin veya hesapları kaldırın.
        </p>
      </header>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="İsim veya e-posta ara..."
          aria-label="Kullanıcı ara"
          className="h-11 w-full rounded-xl border border-slate-300 pr-4 pl-10 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UserRound className="h-8 w-8" />}
          title="Kullanıcı bulunamadı"
          description="Farklı bir arama terimi deneyin."
        />
      ) : (
        <div className="card-surface divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((user) => {
            const isSelf = user.id === currentUser?.id
            return (
              <div key={user.id} className="flex flex-wrap items-center gap-4 p-4">
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  src={user.avatar}
                  size="md"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/satici/${user.id}`}
                      className="truncate font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100"
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                    {user.role === 'Admin' && (
                      <Badge tone="brand">
                        <ShieldCheck className="h-3 w-3" />
                        Yönetici
                      </Badge>
                    )}
                    {isSelf && <Badge tone="success">Siz</Badge>}
                  </div>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {listingCountByUser.get(user.id) ?? 0} ilan · {formatDate(user.createdAt)}{' '}
                    tarihinde katıldı
                  </p>
                </div>

                <div className="w-36 shrink-0">
                  <Select
                    aria-label={`${user.email} rolü`}
                    value={user.role}
                    disabled={isSelf}
                    onChange={(event) => handleRoleChange(user, event.target.value as UserRole)}
                  >
                    <option value="User">Üye</option>
                    <option value="Admin">Yönetici</option>
                  </Select>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  disabled={isSelf}
                  onClick={() => setPendingDelete(user)}
                  aria-label={`${user.email} hesabını sil`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Kullanıcıyı sil"
        size="sm"
      >
        <ConfirmBody
          message={
            pendingDelete
              ? `${pendingDelete.firstName} ${pendingDelete.lastName} hesabını silmek istiyor musunuz?`
              : 'Kullanıcıyı sil'
          }
          detail="Kullanıcının tüm ilanları, favorileri, takipleri ve mesajları da silinir. Bu işlem geri alınamaz."
          confirmLabel="Evet, sil"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      </Modal>
    </div>
  )
}
