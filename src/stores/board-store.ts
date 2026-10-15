import { create } from "zustand"
import type { Board, BoardColumn, BoardState } from "@/types/board"

type BoardStore = BoardState & {
  createBoard: (title: string, description: string) => string | null
  deleteBoard: (boardId: string) => void
  createColumn: (boardId: string, title: string) => string | null
  updateColumnTitle: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
}

const initialState: BoardState = {
  boards: {},
  columns: {},
  cards: {},
}

export const useBoardStore = create<BoardStore>()((set) => ({
  ...initialState,

  createBoard: (title, description) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) return null

    const id = crypto.randomUUID()

    const board: Board = {
      id,
      title: trimmedTitle,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      columnIds: [],
    }

    set((state) => ({
      boards: {
        ...state.boards,
        [id]: board,
      },
    }))

    return id
  },

  deleteBoard: (boardId) => {
    set((state) => {
      const board = state.boards[boardId]

      if (!board) return state

      const columns = { ...state.columns }
      const cards = { ...state.cards }
      const boards = { ...state.boards }

      board.columnIds.forEach((columnId) => {
        const column = columns[columnId]

        if (!column) return

        column.cardIds.forEach((cardId) => {
          delete cards[cardId]
        })

        delete columns[columnId]
      })

      delete boards[boardId]

      return { boards, columns, cards }
    })
  },

  createColumn: (boardId, title) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) return null

    const id = crypto.randomUUID()

    const column: BoardColumn = {
      id,
      boardId,
      title: trimmedTitle,
      cardIds: [],
    }

    let created = false

    set((state) => {
      const board = state.boards[boardId]

      if (!board) return state

      created = true

      return {
        columns: {
          ...state.columns,
          [id]: column,
        },
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columnIds: [...board.columnIds, id],
          },
        },
      }
    })

    return created ? id : null
  },

  updateColumnTitle: (columnId, title) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    set((state) => {
      const column = state.columns[columnId]

      if (!column) return state

      return {
        columns: {
          ...state.columns,
          [columnId]: {
            ...column,
            title: trimmedTitle,
          },
        },
      }
    })
  },

  deleteColumn: (columnId) => {
    set((state) => {
      const column = state.columns[columnId]

      if (!column) return state

      const columns = { ...state.columns }
      const cards = { ...state.cards }
      const board = state.boards[column.boardId]

      column.cardIds.forEach((cardId) => {
        delete cards[cardId]
      })

      delete columns[columnId]

      const boards = board
        ? {
            ...state.boards,
            [board.id]: {
              ...board,
              columnIds: board.columnIds.filter((id) => id !== columnId),
            },
          }
        : state.boards

      return { boards, columns, cards }
    })
  },
}))
