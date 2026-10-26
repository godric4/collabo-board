"use client"

import { useEffect } from "react"
import { boardCollaboration } from "@/lib/api/board-collaboration"
import { useBoardStore } from "@/stores/board-store"

const BoardStoreHydration = () => {
  useEffect(() => {
    const unsubscribe = boardCollaboration.subscribe(({ mutation }) => {
      useBoardStore.getState().applyRemoteMutation(mutation)
    })

    void useBoardStore.persist.rehydrate()

    return unsubscribe
  }, [])

  return null
}

export default BoardStoreHydration
