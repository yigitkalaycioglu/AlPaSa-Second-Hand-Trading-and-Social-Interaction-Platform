import { useState } from 'react'
import { ChevronRight, FolderPlus, FolderTree, Pencil, Trash2 } from 'lucide-react'
import type { CategoryFormValues, CategoryNode } from '@/interfaces'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { type Errors, hasErrors, maxLength, minLength, required } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { ConfirmBody, EmptyState } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { CategorySelect } from '@/components/category/CategorySelect'

const EMPTY_FORM: CategoryFormValues = { name: '', description: '', parentId: null }

/** Kategori ağacının tam CRUD yönetimi (yalnızca Admin). */
export function AdminCategoriesPage() {
  const { currentUser } = useAuth()
  const { categoryTree, addCategory, updateCategory, deleteCategory } = useStore()
  const { notify } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [values, setValues] = useState<CategoryFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<Errors<CategoryFormValues>>({})
  const [pendingDelete, setPendingDelete] = useState<CategoryNode | null>(null)

  const openCreate = (parentId: string | null = null) => {
    setEditingId(null)
    setValues({ ...EMPTY_FORM, parentId })
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (node: CategoryNode) => {
    setEditingId(node.id)
    setValues({ name: node.name, description: node.description, parentId: node.parentId })
    setErrors({})
    setFormOpen(true)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) return

    const next: Errors<CategoryFormValues> = {
      name:
        required(values.name, 'Kategori adı') ??
        minLength(values.name, 2, 'Kategori adı') ??
        maxLength(values.name, 50, 'Kategori adı'),
      description: maxLength(values.description, 200, 'Açıklama'),
    }
    setErrors(next)
    if (hasErrors(next)) return

    const ok = editingId
      ? updateCategory(editingId, values, currentUser)
      : addCategory(values, currentUser)

    if (ok) {
      notify(editingId ? 'Kategori güncellendi.' : 'Kategori eklendi.', 'success')
      setFormOpen(false)
    }
  }

  const handleDelete = () => {
    if (!pendingDelete || !currentUser) return

    const result = deleteCategory(pendingDelete.id, currentUser)
    if (result.ok) {
      notify('Kategori silindi.', 'success')
    } else {
      notify(result.reason ?? 'Kategori silinemedi.', 'error')
    }
    setPendingDelete(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Kategoriler</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Sınırsız derinlikte kategori ağacını buradan yönetin.
          </p>
        </div>
        <Button onClick={() => openCreate(null)}>
          <FolderPlus className="h-4 w-4" />
          Yeni Kategori
        </Button>
      </header>

      {categoryTree.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-8 w-8" />}
          title="Henüz kategori yok"
          description="İlk ana kategoriyi oluşturarak başlayın."
          action={<Button onClick={() => openCreate(null)}>Kategori ekle</Button>}
        />
      ) : (
        <div className="card-surface divide-y divide-slate-100 p-2 dark:divide-slate-800">
          {categoryTree.map((node) => (
            <CategoryRow
              key={node.id}
              node={node}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onAddChild={openCreate}
            />
          ))}
        </div>
      )}

      {/* ============ Ekleme / düzenleme formu ============ */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Kategoriyi düzenle' : 'Yeni kategori'}
        description={
          editingId
            ? 'Kategori bilgilerini ve ağaçtaki konumunu değiştirin.'
            : 'Üst kategori seçerseniz alt kategori olarak eklenir.'
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Kategori adı"
            required
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            error={errors.name}
            placeholder="Örn. Ekran Kartı"
            maxLength={50}
          />

          <Textarea
            label="Açıklama"
            rows={3}
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
            error={errors.description}
            maxLength={200}
            placeholder="Bu kategoride ne tür ürünler yer alır?"
          />

          <CategorySelect
            tree={categoryTree}
            value={values.parentId ?? ''}
            onChange={(parentId) => setValues({ ...values, parentId: parentId || null })}
            label="Üst kategori"
            placeholder="Ana kategori (üst yok)"
            excludeId={editingId ?? undefined}
            hint="Bir kategori kendi alt kategorisinin altına taşınamaz."
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit">{editingId ? 'Güncelle' : 'Ekle'}</Button>
          </div>
        </form>
      </Modal>

      {/* ============ Silme onayı ============ */}
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Kategoriyi sil"
        size="sm"
      >
        <ConfirmBody
          message={
            pendingDelete
              ? `"${pendingDelete.name}" kategorisini silmek istiyor musunuz?`
              : 'Kategoriyi sil'
          }
          detail="Alt kategorisi veya ilanı olan kategoriler silinemez."
          confirmLabel="Evet, sil"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      </Modal>
    </div>
  )
}

function CategoryRow({
  node,
  onEdit,
  onDelete,
  onAddChild,
  depth = 0,
}: {
  node: CategoryNode
  onEdit: (node: CategoryNode) => void
  onDelete: (node: CategoryNode) => void
  onAddChild: (parentId: string) => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Alt kategorileri gizle' : 'Alt kategorileri göster'}
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} />
          </button>
        ) : (
          <span className="w-6" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{node.name}</p>
          {node.description && (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {node.description}
            </p>
          )}
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {node.productCount} ilan
        </span>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onAddChild(node.id)}
            aria-label={`${node.name} altına kategori ekle`}
            title="Alt kategori ekle"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(node)}
            aria-label={`${node.name} kategorisini düzenle`}
            title="Düzenle"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(node)}
            aria-label={`${node.name} kategorisini sil`}
            title="Sil"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <CategoryRow
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
