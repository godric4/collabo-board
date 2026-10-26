import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { boardApi } from "@/lib/api/board-api"
import { boardCollaboration } from "@/lib/api/board-collaboration"
import type { BoardMutation } from "@/lib/api/board-api"
import type {
  Board,
  BoardCard,
  BoardColumn,
  BoardComment,
  BoardState,
} from "@/types/board"

type CreateCardInput = {
  title: string
  description?: string
  tags?: string[]
  dueDate?: string | null
}

type UpdateCardInput = Partial<CreateCardInput>

type BoardHistory = {
  past: BoardState[]
  future: BoardState[]
}

type BoardStore = BoardState & {
  history: BoardHistory
  createBoard: (title: string, description: string) => string | null
  updateBoard: (boardId: string, title: string, description: string) => void
  deleteBoard: (boardId: string) => void
  createColumn: (boardId: string, title: string) => string | null
  updateColumnTitle: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
  createCard: (columnId: string, input: CreateCardInput) => string | null
  updateCard: (cardId: string, updates: UpdateCardInput) => void
  deleteCard: (cardId: string) => void
  moveCard: (
    cardId: string,
    destinationColumnId: string,
    destinationIndex: number,
  ) => boolean
  createComment: (
    cardId: string,
    content: string,
    parentId?: string | null,
  ) => string | null
  updateComment: (commentId: string, content: string) => void
  deleteComment: (commentId: string) => void
  applyRemoteMutation: (mutation: BoardMutation) => void
  undo: () => void
  redo: () => void
}

const initialState: BoardState = {
  boards: {},
  columns: {},
  cards: {},
  comments: {},
}

const normaliseTags = (tags: string[] = []) => [
  ...new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
]

const historyLimit = 50

const snapshot = (state: BoardState): BoardState => ({
  boards: state.boards,
  columns: state.columns,
  cards: state.cards,
  comments: state.comments,
})

const withHistory = (
  state: BoardStore,
  next: Omit<BoardState, "comments"> & {
    comments?: BoardState["comments"]
  },
) => ({
  ...next,
  comments: next.comments ?? state.comments,
  history: {
    past: [...state.history.past, snapshot(state)].slice(-historyLimit),
    future: [],
  },
})

const removeCommentsForCards = (
  comments: Record<string, BoardComment>,
  cardIds: Set<string>,
): Record<string, BoardComment> =>
  Object.fromEntries(
    Object.entries(comments).filter(
      ([, comment]) => !cardIds.has(comment.cardId),
    ),
  )

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      ...initialState,
      history: { past: [], future: [] },

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

        set((state) =>
          withHistory(state, {
            boards: {
              ...state.boards,
              [id]: board,
            },
            columns: state.columns,
            cards: state.cards,
          }),
        )

        return id
      },

      updateBoard: (boardId, title, description) => {
        const trimmedTitle = title.trim()

        if (!trimmedTitle) return

        set((state) => {
          const board = state.boards[boardId]

          if (!board) return state

          return withHistory(state, {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                title: trimmedTitle,
                description: description.trim(),
              },
            },
            columns: state.columns,
            cards: state.cards,
          })
        })
      },

      deleteBoard: (boardId) => {
        set((state) => {
          const board = state.boards[boardId]

          if (!board) return state

          const columns = { ...state.columns }
          const cards = { ...state.cards }
          const boards = { ...state.boards }
          const deletedCardIds = new Set<string>()

          board.columnIds.forEach((columnId) => {
            const column = columns[columnId]

            if (!column) return

            column.cardIds.forEach((cardId) => {
              deletedCardIds.add(cardId)
              delete cards[cardId]
            })

            delete columns[columnId]
          })

          delete boards[boardId]

          return withHistory(state, {
            boards,
            columns,
            cards,
            comments: removeCommentsForCards(state.comments, deletedCardIds),
          })
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

          return withHistory(state, {
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
            cards: state.cards,
          })
        })

        return created ? id : null
      },

      updateColumnTitle: (columnId, title) => {
        const trimmedTitle = title.trim()

        if (!trimmedTitle) return

        set((state) => {
          const column = state.columns[columnId]

          if (!column) return state

          return withHistory(state, {
            columns: {
              ...state.columns,
              [columnId]: {
                ...column,
                title: trimmedTitle,
              },
            },
            boards: state.boards,
            cards: state.cards,
          })
        })
      },

      deleteColumn: (columnId) => {
        set((state) => {
          const column = state.columns[columnId]

          if (!column) return state

          const columns = { ...state.columns }
          const cards = { ...state.cards }
          const board = state.boards[column.boardId]
          const deletedCardIds = new Set(column.cardIds)

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

          return withHistory(state, {
            boards,
            columns,
            cards,
            comments: removeCommentsForCards(state.comments, deletedCardIds),
          })
        })
      },

      createCard: (columnId, input) => {
        const title = input.title.trim()

        if (!title) return null

        const id = crypto.randomUUID()
        let createdCard: BoardCard | null = null

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

          createdCard = card

          return withHistory(state, {
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
            boards: state.boards,
          })
        })

        if (!createdCard) return null

        void boardApi
          .saveMutation({
            type: "card.created",
            card: createdCard,
            columnId,
          })
          .then((result) => {
            boardCollaboration.publish(result)
          })
          .catch((error: unknown) => {
            console.error("Failed to publish card creation:", error)
          })

        return id
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

          return withHistory(state, {
            cards: {
              ...state.cards,
              [cardId]: updatedCard,
            },
            boards: state.boards,
            columns: state.columns,
          })
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

          return withHistory(state, {
            cards,
            columns,
            boards: state.boards,
            comments: removeCommentsForCards(state.comments, new Set([cardId])),
          })
        })
      },

      moveCard: (cardId, destinationColumnId, destinationIndex) => {
        let moved = false

        set((state) => {
          const card = state.cards[cardId]
          const sourceColumn = card ? state.columns[card.columnId] : undefined
          const destinationColumn = state.columns[destinationColumnId]

          if (!card || !sourceColumn || !destinationColumn) return state

          const sourceCardIds = sourceColumn.cardIds.filter(
            (id) => id !== cardId,
          )

          const destinationCardIds =
            sourceColumn.id === destinationColumn.id
              ? sourceCardIds
              : [...destinationColumn.cardIds]

          const requestedIndex = Number.isFinite(destinationIndex)
            ? Math.trunc(destinationIndex)
            : destinationCardIds.length

          const insertionIndex = Math.min(
            Math.max(requestedIndex, 0),
            destinationCardIds.length,
          )

          destinationCardIds.splice(insertionIndex, 0, cardId)

          if (
            sourceColumn.id === destinationColumn.id &&
            sourceColumn.cardIds.every(
              (existingCardId, index) =>
                existingCardId === destinationCardIds[index],
            )
          ) {
            return state
          }

          moved = true

          const columns =
            sourceColumn.id === destinationColumn.id
              ? {
                  ...state.columns,
                  [sourceColumn.id]: {
                    ...sourceColumn,
                    cardIds: destinationCardIds,
                  },
                }
              : {
                  ...state.columns,
                  [sourceColumn.id]: {
                    ...sourceColumn,
                    cardIds: sourceCardIds,
                  },
                  [destinationColumn.id]: {
                    ...destinationColumn,
                    cardIds: destinationCardIds,
                  },
                }

          return withHistory(state, {
            boards: state.boards,
            columns,
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                columnId: destinationColumnId,
              },
            },
          })
        })

        return moved
      },

      createComment: (cardId, content, parentId = null) => {
        const trimmedContent = content.trim()

        if (!trimmedContent) return null

        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        let created = false

        set((state) => {
          if (!state.cards[cardId]) return state

          if (parentId) {
            const parent = state.comments[parentId]

            if (!parent || parent.cardId !== cardId) return state
          }

          const comment: BoardComment = {
            id,
            cardId,
            parentId,
            content: trimmedContent,
            createdAt: now,
            updatedAt: now,
          }

          created = true

          return withHistory(state, {
            boards: state.boards,
            columns: state.columns,
            cards: state.cards,
            comments: {
              ...state.comments,
              [id]: comment,
            },
          })
        })

        return created ? id : null
      },

      updateComment: (commentId, content) => {
        const trimmedContent = content.trim()

        if (!trimmedContent) return

        set((state) => {
          const comment = state.comments[commentId]

          if (!comment || comment.content === trimmedContent) return state

          return withHistory(state, {
            boards: state.boards,
            columns: state.columns,
            cards: state.cards,
            comments: {
              ...state.comments,
              [commentId]: {
                ...comment,
                content: trimmedContent,
                updatedAt: new Date().toISOString(),
              },
            },
          })
        })
      },

      deleteComment: (commentId) => {
        set((state) => {
          if (!state.comments[commentId]) return state

          const deletedIds = new Set([commentId])
          let foundNewDescendant = true

          while (foundNewDescendant) {
            foundNewDescendant = false

            Object.values(state.comments).forEach((comment) => {
              if (
                comment.parentId &&
                deletedIds.has(comment.parentId) &&
                !deletedIds.has(comment.id)
              ) {
                deletedIds.add(comment.id)
                foundNewDescendant = true
              }
            })
          }

          const comments = { ...state.comments }

          deletedIds.forEach((id) => {
            delete comments[id]
          })

          return withHistory(state, {
            boards: state.boards,
            columns: state.columns,
            cards: state.cards,
            comments,
          })
        })
      },

      applyRemoteMutation: (mutation) => {
        if (mutation.type !== "card.created") return

        const { card, columnId } = mutation

        set((state) => {
          const column = state.columns[columnId]

          if (!column || state.cards[card.id]) return state
          if (card.columnId !== columnId) return state

          return {
            ...state,
            cards: {
              ...state.cards,
              [card.id]: card,
            },
            columns: {
              ...state.columns,
              [columnId]: {
                ...column,
                cardIds: [...column.cardIds, card.id],
              },
            },
          }
        })
      },

      undo: () => {
        set((state) => {
          const previous = state.history.past.at(-1)

          if (!previous) return state

          return {
            ...previous,
            history: {
              past: state.history.past.slice(0, -1),
              future: [snapshot(state), ...state.history.future].slice(
                0,
                historyLimit,
              ),
            },
          }
        })
      },

      redo: () => {
        set((state) => {
          const [next, ...future] = state.history.future

          if (!next) return state

          return {
            ...next,
            history: {
              past: [...state.history.past, snapshot(state)].slice(
                -historyLimit,
              ),
              future,
            },
          }
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
        comments: state.comments,
      }),
    },
  ),
)
