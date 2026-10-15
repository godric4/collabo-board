import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Board, BoardCard, BoardColumn, BoardState } from "@/types/board"

type CreateCardInput = {
  title: string
  description?: string
  tags?: string[]
  dueDate?: string | null
}

type UpdateCardInput = Partial<CreateCardInput>

type BoardStore = BoardState & {
  createBoard: (title: string, description: string) => string | null
  updateBoard: (boardId: string, title: string, description: string) => void
  deleteBoard: (boardId: string) => void
  createColumn: (boardId: string, title: string) => string | null
  updateColumnTitle: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
  createCard: (columnId: string, input: CreateCardInput) => string | null
  updateCard: (cardId: string, updates: UpdateCardInput) => void
  deleteCard: (cardId: string) => void
}

const initialState: BoardState = {
  boards: {},
  columns: {},
  cards: {},
}

const normaliseTags = (tags: string[] = []) => [
  ...new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
]

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
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

      updateBoard: (boardId, title, description) => {
        const trimmedTitle = title.trim()

        if (!trimmedTitle) return

        set((state) => {
          const board = state.boards[boardId]

          if (!board) return state

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                title: trimmedTitle,
                description: description.trim(),
              },
            },
          }
        })
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

      createCard: (columnId, input) => {
        const title = input.title.trim()

        if (!title) return null

        const id = crypto.randomUUID()
        let created = false

        set((state) => {
          const column = state.columns[columnId]

          if (!column) return state

          const card: BoardCard = {
            id,
            columnId,
            title,
            description: input.description?.trim() ?? "",
            tags: normaliseTags(input.tags),
            dueDate: input.dueDate || null,
          }

          created = true

          return {
            cards: {
              ...state.cards,
              [id]: card,
            },
            columns: {
              ...state.columns,
              [columnId]: {
                ...column,
                cardIds: [...column.cardIds, id],
              },
            },
          }
        })

        return created ? id : null
      },

      updateCard: (cardId, updates) => {
        set((state) => {
          const card = state.cards[cardId]

          if (!card) return state

          const title =
            updates.title === undefined ? card.title : updates.title.trim()

          if (!title) return state

          const updatedCard: BoardCard = {
            ...card,
            title,
            description:
              updates.description === undefined
                ? card.description
                : updates.description.trim(),
            tags:
              updates.tags === undefined
                ? card.tags
                : normaliseTags(updates.tags),
            dueDate:
              updates.dueDate === undefined
                ? card.dueDate
                : updates.dueDate || null,
          }

          return {
            cards: {
              ...state.cards,
              [cardId]: updatedCard,
            },
          }
        })
      },

      deleteCard: (cardId) => {
        set((state) => {
          const card = state.cards[cardId]

          if (!card) return state

          const cards = { ...state.cards }
          delete cards[cardId]

          const column = state.columns[card.columnId]

          const columns = column
            ? {
                ...state.columns,
                [column.id]: {
                  ...column,
                  cardIds: column.cardIds.filter((id) => id !== cardId),
                },
              }
            : state.columns

          return { cards, columns }
        })
      },
    }),
    {
      name: "collabo-board-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        boards: state.boards,
        columns: state.columns,
        cards: state.cards,
      }),
    },
  ),
)
