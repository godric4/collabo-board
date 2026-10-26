import { afterEach, describe, expect, it } from "vitest"
import { useBoardStore } from "./board-store"

const resetStore = () => {
  useBoardStore.setState({
    boards: {},
    columns: {},
    cards: {},
    comments: {},
    history: {
      past: [],
      future: [],
    },
  })
}

describe("board store", () => {
  afterEach(() => {
    resetStore()
  })

  it("creates a board and trims its title", () => {
    const boardId = useBoardStore
      .getState()
      .createBoard("  Project ideas  ", "My project")

    expect(boardId).toBeTruthy()

    const board = useBoardStore.getState().boards[boardId!]

    expect(board.title).toBe("Project ideas")
    expect(board.description).toBe("My project")
    expect(board.columnIds).toEqual([])
  })

  it("rejects a board with an empty title", () => {
    const boardId = useBoardStore.getState().createBoard("   ", "My project")

    expect(boardId).toBeNull()
    expect(Object.keys(useBoardStore.getState().boards)).toHaveLength(0)
  })

  it("moves a card between columns", () => {
    const store = useBoardStore.getState()
    const boardId = store.createBoard("Project", "")
    expect(boardId).toBeTruthy()

    const firstColumnId = useBoardStore
      .getState()
      .createColumn(boardId!, "To do")
    const secondColumnId = useBoardStore
      .getState()
      .createColumn(boardId!, "Done")

    expect(firstColumnId).toBeTruthy()
    expect(secondColumnId).toBeTruthy()

    const cardId = useBoardStore
      .getState()
      .createCard(firstColumnId!, { title: "Write tests" })

    expect(cardId).toBeTruthy()

    const moved = useBoardStore.getState().moveCard(cardId!, secondColumnId!, 0)

    expect(moved).toBe(true)
    expect(useBoardStore.getState().cards[cardId!].columnId).toBe(
      secondColumnId,
    )
    expect(
      useBoardStore.getState().columns[firstColumnId!].cardIds,
    ).not.toContain(cardId)
    expect(useBoardStore.getState().columns[secondColumnId!].cardIds).toContain(
      cardId,
    )
  })

  it("creates a comment and a reply", () => {
    const store = useBoardStore.getState()
    const boardId = store.createBoard("Project", "")
    expect(boardId).toBeTruthy()

    const columnId = useBoardStore.getState().createColumn(boardId!, "To do")
    expect(columnId).toBeTruthy()

    const cardId = useBoardStore
      .getState()
      .createCard(columnId!, { title: "Write tests" })
    expect(cardId).toBeTruthy()

    const commentId = useBoardStore
      .getState()
      .createComment(cardId!, "  First comment  ")

    expect(commentId).toBeTruthy()
    expect(useBoardStore.getState().comments[commentId!].content).toBe(
      "First comment",
    )

    const replyId = useBoardStore
      .getState()
      .createComment(cardId!, "A reply", commentId)

    expect(replyId).toBeTruthy()
    expect(useBoardStore.getState().comments[replyId!].parentId).toBe(commentId)
  })

  it("undoes and redoes a board creation", () => {
    const boardId = useBoardStore.getState().createBoard("Project", "")

    expect(boardId).toBeTruthy()
    expect(useBoardStore.getState().boards[boardId!]).toBeDefined()

    useBoardStore.getState().undo()

    expect(useBoardStore.getState().boards[boardId!]).toBeUndefined()

    useBoardStore.getState().redo()

    expect(useBoardStore.getState().boards[boardId!]).toBeDefined()
  })
})
