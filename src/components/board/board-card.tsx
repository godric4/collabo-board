"use client"

import { useRef } from "react"
import { CalendarDays, MessageCircle, Pencil, Tag, Trash2 } from "lucide-react"
import type { DragEvent, KeyboardEvent } from "react"
import { MarkdownDescription } from "@/components/board/markdown-description"
import { useBoardStore } from "@/stores/board-store"
import type { BoardCard as BoardCardData } from "@/types/board"

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

type BoardCardProps = {
  card: BoardCardData
  onOpen: (cardId: string) => void
  onEdit: (cardId: string) => void
  onDelete: (cardId: string, title: string) => void
  isDragging: boolean
  isDropTarget: boolean
  onDragStart: (event: DragEvent<HTMLElement>, cardId: string) => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onKeyboardMove: (
    event: KeyboardEvent<HTMLElement>,
    direction: "previous" | "next",
  ) => void
}

export const BoardCard = ({
  card,
  onOpen,
  onEdit,
  onDelete,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onKeyboardMove,
}: BoardCardProps) => {
  const suppressClickRef = useRef(false)

  const commentCount = useBoardStore(
    (state) =>
      Object.values(state.comments).filter(
        (comment) => comment.cardId === card.id,
      ).length,
  )

  return (
    <article
      draggable
      tabIndex={0}
      aria-label={`${card.title}. Open card details`}
      aria-grabbed={isDragging}
      aria-keyshortcuts='Alt+ArrowLeft Alt+ArrowRight Enter'
      onClick={(event) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false
          return
        }

        if ((event.target as HTMLElement).closest("button")) return

        onOpen(card.id)
      }}
      onKeyDown={(event) => {
        if (event.altKey && event.key === "ArrowLeft") {
          onKeyboardMove(event, "previous")
          return
        }

        if (event.altKey && event.key === "ArrowRight") {
          onKeyboardMove(event, "next")
          return
        }

        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault()
          onOpen(card.id)
        }
      }}
      onDragStart={(event) => {
        suppressClickRef.current = true
        onDragStart(event, card.id)
      }}
      onDragOver={(event) => {
        event.stopPropagation()
        onDragOver(event)
      }}
      onDrop={(event) => {
        event.stopPropagation()
        onDrop(event)
      }}
      onDragEnd={() => {
        onDragEnd()

        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 150)
      }}
      className={`cursor-pointer rounded-xl border border-black/5 bg-white/85 p-3 shadow-sm outline-none transition focus-visible:outline-2 focus-visible:outline-teal-700 ${
        isDragging ? "opacity-50" : ""
      } ${isDropTarget ? "ring-2 ring-teal-700 ring-offset-2" : ""}`}
    >
      <div className='flex items-start gap-2'>
        <h3 className='min-w-0 flex-1 break-words text-sm font-semibold'>
          {card.title}
        </h3>

        <button
          type='button'
          aria-label={`Edit ${card.title}`}
          title='Edit card'
          onClick={() => onEdit(card.id)}
          className='shrink-0 rounded-md p-1.5 text-muted transition hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
        >
          <Pencil size={14} aria-hidden='true' />
        </button>

        <button
          type='button'
          aria-label={`Delete ${card.title}`}
          title='Delete card'
          onClick={() => onDelete(card.id, card.title)}
          className='shrink-0 rounded-md p-1.5 text-muted transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-700'
        >
          <Trash2 size={14} aria-hidden='true' />
        </button>
      </div>

      {card.description && (
        <div className='mt-2 text-xs leading-5 text-ink/75'>
          <MarkdownDescription value={card.description} />
        </div>
      )}

      {card.tags.length > 0 && (
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {card.tags.map((tag) => (
            <span
              key={tag}
              className='inline-flex max-w-full items-center gap-1 rounded-full border border-black/10 bg-white/80 px-2 py-1 text-[11px] font-medium'
            >
              <Tag size={11} aria-hidden='true' />
              <span className='break-all'>{tag}</span>
            </span>
          ))}
        </div>
      )}

      {(card.dueDate || commentCount > 0) && (
        <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/65'>
          {card.dueDate && (
            <p className='inline-flex items-center gap-1.5'>
              <CalendarDays size={13} aria-hidden='true' />
              Due {formatDate(card.dueDate)}
            </p>
          )}

          {commentCount > 0 && (
            <span
              className='inline-flex items-center gap-1.5'
              aria-label={`${commentCount} ${
                commentCount === 1 ? "comment" : "comments"
              }`}
              title={`${commentCount} ${
                commentCount === 1 ? "comment" : "comments"
              }`}
            >
              <MessageCircle size={13} aria-hidden='true' />
              {commentCount}
            </span>
          )}
        </div>
      )}
    </article>
  )
}
