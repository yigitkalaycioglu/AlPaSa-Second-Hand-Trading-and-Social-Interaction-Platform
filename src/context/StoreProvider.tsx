import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type {
  AdminLog,
  Category,
  CategoryFormValues,
  Conversation,
  Favorite,
  Follow,
  Message,
  Product,
  ProductFormValues,
  ProductListItem,
  PublicUser,
  User,
  UserRole,
} from '@/interfaces'
import { createId } from '@/lib/crypto'
import { buildCategoryTree, wouldCreateCycle } from '@/lib/categoryTree'
import { parsePrice } from '@/lib/validation'
import { createSeedData, type SeedData } from '@/lib/seed'
import {
  SCHEMA_VERSION,
  STORAGE_KEYS,
  StorageQuotaError,
  clearAll,
  estimateUsedBytes,
  read,
  remove as removeKey,
  write,
} from '@/lib/storage'
import { useToast } from '@/hooks/useToast'
import { StoreContext } from './store-context'

function stripPassword(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user
  return rest
}

/**
 * Kayıtlı veriyi senkron okur.
 * Tohumlama uygulama açılışında (lib/bootstrap.ts) tamamlandığı için
 * bu noktada veriler her zaman hazırdır.
 */
function readDatabase(): SeedData {
  return {
    users: read<User[]>(STORAGE_KEYS.users, []),
    categories: read<Category[]>(STORAGE_KEYS.categories, []),
    products: read<Product[]>(STORAGE_KEYS.products, []),
    favorites: read<Favorite[]>(STORAGE_KEYS.favorites, []),
    follows: read<Follow[]>(STORAGE_KEYS.follows, []),
    messages: read<Message[]>(STORAGE_KEYS.messages, []),
    adminLogs: read<AdminLog[]>(STORAGE_KEYS.adminLogs, []),
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { notify } = useToast()

  // Tüm veriler ilk render'da hazır — "yükleniyor" ara durumu yok.
  const [initial] = useState(readDatabase)

  const [loading, setLoading] = useState(false)
  const [rawUsers, setRawUsers] = useState<User[]>(initial.users)
  const [categories, setCategories] = useState<Category[]>(initial.categories)
  const [products, setProducts] = useState<Product[]>(initial.products)
  const [favorites, setFavorites] = useState<Favorite[]>(initial.favorites)
  const [follows, setFollows] = useState<Follow[]>(initial.follows)
  const [messages, setMessages] = useState<Message[]>(initial.messages)
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(initial.adminLogs)
  const [storageUsage, setStorageUsage] = useState(() => estimateUsedBytes())

  /**
   * Durumu hem belleğe hem localStorage'a yazar.
   * Kota dolarsa değişiklik geri alınır ve kullanıcı bilgilendirilir.
   */
  const persist = useCallback(
    <T,>(key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS], value: T, apply: (value: T) => void): boolean => {
      try {
        write(key, value)
        apply(value)
        setStorageUsage(estimateUsedBytes())
        return true
      } catch (error) {
        if (error instanceof StorageQuotaError) {
          notify(error.message, 'error')
        } else {
          notify('Veri kaydedilemedi. Tarayıcı depolaması kullanılamıyor olabilir.', 'error')
        }
        return false
      }
    },
    [notify],
  )

  /**
   * Depoyu temizleyip demo verisini yeniden yazar.
   * Yalnızca kullanıcı "verileri sıfırla" dediğinde, yani bir olay işleyicisinden
   * çağrılır — effect içinden değil.
   */
  const seedDatabase = useCallback(async () => {
    setLoading(true)
    clearAll()
    const seed = await createSeedData()

    try {
      write(STORAGE_KEYS.users, seed.users)
      write(STORAGE_KEYS.categories, seed.categories)
      write(STORAGE_KEYS.products, seed.products)
      write(STORAGE_KEYS.favorites, seed.favorites)
      write(STORAGE_KEYS.follows, seed.follows)
      write(STORAGE_KEYS.messages, seed.messages)
      write(STORAGE_KEYS.adminLogs, seed.adminLogs)
      write(STORAGE_KEYS.version, SCHEMA_VERSION)
    } catch {
      notify('Demo verisi kaydedilemedi; veriler yalnızca bu oturumda geçerli.', 'warning')
    }

    setRawUsers(seed.users)
    setCategories(seed.categories)
    setProducts(seed.products)
    setFavorites(seed.favorites)
    setFollows(seed.follows)
    setMessages(seed.messages)
    setAdminLogs(seed.adminLogs)
    setStorageUsage(estimateUsedBytes())
    setLoading(false)
  }, [notify])

  // --- Yönetici günlüğü ---
  const log = useCallback(
    (actor: PublicUser, action: string, detail: string) => {
      setAdminLogs((current) => {
        const entry: AdminLog = {
          id: createId('log'),
          actorId: actor.id,
          actorName: `${actor.firstName} ${actor.lastName}`,
          action,
          detail,
          createdAt: new Date().toISOString(),
        }
        // Günlük sınırsız büyümesin; son 200 kayıt yeter.
        const next = [entry, ...current].slice(0, 200)
        try {
          write(STORAGE_KEYS.adminLogs, next)
        } catch {
          /* günlük kaydı kritik değil, sessizce geç */
        }
        return next
      })
    },
    [],
  )

  // ==========================
  // ÜRÜN CRUD
  // ==========================

  const addProduct = useCallback(
    (values: ProductFormValues, sellerId: string): Product | null => {
      const timestamp = new Date().toISOString()
      const product: Product = {
        id: createId('prd'),
        title: values.title.trim(),
        description: values.description.trim(),
        price: parsePrice(values.price) ?? 0,
        condition: values.condition,
        categoryId: values.categoryId,
        sellerId,
        images: values.images,
        city: values.city.trim(),
        isSold: values.isSold,
        isFeatured: false,
        viewCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      const next = [product, ...products]
      return persist(STORAGE_KEYS.products, next, setProducts) ? product : null
    },
    [products, persist],
  )

  const updateProduct = useCallback(
    (id: string, values: ProductFormValues): boolean => {
      const next = products.map((product) =>
        product.id === id
          ? {
              ...product,
              title: values.title.trim(),
              description: values.description.trim(),
              price: parsePrice(values.price) ?? product.price,
              condition: values.condition,
              categoryId: values.categoryId,
              images: values.images,
              city: values.city.trim(),
              isSold: values.isSold,
              updatedAt: new Date().toISOString(),
            }
          : product,
      )
      return persist(STORAGE_KEYS.products, next, setProducts)
    },
    [products, persist],
  )

  const deleteProduct = useCallback(
    (id: string) => {
      persist(
        STORAGE_KEYS.products,
        products.filter((product) => product.id !== id),
        setProducts,
      )
      // Silinen ilana bağlı favorileri de temizle (yetim kayıt bırakma).
      const remainingFavorites = favorites.filter((favorite) => favorite.productId !== id)
      if (remainingFavorites.length !== favorites.length) {
        persist(STORAGE_KEYS.favorites, remainingFavorites, setFavorites)
      }
    },
    [products, favorites, persist],
  )

  const incrementViewCount = useCallback((id: string) => {
    setProducts((current) => {
      const next = current.map((product) =>
        product.id === id ? { ...product, viewCount: product.viewCount + 1 } : product,
      )
      try {
        write(STORAGE_KEYS.products, next)
      } catch {
        /* görüntülenme sayacı kritik değil */
      }
      return next
    })
  }, [])

  const toggleFeatured = useCallback(
    (id: string, actor: PublicUser) => {
      const target = products.find((product) => product.id === id)
      if (!target) return
      const next = products.map((product) =>
        product.id === id ? { ...product, isFeatured: !product.isFeatured } : product,
      )
      if (persist(STORAGE_KEYS.products, next, setProducts)) {
        log(
          actor,
          target.isFeatured ? 'İlan vitrinden çıkarıldı' : 'İlan öne çıkarıldı',
          `"${target.title}" ilanı güncellendi.`,
        )
      }
    },
    [products, persist, log],
  )

  // ==========================
  // KATEGORİ CRUD
  // ==========================

  const addCategory = useCallback(
    (values: CategoryFormValues, actor: PublicUser): boolean => {
      const category: Category = {
        id: createId('cat'),
        name: values.name.trim(),
        description: values.description.trim(),
        parentId: values.parentId,
        icon: values.icon,
        createdAt: new Date().toISOString(),
      }
      const ok = persist(STORAGE_KEYS.categories, [...categories, category], setCategories)
      if (ok) log(actor, 'Kategori eklendi', `"${category.name}" kategorisi oluşturuldu.`)
      return ok
    },
    [categories, persist, log],
  )

  const updateCategory = useCallback(
    (id: string, values: CategoryFormValues, actor: PublicUser): boolean => {
      if (wouldCreateCycle(categories, id, values.parentId)) {
        notify('Bir kategori kendi alt kategorisinin altına taşınamaz.', 'error')
        return false
      }
      const next = categories.map((category) =>
        category.id === id
          ? {
              ...category,
              name: values.name.trim(),
              description: values.description.trim(),
              parentId: values.parentId,
              icon: values.icon,
            }
          : category,
      )
      const ok = persist(STORAGE_KEYS.categories, next, setCategories)
      if (ok) log(actor, 'Kategori güncellendi', `"${values.name}" kategorisi düzenlendi.`)
      return ok
    },
    [categories, persist, log, notify],
  )

  const deleteCategory = useCallback(
    (id: string, actor: PublicUser): { ok: boolean; reason?: string } => {
      const hasChildren = categories.some((category) => category.parentId === id)
      if (hasChildren) {
        return { ok: false, reason: 'Bu kategorinin alt kategorileri var. Önce onları silin veya taşıyın.' }
      }
      const productCount = products.filter((product) => product.categoryId === id).length
      if (productCount > 0) {
        return { ok: false, reason: `Bu kategoride ${productCount} ilan var. Önce ilanları başka kategoriye taşıyın.` }
      }

      const target = categories.find((category) => category.id === id)
      const ok = persist(
        STORAGE_KEYS.categories,
        categories.filter((category) => category.id !== id),
        setCategories,
      )
      if (ok && target) log(actor, 'Kategori silindi', `"${target.name}" kategorisi kaldırıldı.`)
      return { ok }
    },
    [categories, products, persist, log],
  )

  // ==========================
  // SOSYAL
  // ==========================

  const toggleFavorite = useCallback(
    (userId: string, productId: string) => {
      const existing = favorites.find(
        (favorite) => favorite.userId === userId && favorite.productId === productId,
      )
      const next = existing
        ? favorites.filter((favorite) => favorite.id !== existing.id)
        : [
            ...favorites,
            { id: createId('fav'), userId, productId, createdAt: new Date().toISOString() },
          ]
      persist(STORAGE_KEYS.favorites, next, setFavorites)
    },
    [favorites, persist],
  )

  const toggleFollow = useCallback(
    (followerId: string, followeeId: string) => {
      if (followerId === followeeId) return
      const existing = follows.find(
        (follow) => follow.followerId === followerId && follow.followeeId === followeeId,
      )
      const next = existing
        ? follows.filter((follow) => follow.id !== existing.id)
        : [
            ...follows,
            { id: createId('flw'), followerId, followeeId, createdAt: new Date().toISOString() },
          ]
      persist(STORAGE_KEYS.follows, next, setFollows)
    },
    [follows, persist],
  )

  // ==========================
  // MESAJLAŞMA
  // ==========================

  const sendMessage = useCallback(
    (senderId: string, receiverId: string, content: string, productId: string | null = null) => {
      const message: Message = {
        id: createId('msg'),
        senderId,
        receiverId,
        productId,
        content: content.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      persist(STORAGE_KEYS.messages, [...messages, message], setMessages)
    },
    [messages, persist],
  )

  const markConversationRead = useCallback(
    (userId: string, peerId: string) => {
      const hasUnread = messages.some(
        (message) => message.receiverId === userId && message.senderId === peerId && !message.isRead,
      )
      if (!hasUnread) return

      const next = messages.map((message) =>
        message.receiverId === userId && message.senderId === peerId
          ? { ...message, isRead: true }
          : message,
      )
      persist(STORAGE_KEYS.messages, next, setMessages)
    },
    [messages, persist],
  )

  // ==========================
  // KULLANICI YÖNETİMİ
  // ==========================

  const findUserByEmail = useCallback(
    (email: string) => rawUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()),
    [rawUsers],
  )

  const createUser = useCallback(
    (user: User) => {
      persist(STORAGE_KEYS.users, [...rawUsers, user], setRawUsers)
    },
    [rawUsers, persist],
  )

  const updateUser = useCallback(
    (id: string, patch: Partial<User>) => {
      const next = rawUsers.map((user) => (user.id === id ? { ...user, ...patch } : user))
      persist(STORAGE_KEYS.users, next, setRawUsers)
    },
    [rawUsers, persist],
  )

  const deleteUser = useCallback(
    (id: string, actor: PublicUser) => {
      const target = rawUsers.find((user) => user.id === id)
      if (!target) return

      persist(STORAGE_KEYS.users, rawUsers.filter((user) => user.id !== id), setRawUsers)
      // Kullanıcıya bağlı tüm kayıtları temizle.
      persist(STORAGE_KEYS.products, products.filter((product) => product.sellerId !== id), setProducts)
      persist(STORAGE_KEYS.favorites, favorites.filter((favorite) => favorite.userId !== id), setFavorites)
      persist(
        STORAGE_KEYS.follows,
        follows.filter((follow) => follow.followerId !== id && follow.followeeId !== id),
        setFollows,
      )
      persist(
        STORAGE_KEYS.messages,
        messages.filter((message) => message.senderId !== id && message.receiverId !== id),
        setMessages,
      )
      log(actor, 'Kullanıcı silindi', `${target.email} ve tüm ilanları kaldırıldı.`)
    },
    [rawUsers, products, favorites, follows, messages, persist, log],
  )

  const setUserRole = useCallback(
    (id: string, role: UserRole, actor: PublicUser) => {
      const target = rawUsers.find((user) => user.id === id)
      if (!target) return
      const next = rawUsers.map((user) => (user.id === id ? { ...user, role } : user))
      if (persist(STORAGE_KEYS.users, next, setRawUsers)) {
        log(actor, 'Kullanıcı rolü değiştirildi', `${target.email} -> ${role}`)
      }
    },
    [rawUsers, persist, log],
  )

  const resetDemoData = useCallback(async () => {
    await seedDatabase()
    // Oturum anahtarını da temizle: silinen kullanıcıyla oturum açık kalmasın.
    removeKey(STORAGE_KEYS.session)
    notify('Demo verileri ilk haline döndürüldü.', 'success')
  }, [seedDatabase, notify])

  // ==========================
  // TÜRETİLMİŞ VERİ
  // ==========================

  const users = useMemo(() => rawUsers.map(stripPassword), [rawUsers])

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users])
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const favoriteCountByProduct = useMemo(() => {
    const counts = new Map<string, number>()
    for (const favorite of favorites) {
      counts.set(favorite.productId, (counts.get(favorite.productId) ?? 0) + 1)
    }
    return counts
  }, [favorites])

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of products) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
    }
    return counts
  }, [products])

  const categoryTree = useMemo(
    () => buildCategoryTree(categories, productCountByCategory),
    [categories, productCountByCategory],
  )

  const productListItems = useMemo<ProductListItem[]>(
    () =>
      products.map((product) => {
        const seller = usersById.get(product.sellerId)
        return {
          ...product,
          sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'Silinmiş kullanıcı',
          categoryName: categoriesById.get(product.categoryId)?.name ?? 'Kategorisiz',
          favoriteCount: favoriteCountByProduct.get(product.id) ?? 0,
        }
      }),
    [products, usersById, categoriesById, favoriteCountByProduct],
  )

  const cities = useMemo(
    () => [...new Set(products.map((product) => product.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr')),
    [products],
  )

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      totalProducts: products.length,
      soldProducts: products.filter((product) => product.isSold).length,
      activeProducts: products.filter((product) => !product.isSold).length,
      totalCategories: categories.length,
      totalMessages: messages.length,
      totalFavorites: favorites.length,
      totalValue: products.filter((p) => !p.isSold).reduce((sum, p) => sum + p.price, 0),
    }),
    [users, products, categories, messages, favorites],
  )

  // ==========================
  // SORGU YARDIMCILARI
  // ==========================

  const isFavorited = useCallback(
    (userId: string | undefined, productId: string) =>
      Boolean(userId) &&
      favorites.some((favorite) => favorite.userId === userId && favorite.productId === productId),
    [favorites],
  )

  const favoriteCountOf = useCallback(
    (productId: string) => favoriteCountByProduct.get(productId) ?? 0,
    [favoriteCountByProduct],
  )

  const isFollowing = useCallback(
    (followerId: string | undefined, followeeId: string) =>
      Boolean(followerId) &&
      follows.some((follow) => follow.followerId === followerId && follow.followeeId === followeeId),
    [follows],
  )

  const followerCountOf = useCallback(
    (userId: string) => follows.filter((follow) => follow.followeeId === userId).length,
    [follows],
  )

  const followingCountOf = useCallback(
    (userId: string) => follows.filter((follow) => follow.followerId === userId).length,
    [follows],
  )

  const findUserById = useCallback((id: string) => usersById.get(id), [usersById])

  const unreadCountOf = useCallback(
    (userId: string | undefined) =>
      userId
        ? messages.filter((message) => message.receiverId === userId && !message.isRead).length
        : 0,
    [messages],
  )

  /** Kullanıcının mesajlarını karşı tarafa göre konuşmalara gruplar. */
  const getConversations = useCallback(
    (userId: string): Conversation[] => {
      const grouped = new Map<string, Message[]>()

      for (const message of messages) {
        if (message.senderId !== userId && message.receiverId !== userId) continue
        const peerId = message.senderId === userId ? message.receiverId : message.senderId
        const bucket = grouped.get(peerId) ?? []
        bucket.push(message)
        grouped.set(peerId, bucket)
      }

      const conversations: Conversation[] = []
      for (const [peerId, bucket] of grouped) {
        bucket.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        const peer = usersById.get(peerId)
        conversations.push({
          peerId,
          peerName: peer ? `${peer.firstName} ${peer.lastName}` : 'Silinmiş kullanıcı',
          peerAvatar: peer?.avatar,
          lastMessage: bucket[bucket.length - 1],
          unreadCount: bucket.filter((m) => m.receiverId === userId && !m.isRead).length,
          messages: bucket,
        })
      }

      conversations.sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt))
      return conversations
    },
    [messages, usersById],
  )

  const value = useMemo(
    () => ({
      loading,
      users,
      categories,
      products,
      favorites,
      follows,
      messages,
      adminLogs,
      categoryTree,
      productListItems,
      cities,
      stats,
      addProduct,
      updateProduct,
      deleteProduct,
      incrementViewCount,
      toggleFeatured,
      addCategory,
      updateCategory,
      deleteCategory,
      toggleFavorite,
      isFavorited,
      favoriteCountOf,
      toggleFollow,
      isFollowing,
      followerCountOf,
      followingCountOf,
      sendMessage,
      getConversations,
      markConversationRead,
      unreadCountOf,
      findUserByEmail,
      findUserById,
      createUser,
      updateUser,
      deleteUser,
      setUserRole,
      resetDemoData,
      storageUsage,
    }),
    [
      loading, users, categories, products, favorites, follows, messages, adminLogs,
      categoryTree, productListItems, cities, stats,
      addProduct, updateProduct, deleteProduct, incrementViewCount, toggleFeatured,
      addCategory, updateCategory, deleteCategory,
      toggleFavorite, isFavorited, favoriteCountOf,
      toggleFollow, isFollowing, followerCountOf, followingCountOf,
      sendMessage, getConversations, markConversationRead, unreadCountOf,
      findUserByEmail, findUserById, createUser, updateUser, deleteUser, setUserRole,
      resetDemoData, storageUsage,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
