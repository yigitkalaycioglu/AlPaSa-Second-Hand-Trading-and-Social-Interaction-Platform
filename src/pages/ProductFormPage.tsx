import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { PRODUCT_CONDITIONS, type ProductCondition, type ProductFormValues } from '@/interfaces'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { type Errors, hasErrors, maxLength, minLength, required, validatePrice } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { CategorySelect } from '@/components/category/CategorySelect'
import { ImageUploader } from '@/components/product/ImageUploader'

const EMPTY_FORM: ProductFormValues = {
  title: '',
  description: '',
  price: '',
  condition: 'İyi',
  categoryId: '',
  city: '',
  images: [],
  isSold: false,
}

/**
 * Tek form, iki işlem:
 * - /ilan/yeni      -> EKLEME
 * - /ilan/:id/düzenle -> GÜNCELLEME
 */
export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const navigate = useNavigate()
  const { currentUser, isAdmin } = useAuth()
  const { products, categoryTree, addProduct, updateProduct } = useStore()
  const { notify } = useToast()

  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<Errors<ProductFormValues>>({})
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Düzenleme modunda mevcut ilanı forma yükle.
  useEffect(() => {
    if (!isEdit || !id) return

    const product = products.find((item) => item.id === id)
    if (!product) {
      setNotFound(true)
      return
    }

    // Baskasinin ilanını duzenlemeye çalışan kullanıcıyı geri gönder.
    if (product.sellerId !== currentUser?.id && !isAdmin) {
      notify('Bu ilanı düzenleme yetkiniz yok.', 'error')
      navigate(`/ilan/${id}`, { replace: true })
      return
    }

    setValues({
      title: product.title,
      description: product.description,
      price: String(product.price),
      condition: product.condition,
      categoryId: product.categoryId,
      city: product.city,
      images: product.images,
      isSold: product.isSold,
    })
  }, [isEdit, id, products, currentUser, isAdmin, navigate, notify])

  const patch = (update: Partial<ProductFormValues>) => {
    setValues((current) => ({ ...current, ...update }))
  }

  const validate = (): boolean => {
    const next: Errors<ProductFormValues> = {
      title:
        required(values.title, 'İlan başlığı') ??
        minLength(values.title, 5, 'İlan başlığı') ??
        maxLength(values.title, 100, 'İlan başlığı'),
      description:
        required(values.description, 'Açıklama') ??
        minLength(values.description, 20, 'Açıklama') ??
        maxLength(values.description, 2000, 'Açıklama'),
      price: validatePrice(values.price),
      categoryId: values.categoryId ? undefined : 'Kategori seçmelisiniz.',
      city: required(values.city, 'Şehir'),
    }

    setErrors(next)
    return !hasErrors(next)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) return

    if (!validate()) {
      notify('Lütfen formdaki hataları düzeltin.', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit && id) {
        if (updateProduct(id, values)) {
          notify('İlan güncellendi.', 'success')
          navigate(`/ilan/${id}`)
        }
      } else {
        const created = addProduct(values, currentUser.id)
        if (created) {
          notify('İlanınız yayınlandı!', 'success')
          navigate(`/ilan/${created.id}`)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">İlan bulunamadı</h1>
        <p className="mt-2 text-slate-500">Düzenlemek istediğiniz ilan silinmiş olabilir.</p>
        <Link to="/ilanlarim" className="mt-6 inline-block">
          <Button variant="outline">İlanlarıma dön</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to={isEdit && id ? `/ilan/${id}` : '/ilanlarim'}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Geri
      </Link>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        {isEdit ? 'İlanı düzenle' : 'Yeni ilan ver'}
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        {isEdit
          ? 'Degisiklikleriniz kaydedildikten sonra ilan sayfasinda görünür.'
          : 'Ürününüzü iyi anlatan bir başlık ve net fotoğraflar, satışı hızlandırır.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        <div className="card-surface space-y-5 p-6">
          <Input
            label="İlan başlığı"
            required
            value={values.title}
            onChange={(event) => patch({ title: event.target.value })}
            error={errors.title}
            placeholder="Örn. MacBook Air M1 - 8GB / 256GB"
            maxLength={100}
          />

          <Textarea
            label="Açıklama"
            required
            rows={7}
            value={values.description}
            onChange={(event) => patch({ description: event.target.value })}
            error={errors.description}
            hint={`${values.description.length}/2000 karakter · Ürünün durumunu, kusurlarını ve aksesuarlarını yazın.`}
            placeholder="Ürünün yaşı, kullanım durumu, varsa kusurları ve kutu/aksesuar bilgisi..."
            maxLength={2000}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Fiyat (TL)"
              required
              inputMode="decimal"
              value={values.price}
              onChange={(event) => patch({ price: event.target.value })}
              error={errors.price}
              placeholder="0"
            />

            <Select
              label="Ürün durumu"
              required
              value={values.condition}
              onChange={(event) => patch({ condition: event.target.value as ProductCondition })}
            >
              {PRODUCT_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <CategorySelect
              tree={categoryTree}
              value={values.categoryId}
              onChange={(categoryId) => patch({ categoryId })}
              error={errors.categoryId}
              required
            />

            <Input
              label="Şehir"
              required
              value={values.city}
              onChange={(event) => patch({ city: event.target.value })}
              error={errors.city}
              placeholder="Örn. İstanbul"
            />
          </div>
        </div>

        <div className="card-surface p-6">
          <ImageUploader images={values.images} onChange={(images) => patch({ images })} />
        </div>

        {isEdit && (
          <div className="card-surface p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={values.isSold}
                onChange={(event) => patch({ isSold: event.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800"
              />
              <span>
                <span className="block font-medium text-slate-800 dark:text-slate-100">
                  Bu ürün satıldı
                </span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">
                  Isaretlerseniz ilan "Satıldı" rozetiyle gösterilir ve varsayılan listelemede
                  gizlenir.
                </span>
              </span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <Link to={isEdit && id ? `/ilan/${id}` : '/ilanlarim'}>
            <Button type="button" variant="outline">
              Vazgeç
            </Button>
          </Link>
          <Button type="submit" size="lg" loading={submitting}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Değişiklikleri kaydet' : 'İlanı yayınla'}
          </Button>
        </div>
      </form>
    </div>
  )
}
