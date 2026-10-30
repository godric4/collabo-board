import type { BoardCard, BoardComment } from "@/types/board"

export type BoardMutation =
  | {
      type: "card.created"
      card: BoardCard
      columnId: string
    }
  | {
      type: "card.updated"
      card: BoardCard
    }
  | {
      type: "card.deleted"
      cardId: string
      columnId: string
    }
  | {
      type: "card.moved"
      cardId: string
      sourceColumnId: string
      destinationColumnId: string
      destinationIndex: number
    }
  | {
      type: "comment.created"
      comment: BoardComment
    }
  | {
      type: "comment.updated"
      comment: BoardComment
    }
  | {
      type: "comment.deleted"
      commentId: string
      cardId: string
    }

export type MutationResult = {
  mutation: BoardMutation
  serverVersion: number
  savedAt: string
}

let serverVersion = 0

export const boardApi = {
  saveMutation: async (mutation: BoardMutation): Promise<MutationResult> => {
    await new Promise((resolve) => setTimeout(resolve, 150))

    serverVersion += 1

    return {
      mutation,
      serverVersion,
      savedAt: new Date().toISOString(),
    }
  },

  reset: () => {
    serverVersion = 0
  },
}
