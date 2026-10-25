"use client"

import { X } from "lucide-react"
import { MarkdownDescription } from "@/components/board/markdown-description"
import { CardComments } from "@/components/board/card-comments"
import type { BoardCard } from "@/types/board"

type CardDetailsDialogProps = {
  card: BoardCard
  onClose: () => void
  onEdit: (cardId: string) => void
}

export const CardDetailsDialog = ({
  card,
  onClose,
  onEdit,
}: CardDetailsDialogProps) => (
  <div
    className='fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8'
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}
  >
    <section
      role='dialog'
      aria-modal='true'
      aria-labelledby='card-details-title'
      className='my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8'
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h2
            id='card-details-title'
            className='break-words text-xl font-bold text-ink'
          >
            {card.title}
          </h2>
          <p className='mt-2 text-xs text-muted'>Card details</p>
        </div>

        <button
          type='button'
          aria-label='Close card details'
          onClick={onClose}
          className='rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink'
        >
          <X size={19} aria-hidden='true' />
        </button>
      </div>

      {card.description && (
        <div className='mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-ink/80'>
          <MarkdownDescription value={card.description} />
        </div>
      )}

      {card.tags.length > 0 && (
        <div className='mt-4 flex flex-wrap gap-2'>
          {card.tags.map((tag) => (
            <span
              key={tag}
              className='rounded-full border border-border bg-paper px-3 py-1 text-xs text-ink'
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {card.dueDate && (
        <p className='mt-4 text-sm text-muted'>
          Due{" "}
          {new Date(`${card.dueDate}T00:00:00`).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}

      <div className='mt-5'>
        <button
          type='button'
          onClick={() => onEdit(card.id)}
          className='rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
        >
          Edit card
        </button>
      </div>

      <CardComments cardId={card.id} />
    </section>
  </div>
)
