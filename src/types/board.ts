export type Board = {
  id: string
  title: string
  description: string
  createdAt: string
  columnIds: string[]
}

export type BoardColumn = {
  id: string
  boardId: string
  title: string
  cardIds: string[]
}

export type BoardCard = {
  id: string
  columnId: string
  title: string
  description: string
  tags: string[]
  dueDate: string | null
}

export type BoardComment = {
  id: string
  cardId: string
  parentId: string | null
  content: string
  createdAt: string
  updatedAt: string
}

export type BoardState = {
  boards: Record<string, Board>
  columns: Record<string, BoardColumn>
  cards: Record<string, BoardCard>
  comments: Record<string, BoardComment>
}
