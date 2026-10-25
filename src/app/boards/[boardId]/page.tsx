"use client"

import Link from "next/link"
import { ArrowLeft, MoreHorizontal } from "lucide-react"
import { useParams } from "next/navigation"
import { useState, type DragEvent, type KeyboardEvent } from "react"
import { AddColumnControl } from "@/components/board/add-column-control"
import { BoardColumn } from "@/components/board/board-column"
import { BoardEmptyState } from "@/components/board/board-empty-state"
import { BoardHeader } from "@/components/board/board-header"
import { CardDialog } from "@/components/board/card-dialog"
import { useAlerts } from "@/components/ui/alert-provider"
import { useBoardStore } from "@/stores/board-store"
import type { BoardCard } from "@/types/board"

type CardDialogState = {
  columnId: string
  cardId?: string
}

type DragTarget = {
  columnId: string
  index: number
}

const BoardPage = () => {
  const params = useParams<{ boardId: string }>()
  const boardId = params.boardId

  const board = useBoardStore((state) => state.boards[boardId])
  const allColumns = useBoardStore((state) => state.columns)
  const allCards = useBoardStore((state) => state.cards)
  const history = useBoardStore((state) => state.history)

  const createColumn = useBoardStore((state) => state.createColumn)
  const updateColumnTitle = useBoardStore((state) => state.updateColumnTitle)
  const deleteColumn = useBoardStore((state) => state.deleteColumn)
  const createCard = useBoardStore((state) => state.createCard)
  const updateCard = useBoardStore((state) => state.updateCard)
  const deleteCard = useBoardStore((state) => state.deleteCard)
  const moveCard = useBoardStore((state) => state.moveCard)
  const undo = useBoardStore((state) => state.undo)
  const redo = useBoardStore((state) => state.redo)

  const { confirm, notify } = useAlerts()
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [cardDialog, setCardDialog] = useState<CardDialogState | null>(null)
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null)

  const columns = (board?.columnIds ?? [])
    .map((id) => allColumns[id])
    .filter((column) => column !== undefined)

  const handleCreateColumn = (title: string) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      notify("Please enter a column name.", "error")
      return false
    }

    const columnId = createColumn(boardId, trimmedTitle)

    if (!columnId) {
      notify("Could not create the column. Please try again.", "error")
      return false
    }

    setIsAddingColumn(false)
    notify("Column created successfully.")
    return true
  }

  const handleRenameColumn = (columnId: string, title: string) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      notify("Please enter a column name.", "error")
      return false
    }

    updateColumnTitle(columnId, trimmedTitle)
    notify("Column renamed successfully.")
    return true
  }

  const handleDeleteColumn = async (columnId: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete this column?",
      message: `"${title}" and all cards inside it will be permanently deleted. This action cannot be undone.`,
      confirmLabel: "Delete column",
      cancelLabel: "Keep column",
      destructive: true,
    })

    if (!confirmed) return

    deleteColumn(columnId)

    if (cardDialog?.columnId === columnId) {
      setCardDialog(null)
    }

    notify("Column deleted successfully.")
  }

  const handleSaveCard = (
    columnId: string,
    cardId: string | undefined,
    values: Omit<BoardCard, "id" | "columnId">,
  ) => {
    if (cardId) {
      updateCard(cardId, values)
      notify("Card updated successfully.")
      return true
    }

    const createdCardId = createCard(columnId, values)

    if (!createdCardId) {
      notify("Could not create the card. Please try again.", "error")
      return false
    }

    notify("Card created successfully.")
    return true
  }

  const handleDeleteCard = async (cardId: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete this card?",
      message: `"${title}" will be permanently deleted. This action cannot be undone.`,
      confirmLabel: "Delete card",
      cancelLabel: "Keep card",
      destructive: true,
    })

    if (!confirmed) return

    deleteCard(cardId)

    if (cardDialog?.cardId === cardId) {
      setCardDialog(null)
    }

    notify("Card deleted successfully.")
  }

  const clearDragState = () => {
    setDraggedCardId(null)
    setDragTarget(null)
  }

  const handleDragStart = (
    event: DragEvent<HTMLElement>,
    cardId: string,
  ) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", cardId)
    setDraggedCardId(cardId)
  }

  const handleDropAtIndex = (
    event: DragEvent<HTMLElement>,
    destinationColumnId: string,
    destinationIndex: number,
  ) => {
    event.preventDefault()

    const cardId = draggedCardId ?? event.dataTransfer.getData("text/plain")
    const card = allCards[cardId]
    const sourceColumn = card ? allColumns[card.columnId] : undefined

    if (!card || !sourceColumn) {
      clearDragState()
      return
    }

    const sourceIndex = sourceColumn.cardIds.indexOf(cardId)
    const adjustedIndex =
      sourceColumn.id === destinationColumnId && sourceIndex < destinationIndex
        ? destinationIndex - 1
        : destinationIndex

    if (moveCard(cardId, destinationColumnId, adjustedIndex)) {
      notify("Card moved successfully.")
    }

    clearDragState()
  }

  const handleKeyboardMove = (
    event: KeyboardEvent<HTMLElement>,
    cardId: string,
    direction: "previous" | "next",
  ) => {
    event.preventDefault()

    const card = allCards[cardId]
    if (!card) return

    const sourceIndex = columns.findIndex((column) => column.id === card.columnId)
    const destinationColumn = columns[
      direction === "previous" ? sourceIndex - 1 : sourceIndex + 1
    ]

    if (!destinationColumn) return

    if (moveCard(cardId, destinationColumn.id, destinationColumn.cardIds.length)) {
      notify(`Card moved to ${destinationColumn.title}.`)
    }
  }

  const handleUndo = () => {
    if (history.past.length === 0) return

    undo()
    notify("Last change undone.", "info")
  }

  const handleRedo = () => {
    if (history.future.length === 0) return

    redo()
    notify("Last change restored.", "info")
  }

  if (!board) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-paper px-6 text-ink'>
        <section className='max-w-md text-center'>
          <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm'>
            <MoreHorizontal size={26} className='text-muted' aria-hidden='true' />
          </div>

          <h1 className='text-2xl font-bold'>Board not found</h1>
          <p className='mt-3 text-sm leading-6 text-muted'>
            This board may have been deleted, or the link may be incorrect.
          </p>

          <Link
            href='/'
            className='mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800'
          >
            <ArrowLeft size={17} aria-hidden='true' />
            Back to workspace
          </Link>
        </section>
      </main>
    )
  }

  const editedCard = cardDialog?.cardId ? allCards[cardDialog.cardId] : undefined

  return (
    <main className='min-h-screen bg-paper text-ink'>
      <BoardHeader
        title={board.title}
        columnCount={columns.length}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <div className='mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10'>
        {board.description && (
          <p className='mb-8 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-muted'>
            {board.description}
          </p>
        )}

        <section aria-label='Board columns'>
          {columns.length === 0 && !isAddingColumn ? (
            <BoardEmptyState onAddColumn={() => setIsAddingColumn(true)} />
          ) : (
            <div className='flex items-start gap-5 overflow-x-auto pb-6'>
              {columns.map((column, index) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  cards={column.cardIds
                    .map((cardId) => allCards[cardId])
                    .filter((card) => card !== undefined)}
                  colorIndex={index}
                  onRename={handleRenameColumn}
                  onDelete={handleDeleteColumn}
                  onCreateCard={(columnId) => setCardDialog({ columnId })}
                  onEditCard={(cardId) => {
                    const card = allCards[cardId]
                    if (card) setCardDialog({ columnId: card.columnId, cardId })
                  }}
                  onDeleteCard={handleDeleteCard}
                  draggedCardId={draggedCardId}
                  dropTargetIndex={
                    dragTarget?.columnId === column.id ? dragTarget.index : null
                  }
                  onDragStart={handleDragStart}
                  onDragOverCard={(event, index) => {
                    event.preventDefault()
                    setDragTarget({ columnId: column.id, index })
                  }}
                  onDropAtIndex={(event, index) =>
                    handleDropAtIndex(event, column.id, index)
                  }
                  onDragEnd={clearDragState}
                  onKeyboardMoveCard={handleKeyboardMove}
                />
              ))}

              <AddColumnControl
                isAdding={isAddingColumn}
                onStart={() => setIsAddingColumn(true)}
                onCancel={() => setIsAddingColumn(false)}
                onCreate={handleCreateColumn}
              />
            </div>
          )}
        </section>
      </div>

      {cardDialog && (
        <CardDialog
          key={cardDialog.cardId ?? `new-${cardDialog.columnId}`}
          columnId={cardDialog.columnId}
          card={editedCard}
          onClose={() => setCardDialog(null)}
          onInvalidTitle={() => notify("Please enter a card title.", "error")}
          onSave={handleSaveCard}
        />
      )}
    </main>
  )
}

export default BoardPage
