"use client"

import { useEffect } from "react"
import { useBoardStore } from "@/stores/board-store"

const BoardStoreHydration = () => {
  useEffect(() => {
    useBoardStore.persist.rehydrate()
  }, [])

  return null
}

export default BoardStoreHydration
