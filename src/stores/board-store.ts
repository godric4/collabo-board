import { create } from "zustand"
import type { Board, BoardState } from "@/types/board"

type BoardStore = BoardState & {
  createBoard: (title: string, description: string) => string
  deleteBoard: (boardId: string) => void
}

const initialState: BoardState = {
  boards: {},
  columns: {},
  cards: {},
}

export const useBoardStore = create<BoardStore>()((set) => ({
  ...initialState,

  createBoard: (title, description) => {
    const boardId = crypto.randomUUID()

    const board: Board = {
      id: boardId,
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      columnIds: [],
    }

    // Add the new board without removing existing boards.
    set((state) => ({
      boards: {
        ...state.boards,
        [boardId]: board,
      },
    }))

    return boardId
  },

  deleteBoard: (boardId) => {
    set((state) => {
      if (!state.boards[boardId]) {
        return state
      }

      // Find the board's columns and the cards inside those columns.
      const columnIds = Object.values(state.columns)
        .filter((column) => column.boardId === boardId)
        .map((column) => column.id)

      const columnIdsToDelete = new Set(columnIds)

      const cardIds = Object.values(state.cards)
        .filter((card) => columnIdsToDelete.has(card.columnId))
        .map((card) => card.id)

      const boards = { ...state.boards }
      const columns = { ...state.columns }
      const cards = { ...state.cards }

      delete boards[boardId]

      for (const columnId of columnIds) {
        delete columns[columnId]
      }

      for (const cardId of cardIds) {
        delete cards[cardId]
      }

      return { boards, columns, cards }
    })
  },
}))
