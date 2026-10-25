import { useState, type FormEvent } from "react"
import { Plus, X } from "lucide-react"
import { CardComments } from "@/components/board/card-comments"
import type { BoardCard } from "@/types/board"

export type CardFormValues = {
  title: string
  description: string
  tags: string
  dueDate: string
}

const toFormValues = (card?: BoardCard): CardFormValues => ({
  title: card?.title ?? "",
  description: card?.description ?? "",
  tags: card?.tags.join(", ") ?? "",
  dueDate: card?.dueDate ?? "",
})

const parseTags = (value: string) => [
  ...new Set(
    value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  ),
]

type CardDialogProps = {
  columnId: string
  card?: BoardCard
  onClose: () => void
  onInvalidTitle: () => void
  onSave: (
    columnId: string,
    cardId: string | undefined,
    values: Omit<BoardCard, "id" | "columnId">,
  ) => boolean
}

export const CardDialog = ({
  columnId,
  card,
  onClose,
  onInvalidTitle,
  onSave,
}: CardDialogProps) => {
  const [form, setForm] = useState<CardFormValues>(() => toFormValues(card))

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = form.title.trim()
    if (!title) {
      onInvalidTitle()
      return
    }

    const saved = onSave(columnId, card?.id, {
      title,
      description: form.description,
      tags: parseTags(form.tags),
      dueDate: form.dueDate || null,
    })

    if (saved) onClose()
  }

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role='dialog'
        aria-modal='true'
        aria-labelledby='card-dialog-title'
        className='my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8'
      >
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h2 id='card-dialog-title' className='text-xl font-bold'>
              {card ? "Edit card" : "Create a card"}
            </h2>
            <p className='mt-2 text-sm leading-6 text-muted'>
              Capture the details so everyone knows what needs to be done.
            </p>
          </div>

          <button
            type='button'
            aria-label='Close card dialog'
            onClick={onClose}
            className='rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink'
          >
            <X size={19} aria-hidden='true' />
          </button>
        </div>

        <form onSubmit={handleSave} className='space-y-5'>
          <div>
            <label
              htmlFor='card-title'
              className='mb-2 block text-sm font-medium'
            >
              Card title
            </label>
            <input
              id='card-title'
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              maxLength={120}
              autoFocus
              placeholder='e.g. Draft the homepage'
              className='w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
            />
          </div>

          <div>
            <label
              htmlFor='card-description'
              className='mb-2 block text-sm font-medium'
            >
              Description
            </label>
            <textarea
              id='card-description'
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={5}
              maxLength={5000}
              placeholder={
                "Describe the task...\n\nUse **bold**, *italic*, `code`, # headings, and - list items."
              }
              className='w-full resize-y rounded-xl border border-border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
            />
            <p className='mt-2 text-xs leading-5 text-muted'>
              Supports simple Markdown: headings, bold, italic, inline code, and
              bulleted lists.
            </p>
          </div>

          <div>
            <label
              htmlFor='card-tags'
              className='mb-2 block text-sm font-medium'
            >
              Tags
            </label>
            <input
              id='card-tags'
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({ ...current, tags: event.target.value }))
              }
              placeholder='Design, High priority, Research'
              className='w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
            />
            <p className='mt-2 text-xs text-muted'>
              Separate tags with commas.
            </p>
          </div>

          <div>
            <label
              htmlFor='card-due-date'
              className='mb-2 block text-sm font-medium'
            >
              Due date{" "}
              <span className='font-normal text-muted'>(optional)</span>
            </label>
            <input
              id='card-due-date'
              type='date'
              value={form.dueDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
              className='w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
            />
          </div>

          <div className='flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-paper'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
            >
              <Plus size={17} aria-hidden='true' />
              {card ? "Save changes" : "Create card"}
            </button>
          </div>
        </form>
        {card && <CardComments cardId={card.id} />}
      </section>
    </div>
  )
}
