import { useState, type DragEvent, type FormEvent, type KeyboardEvent } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { BoardCard } from "@/components/board/board-card"
import type { BoardCard as BoardCardData, BoardColumn as BoardColumnData } from "@/types/board"

const columnColors = [
  "bg-note-yellow",
  "bg-note-blue",
  "bg-note-pink",
  "bg-note-green",
]

type BoardColumnProps = {
  column: BoardColumnData
  cards: BoardCardData[]
  colorIndex: number
  onRename: (columnId: string, title: string) => boolean
  onDelete: (columnId: string, title: string) => void
  onCreateCard: (columnId: string) => void
  onEditCard: (cardId: string) => void
  onDeleteCard: (cardId: string, title: string) => void
  draggedCardId: string | null
  dropTargetIndex: number | null
  onDragStart: (event: DragEvent<HTMLElement>, cardId: string) => void
  onDragOverCard: (event: DragEvent<HTMLElement>, index: number) => void
  onDropAtIndex: (event: DragEvent<HTMLElement>, index: number) => void
  onDragEnd: () => void
  onKeyboardMoveCard: (
    event: KeyboardEvent<HTMLElement>,
    cardId: string,
    direction: "previous" | "next",
  ) => void
}

export const BoardColumn = ({
  column,
  cards,
  colorIndex,
  onRename,
  onDelete,
  onCreateCard,
  onEditCard,
  onDeleteCard,
  draggedCardId,
  dropTargetIndex,
  onDragStart,
  onDragOverCard,
  onDropAtIndex,
  onDragEnd,
  onKeyboardMoveCard,
}: BoardColumnProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)

  const cancelEditing = () => {
    setTitle(column.title)
    setIsEditing(false)
  }

  const handleRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (onRename(column.id, title)) {
      setIsEditing(false)
    }
  }

  return (
    <article
      className={`relative w-72 shrink-0 rounded-2xl border border-black/5 ${columnColors[colorIndex % columnColors.length]} p-4 pt-7 shadow-sm`}
    >
      <span
        aria-hidden='true'
        className='absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full border border-black/15 bg-white shadow-sm'
      />

      {isEditing ? (
        <form onSubmit={handleRename} className='space-y-3'>
          <label
            htmlFor={`rename-column-${column.id}`}
            className='block text-sm font-medium'
          >
            Rename column
          </label>

          <input
            id={`rename-column-${column.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            autoFocus
            className='w-full rounded-lg border border-black/15 bg-white/80 px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
          />

          <div className='flex gap-2'>
            <button
              type='submit'
              className='rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800'
            >
              Save
            </button>
            <button
              type='button'
              onClick={cancelEditing}
              className='rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold transition hover:bg-white/60'
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <h2 className='break-words text-base font-semibold'>{column.title}</h2>
              <p className='mt-1 text-xs text-ink/60'>
                {cards.length} {cards.length === 1 ? "card" : "cards"}
              </p>
            </div>

            <div className='flex shrink-0 items-center gap-1'>
              <button
                type='button'
                aria-label={`Rename ${column.title}`}
                title='Rename column'
                onClick={() => setIsEditing(true)}
                className='rounded-lg p-2 text-ink/60 transition hover:bg-white/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700'
              >
                <Pencil size={15} aria-hidden='true' />
              </button>

              <button
                type='button'
                aria-label={`Delete ${column.title}`}
                title='Delete column'
                onClick={() => onDelete(column.id, column.title)}
                className='rounded-lg p-2 text-ink/60 transition hover:bg-white/60 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-700'
              >
                <Trash2 size={15} aria-hidden='true' />
              </button>
            </div>
          </div>

          <div
            className='mt-4 space-y-3'
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDropAtIndex(event, cards.length)}
          >
            {cards.map((card, index) => (
              <BoardCard
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                isDragging={draggedCardId === card.id}
                isDropTarget={dropTargetIndex === index}
                onDragStart={onDragStart}
                onDragOver={(event) => onDragOverCard(event, index)}
                onDrop={(event) => onDropAtIndex(event, index)}
                onDragEnd={onDragEnd}
                onKeyboardMove={(event, direction) =>
                  onKeyboardMoveCard(event, card.id, direction)
                }
              />
            ))}

            {cards.length === 0 && (
              <p className='rounded-xl border border-dashed border-black/15 bg-white/25 px-3 py-4 text-center text-xs text-ink/60'>
                No cards yet.
              </p>
            )}
          </div>

          <button
            type='button'
            onClick={() => onCreateCard(column.id)}
            className='mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 bg-white/35 px-3 py-2.5 text-xs font-semibold text-ink/70 transition hover:bg-white/75 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
          >
            <Plus size={15} aria-hidden='true' />
            Add card
          </button>
        </>
      )}
    </article>
  )
}
