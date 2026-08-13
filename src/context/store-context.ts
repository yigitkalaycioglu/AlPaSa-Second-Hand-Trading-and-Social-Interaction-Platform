import { createContext } from 'react'
import type {
  AdminLog,
  Category,
  CategoryFormValues,
  CategoryNode,
  Conversation,
  Favorite,
  Follow,
  Message,
  Product,
  ProductFormValues,
  ProductListItem,
  PublicUser,
  Stats,
  User,
  UserRole,
} from '@/interfaces'

export interface StoreContextValue {
  /** İlk yükleme / tohumlama devam ediyor mu? */
  loading: boolean

  users: PublicUser[]
  categories: Category[]
  products: Product[]
  favorites: Favorite[]
  follows: Follow[]
  messages: Message[]
  adminLogs: AdminLog[]

  /** İlan sayıları hesaplanmış kategori ağacı. */
  categoryTree: CategoryNode[]
  /** Satıcı adı, kategori adı ve favori sayısı çözülmüş ilan listesi. */
  productListItems: ProductListItem[]
  /** İlanlarda geçen benzersiz şehirler (filtre açılır listesi için). */
  cities: string[]
  stats: Stats

  // --- Ürün CRUD ---
  addProduct: (values: ProductFormValues, sellerId: string) => Product | null
  updateProduct: (id: string, values: ProductFormValues) => boolean
  deleteProduct: (id: string) => void
  incrementViewCount: (id: string) => void
  toggleFeatured: (id: string, actor: PublicUser) => void

  // --- Kategori CRUD ---
  addCategory: (values: CategoryFormValues, actor: PublicUser) => boolean
  updateCategory: (id: string, values: CategoryFormValues, actor: PublicUser) => boolean
  deleteCategory: (id: string, actor: PublicUser) => { ok: boolean; reason?: string }

  // --- Sosyal ---
  toggleFavorite: (userId: string, productId: string) => void
  isFavorited: (userId: string | undefined, productId: string) => boolean
  favoriteCountOf: (productId: string) => number
  toggleFollow: (followerId: string, followeeId: string) => void
  isFollowing: (followerId: string | undefined, followeeId: string) => boolean
  followerCountOf: (userId: string) => number
  followingCountOf: (userId: string) => number

  // --- Mesajlaşma ---
  sendMessage: (senderId: string, receiverId: string, content: string, productId?: string | null) => void
  getConversations: (userId: string) => Conversation[]
  markConversationRead: (userId: string, peerId: string) => void
  unreadCountOf: (userId: string | undefined) => number

  // --- Kullanıcı yönetimi (yönetici) ---
  findUserByEmail: (email: string) => User | undefined
  findUserById: (id: string) => PublicUser | undefined
  createUser: (user: User) => void
  updateUser: (id: string, patch: Partial<User>) => void
  deleteUser: (id: string, actor: PublicUser) => void
  setUserRole: (id: string, role: UserRole, actor: PublicUser) => void

  // --- Bakım ---
  resetDemoData: () => Promise<void>
  storageUsage: number
}

export const StoreContext = createContext<StoreContextValue | null>(null)
