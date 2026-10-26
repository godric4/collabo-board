import type { MutationResult } from '@/lib/api/board-api'

const channelName = 'collabo-board-updates'

type MutationListener = (result: MutationResult) => void

const listeners = new Set<MutationListener>()
let channel: BroadcastChannel | null = null

const getChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null
  }

  if (!channel) {
    channel = new BroadcastChannel(channelName)

    channel.onmessage = (event: MessageEvent<MutationResult>) => {
      listeners.forEach((listener) => listener(event.data))
    }
  }

  return channel
}

export const boardCollaboration = {
  publish(result: MutationResult) {
    getChannel()?.postMessage(result)
  },

  subscribe(listener: MutationListener) {
    listeners.add(listener)
    getChannel()

    return () => {
      listeners.delete(listener)

      if (listeners.size === 0 && channel) {
        channel.close()
        channel = null
      }
    }
  },
}
