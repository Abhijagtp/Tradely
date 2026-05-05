export const ROOM_FOLLOW_UPDATED_EVENT = 'brewline:room-follow-updated'

export function broadcastRoomFollowUpdate(detail) {
  window.dispatchEvent(
    new CustomEvent(ROOM_FOLLOW_UPDATED_EVENT, {
      detail,
    }),
  )
}
