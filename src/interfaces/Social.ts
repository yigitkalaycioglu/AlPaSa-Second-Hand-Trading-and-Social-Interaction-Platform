/** Kullanıcının bir ilanı favorilemesi. */
export interface Favorite {
  id: string
  userId: string
  productId: string
  createdAt: string
}

/** Bir kullanıcının başka bir satıcıyı takip etmesi. */
export interface Follow {
  id: string
  followerId: string
  followeeId: string
  createdAt: string
}

/** İki kullanıcı arasındaki tekil mesaj. */
export interface Message {
  id: string
  senderId: string
  receiverId: string
  /** Mesajın bağlandığı ilan; genel mesajlarda null. */
  productId: string | null
  content: string
  isRead: boolean
  createdAt: string
}

/** Gelen kutusunda gösterilen, tek satıra indirgenmiş konuşma. */
export interface Conversation {
  /** Karşı tarafın kullanıcı kimliği. */
  peerId: string
  peerName: string
  peerAvatar?: string
  lastMessage: Message
  unreadCount: number
  messages: Message[]
}

/** Yönetici işlem günlüğü. Kim, ne zaman, ne yaptı. */
export interface AdminLog {
  id: string
  actorId: string
  actorName: string
  action: string
  detail: string
  createdAt: string
}
