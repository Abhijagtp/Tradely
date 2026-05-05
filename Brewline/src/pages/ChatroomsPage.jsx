import { useEffect, useMemo, useState } from 'react'
import RoomList from '../components/RoomList'
import { fetchChatRooms } from '../services/chatService'
import { ROOM_FOLLOW_UPDATED_EVENT } from '../utils/chatroomEvents'

function ChatroomsPage() {
  const [activeTab, setActiveTab] = useState('following')
  const [roomSections, setRoomSections] = useState({
    count: 0,
    followedCount: 0,
    followedChatrooms: [],
    chatrooms: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadRooms(options = {}) {
      const { silent = false } = options

      if (silent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
        setError('')
      }

      try {
        const nextRooms = await fetchChatRooms()

        if (!isMounted) {
          return
        }

        setRoomSections(nextRooms)
      } catch {
        if (!isMounted) {
          return
        }

        if (!silent) {
          setRoomSections({
            count: 0,
            followedCount: 0,
            followedChatrooms: [],
            chatrooms: [],
          })
          setError('Unable to load stock rooms right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    loadRooms()

    const intervalId = window.setInterval(() => {
      loadRooms({ silent: true })
    }, 30000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    function handleRoomFollowUpdated(event) {
      const { isFollowing, symbol } = event.detail || {}

      if (!symbol) {
        return
      }

      setRoomSections((current) => {
        const followed = [...current.followedChatrooms]
        const regular = [...current.chatrooms]
        const followedIndex = followed.findIndex((room) => room.symbol === symbol)
        const regularIndex = regular.findIndex((room) => room.symbol === symbol)

        if (isFollowing) {
          const room =
            followedIndex >= 0 ? followed[followedIndex] : regular[regularIndex]

          if (!room) {
            return current
          }

          const nextRoom = { ...room, isFollowing: true }

          if (followedIndex === -1) {
            followed.unshift(nextRoom)
          } else {
            followed[followedIndex] = nextRoom
          }

          if (regularIndex >= 0) {
            regular.splice(regularIndex, 1)
          }

          return {
            ...current,
            followedCount: followed.length,
            followedChatrooms: followed,
            chatrooms: regular,
          }
        }

        const room =
          regularIndex >= 0 ? regular[regularIndex] : followed[followedIndex]

        if (!room) {
          return current
        }

        const nextRoom = { ...room, isFollowing: false }

        if (followedIndex >= 0) {
          followed.splice(followedIndex, 1)
        }

        if (regularIndex === -1) {
          regular.unshift(nextRoom)
        } else {
          regular[regularIndex] = nextRoom
        }

        return {
          ...current,
          followedCount: followed.length,
          followedChatrooms: followed,
          chatrooms: regular,
        }
      })
    }

    window.addEventListener(ROOM_FOLLOW_UPDATED_EVENT, handleRoomFollowUpdated)

    return () => {
      window.removeEventListener(ROOM_FOLLOW_UPDATED_EVENT, handleRoomFollowUpdated)
    }
  }, [])

  const allRooms = useMemo(
    () => [...roomSections.followedChatrooms, ...roomSections.chatrooms],
    [roomSections.chatrooms, roomSections.followedChatrooms],
  )

  const visibleRooms = activeTab === 'following'
    ? roomSections.followedChatrooms
    : allRooms

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,180,140,0.26),_transparent_25%),linear-gradient(180deg,#F8EFE2_0%,#F4E7D6_42%,#EFDCC6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section>
          {isLoading ? (
            <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-[rgba(255,248,240,0.82)] p-5 shadow-sm">
              <div className="h-8 w-40 animate-pulse rounded-full bg-[rgba(139,94,60,0.1)]" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-[1.4rem] bg-[rgba(245,230,211,0.76)]"
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--color-border-strong)] bg-[#E8D5C0] px-5 py-10 text-center">
              <p className="text-lg font-semibold text-[var(--color-primary-deep)]">
                Chatrooms unavailable
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {error}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[rgba(255,250,245,0.84)] p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('following')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === 'following'
                        ? 'bg-[#8C5A31] text-[var(--color-primary-light)] shadow-[0_4px_12px_rgba(139,94,60,0.14)]'
                        : 'text-[var(--color-primary-deep)] hover:bg-[rgba(245,230,211,0.82)]'
                    }`}
                  >
                    Following ({roomSections.followedChatrooms.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === 'all'
                        ? 'bg-[#8C5A31] text-[var(--color-primary-light)] shadow-[0_4px_12px_rgba(139,94,60,0.14)]'
                        : 'text-[var(--color-primary-deep)] hover:bg-[rgba(245,230,211,0.82)]'
                    }`}
                  >
                    All chats ({allRooms.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsRefreshing(true)
                    void (async () => {
                      try {
                        const nextRooms = await fetchChatRooms()
                        setRoomSections(nextRooms)
                        setError('')
                      } catch {
                        setError('Unable to refresh stock rooms right now.')
                      } finally {
                        setIsRefreshing(false)
                      }
                    })()
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[rgba(255,250,245,0.88)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-deep)] transition hover:bg-[rgba(245,230,211,0.82)]"
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              <RoomList
                rooms={visibleRooms}
                eyebrow={activeTab === 'following' ? 'Following' : 'Chatrooms'}
                title={
                  activeTab === 'following'
                    ? 'Rooms you follow'
                    : 'Browse all chatrooms'
                }
                emptyTitle={
                  activeTab === 'following'
                    ? 'No followed rooms yet'
                    : 'No chatrooms available'
                }
                countLabel={activeTab === 'following' ? 'followed' : 'rooms'}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ChatroomsPage
