import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Inbox, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/cn'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'

export function MessagesPage() {
  const { currentUser } = useAuth()
  const { getConversations, markConversationRead, sendMessage, products } = useStore()

  /**
   * undefined = kullanıcı henüz seçim yapmadi (en yeni konuşma açılır),
   * null      = mobilde listeye geri donuldu,
   * string    = açıkça seçilen konuşma.
   */
  const [selection, setSelection] = useState<string | null | undefined>(undefined)
  const [draft, setDraft] = useState('')
  const threadEndRef = useRef<HTMLDivElement>(null)

  const conversations = useMemo(
    () => (currentUser ? getConversations(currentUser.id) : []),
    [currentUser, getConversations],
  )

  // Varsayılan seçimi state'e yazmak yerine türetiyoruz: fazladan render turu yok.
  const activePeer = selection === undefined ? (conversations[0]?.peerId ?? null) : selection

  const active = conversations.find((conversation) => conversation.peerId === activePeer)

  // Konuşma açıldığında gelen mesajları okundu işaretle.
  useEffect(() => {
    if (currentUser && activePeer && active && active.unreadCount > 0) {
      markConversationRead(currentUser.id, activePeer)
    }
  }, [currentUser, activePeer, active, markConversationRead])

  // Yeni mesajda en alta kaydir.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length])

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser || !activePeer || draft.trim().length === 0) return
    sendMessage(currentUser.id, activePeer, draft)
    setDraft('')
  }

  if (conversations.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-extrabold text-slate-900 dark:text-white">Mesajlar</h1>
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title="Henüz mesajınız yok"
          description="Bir ilanın detay sayfasından satıcıya mesaj gönderdiğinizde konuşmalarınız burada listelenir."
          action={
            <Link to="/ilanlar">
              <Button>İlanları keşfet</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-extrabold text-slate-900 dark:text-white">Mesajlar</h1>

      <div className="card-surface grid overflow-hidden md:grid-cols-[320px_1fr]">
        {/* ============ Konuşma listesi ============ */}
        <aside
          className={cn(
            'border-slate-200 md:block md:border-r dark:border-slate-800',
            active ? 'hidden' : 'block',
          )}
        >
          <div className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {conversations.map((conversation) => (
              <button
                key={conversation.peerId}
                type="button"
                onClick={() => setSelection(conversation.peerId)}
                className={cn(
                  'flex w-full items-start gap-3 p-4 text-left transition-colors',
                  conversation.peerId === activePeer
                    ? 'bg-brand-50 dark:bg-brand-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                )}
              >
                <Avatar
                  firstName={conversation.peerName.split(' ')[0] ?? '?'}
                  lastName={conversation.peerName.split(' ')[1] ?? '?'}
                  src={conversation.peerAvatar}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                      {conversation.peerName}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {conversation.lastMessage.content}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatRelativeTime(conversation.lastMessage.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ============ Konuşma detayi ============ */}
        {active && (
          <section className="flex max-h-[70vh] flex-col">
            <header className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelection(null)}
                aria-label="Konuşma listesine dön"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                firstName={active.peerName.split(' ')[0] ?? '?'}
                lastName={active.peerName.split(' ')[1] ?? '?'}
                src={active.peerAvatar}
                size="sm"
              />
              <Link
                to={`/satici/${active.peerId}`}
                className="font-bold text-slate-800 hover:text-brand-600 dark:text-slate-100"
              >
                {active.peerName}
              </Link>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-950/40">
              {active.messages.map((message) => {
                const mine = message.senderId === currentUser?.id
                const product = message.productId
                  ? products.find((item) => item.id === message.productId)
                  : null

                return (
                  <div
                    key={message.id}
                    className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5',
                        mine
                          ? 'rounded-br-md bg-brand-600 text-white'
                          : 'rounded-bl-md bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200',
                      )}
                    >
                      {product && (
                        <Link
                          to={`/ilan/${product.id}`}
                          className={cn(
                            'mb-1.5 block truncate rounded-lg px-2 py-1 text-xs font-medium',
                            mine ? 'bg-white/15 text-white/90' : 'bg-slate-100 dark:bg-slate-700',
                          )}
                        >
                          {product.title}
                        </Link>
                      )}
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p
                        className={cn(
                          'mt-1 text-[0.6875rem]',
                          mine ? 'text-white/60' : 'text-slate-400',
                        )}
                        title={formatDateTime(message.createdAt)}
                      >
                        {formatRelativeTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={threadEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Mesajinizi yazın..."
                aria-label="Mesaj"
                maxLength={1000}
                className="h-11 flex-1 rounded-xl border border-slate-300 px-4 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Button type="submit" disabled={draft.trim().length === 0} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}
