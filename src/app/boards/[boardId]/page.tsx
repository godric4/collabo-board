"use client"

import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import { useParams } from "next/navigation"
import { useState, type FormEvent, type ReactNode } from "react"
import { useAlerts } from "@/components/ui/alert-provider"
import { useBoardStore } from "@/stores/board-store"

type CardFormValues = {
  title: string
  description: string
  tags: string
  dueDate: string
}

const emptyCardForm: CardFormValues = {
  title: "",
  description: "",
  tags: "",
  dueDate: "",
}

const parseTags = (value: string) => [
  ...new Set(
    value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  ),
]

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g

  return text
    .split(pattern)
    .filter(Boolean)
    .map((part, index) => {
      if (
        (part.startsWith("**") && part.endsWith("**")) ||
        (part.startsWith("__") && part.endsWith("__"))
      ) {
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className='rounded bg-black/5 px-1 py-0.5 font-mono text-[0.85em]'
          >
            {part.slice(1, -1)}
          </code>
        )
      }

      if (
        (part.startsWith("*") && part.endsWith("*")) ||
        (part.startsWith("_") && part.endsWith("_"))
      ) {
        return <em key={index}>{part.slice(1, -1)}</em>
      }

      return part
    })
}

const MarkdownDescription = ({ value }: { value: string }) => {
  const lines = value.split("\n")
  const blocks: ReactNode[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return

    blocks.push(
      <ul
        key={`list-${blocks.length}`}
        className='my-2 list-disc space-y-1 pl-5'
      >
        {listItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    )

    listItems = []
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      return
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/)

    if (listMatch) {
      listItems.push(listMatch[1])
      return
    }

    flushList()

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)

    if (headingMatch) {
      const HeadingTag = `h${headingMatch[1].length}` as "h1" | "h2" | "h3"

      blocks.push(
        <HeadingTag key={`heading-${index}`} className='my-2 font-semibold'>
          {renderInlineMarkdown(headingMatch[2])}
        </HeadingTag>,
      )
      return
    }

    blocks.push(
      <p key={`paragraph-${index}`} className='my-1'>
        {renderInlineMarkdown(trimmed)}
      </p>,
    )
  })

  flushList()

  return <div className='break-words'>{blocks}</div>
}

const BoardPage = () => {
  const params = useParams<{ boardId: string }>()
  const boardId = params.boardId

  const board = useBoardStore((state) => state.boards[boardId])
  const allColumns = useBoardStore((state) => state.columns)
  const allCards = useBoardStore((state) => state.cards)

  const createColumn = useBoardStore((state) => state.createColumn)
  const updateColumnTitle = useBoardStore((state) => state.updateColumnTitle)
  const deleteColumn = useBoardStore((state) => state.deleteColumn)
  const createCard = useBoardStore((state) => state.createCard)
  const updateCard = useBoardStore((state) => state.updateCard)
  const deleteCard = useBoardStore((state) => state.deleteCard)

  const { confirm, notify } = useAlerts()

  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const [cardDialogColumnId, setCardDialogColumnId] = useState<string | null>(
    null,
  )
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [cardForm, setCardForm] = useState<CardFormValues>(emptyCardForm)

  const columns = (board?.columnIds ?? [])
    .map((id) => allColumns[id])
    .filter((column) => column !== undefined)

  const closeAddColumn = () => {
    setIsAddingColumn(false)
    setNewColumnTitle("")
  }

  const cancelEditingColumn = () => {
    setEditingColumnId(null)
    setEditingTitle("")
  }

  const handleCreateColumn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = newColumnTitle.trim()

    if (!trimmedTitle) {
      notify("Please enter a column name.", "error")
      return
    }

    const columnId = createColumn(boardId, trimmedTitle)

    if (!columnId) {
      notify("Could not create the column. Please try again.", "error")
      return
    }

    closeAddColumn()
    notify("Column created successfully.")
  }

  const startEditingColumn = (columnId: string, title: string) => {
    setEditingColumnId(columnId)
    setEditingTitle(title)
  }

  const handleRenameColumn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = editingTitle.trim()

    if (!editingColumnId || !trimmedTitle) {
      notify("Please enter a column name.", "error")
      return
    }

    updateColumnTitle(editingColumnId, trimmedTitle)
    cancelEditingColumn()
    notify("Column renamed successfully.")
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

    if (editingColumnId === columnId) {
      cancelEditingColumn()
    }

    if (cardDialogColumnId === columnId) {
      closeCardDialog()
    }

    notify("Column deleted successfully.")
  }

  const openCreateCardDialog = (columnId: string) => {
    setEditingCardId(null)
    setCardForm(emptyCardForm)
    setCardDialogColumnId(columnId)
  }

  const openEditCardDialog = (cardId: string) => {
    const card = allCards[cardId]

    if (!card) return

    setEditingCardId(cardId)
    setCardDialogColumnId(card.columnId)
    setCardForm({
      title: card.title,
      description: card.description,
      tags: card.tags.join(", "),
      dueDate: card.dueDate ?? "",
    })
  }

  const closeCardDialog = () => {
    setCardDialogColumnId(null)
    setEditingCardId(null)
    setCardForm(emptyCardForm)
  }

  const handleSaveCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = cardForm.title.trim()

    if (!title) {
      notify("Please enter a card title.", "error")
      return
    }

    if (editingCardId) {
      updateCard(editingCardId, {
        title,
        description: cardForm.description,
        tags: parseTags(cardForm.tags),
        dueDate: cardForm.dueDate || null,
      })

      notify("Card updated successfully.")
    } else if (cardDialogColumnId) {
      const cardId = createCard(cardDialogColumnId, {
        title,
        description: cardForm.description,
        tags: parseTags(cardForm.tags),
        dueDate: cardForm.dueDate || null,
      })

      if (!cardId) {
        notify("Could not create the card. Please try again.", "error")
        return
      }

      notify("Card created successfully.")
    } else {
      notify("Could not find the target column.", "error")
      return
    }

    closeCardDialog()
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

    if (editingCardId === cardId) {
      closeCardDialog()
    }

    notify("Card deleted successfully.")
  }

  if (!board) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-paper px-6 text-ink'>
        <section className='max-w-md text-center'>
          <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm'>
            <MoreHorizontal
              size={26}
              className='text-muted'
              aria-hidden='true'
            />
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

  return (
    <main className='min-h-screen bg-paper text-ink'>
      <header className='sticky top-0 z-20 border-b border-border bg-paper/95 backdrop-blur'>
        <div className='mx-auto flex min-h-20 max-w-[1600px] items-center gap-4 px-5 sm:px-8'>
          <Link
            href='/'
            aria-label='Back to all boards'
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white transition hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
          >
            <ArrowLeft size={19} aria-hidden='true' />
          </Link>

          <div className='min-w-0 flex-1'>
            <p className='text-xs font-medium uppercase tracking-widest text-muted'>
              Your workspace
            </p>
            <h1 className='truncate text-xl font-bold tracking-tight sm:text-2xl'>
              {board.title}
            </h1>
          </div>

          <span className='hidden rounded-full border border-border bg-white px-3 py-2 text-xs text-muted sm:inline-flex'>
            {columns.length} {columns.length === 1 ? "column" : "columns"}
          </span>
        </div>
      </header>

      <div className='mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10'>
        {board.description && (
          <p className='mb-8 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-muted'>
            {board.description}
          </p>
        )}

        <section aria-label='Board columns'>
          {columns.length === 0 && !isAddingColumn ? (
            <div className='flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center'>
              <span className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm'>
                <Plus size={25} className='text-teal-700' aria-hidden='true' />
              </span>

              <h2 className='text-lg font-semibold'>Start with a column</h2>
              <p className='mt-2 max-w-sm text-sm leading-6 text-muted'>
                Columns help you organise work into stages, such as To do, In
                progress, and Done.
              </p>

              <button
                type='button'
                onClick={() => setIsAddingColumn(true)}
                className='mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
              >
                <Plus size={18} aria-hidden='true' />
                Add your first column
              </button>
            </div>
          ) : (
            <div className='flex items-start gap-5 overflow-x-auto pb-6'>
              {columns.map((column, index) => {
                const columnColors = [
                  "bg-note-yellow",
                  "bg-note-blue",
                  "bg-note-pink",
                  "bg-note-green",
                ]

                const cards = column.cardIds
                  .map((cardId) => allCards[cardId])
                  .filter((card) => card !== undefined)

                return (
                  <article
                    key={column.id}
                    className={`relative w-72 shrink-0 rounded-2xl border border-black/5 ${columnColors[index % columnColors.length]} p-4 pt-7 shadow-sm`}
                  >
                    <span
                      aria-hidden='true'
                      className='absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full border border-black/15 bg-white shadow-sm'
                    />

                    {editingColumnId === column.id ? (
                      <form onSubmit={handleRenameColumn} className='space-y-3'>
                        <label
                          htmlFor={`rename-column-${column.id}`}
                          className='block text-sm font-medium'
                        >
                          Rename column
                        </label>

                        <input
                          id={`rename-column-${column.id}`}
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(event.target.value)
                          }
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
                            onClick={cancelEditingColumn}
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
                            <h2 className='break-words text-base font-semibold'>
                              {column.title}
                            </h2>
                            <p className='mt-1 text-xs text-ink/60'>
                              {cards.length}{" "}
                              {cards.length === 1 ? "card" : "cards"}
                            </p>
                          </div>

                          <div className='flex shrink-0 items-center gap-1'>
                            <button
                              type='button'
                              aria-label={`Rename ${column.title}`}
                              title='Rename column'
                              onClick={() =>
                                startEditingColumn(column.id, column.title)
                              }
                              className='rounded-lg p-2 text-ink/60 transition hover:bg-white/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700'
                            >
                              <Pencil size={15} aria-hidden='true' />
                            </button>

                            <button
                              type='button'
                              aria-label={`Delete ${column.title}`}
                              title='Delete column'
                              onClick={() =>
                                handleDeleteColumn(column.id, column.title)
                              }
                              className='rounded-lg p-2 text-ink/60 transition hover:bg-white/60 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-700'
                            >
                              <Trash2 size={15} aria-hidden='true' />
                            </button>
                          </div>
                        </div>

                        <div className='mt-4 space-y-3'>
                          {cards.map((card) => (
                            <article
                              key={card.id}
                              className='rounded-xl border border-black/5 bg-white/85 p-3 shadow-sm'
                            >
                              <div className='flex items-start gap-2'>
                                <h3 className='min-w-0 flex-1 break-words text-sm font-semibold'>
                                  {card.title}
                                </h3>

                                <button
                                  type='button'
                                  aria-label={`Edit ${card.title}`}
                                  title='Edit card'
                                  onClick={() => openEditCardDialog(card.id)}
                                  className='shrink-0 rounded-md p-1.5 text-muted transition hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
                                >
                                  <Pencil size={14} aria-hidden='true' />
                                </button>

                                <button
                                  type='button'
                                  aria-label={`Delete ${card.title}`}
                                  title='Delete card'
                                  onClick={() =>
                                    handleDeleteCard(card.id, card.title)
                                  }
                                  className='shrink-0 rounded-md p-1.5 text-muted transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-700'
                                >
                                  <Trash2 size={14} aria-hidden='true' />
                                </button>
                              </div>

                              {card.description && (
                                <div className='mt-2 text-xs leading-5 text-ink/75'>
                                  <MarkdownDescription
                                    value={card.description}
                                  />
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

                              {card.dueDate && (
                                <p className='mt-3 inline-flex items-center gap-1.5 text-xs text-ink/65'>
                                  <CalendarDays size={13} aria-hidden='true' />
                                  Due {formatDate(card.dueDate)}
                                </p>
                              )}
                            </article>
                          ))}

                          {cards.length === 0 && (
                            <p className='rounded-xl border border-dashed border-black/15 bg-white/25 px-3 py-4 text-center text-xs text-ink/60'>
                              No cards yet.
                            </p>
                          )}
                        </div>

                        <button
                          type='button'
                          onClick={() => openCreateCardDialog(column.id)}
                          className='mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 bg-white/35 px-3 py-2.5 text-xs font-semibold text-ink/70 transition hover:bg-white/75 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
                        >
                          <Plus size={15} aria-hidden='true' />
                          Add card
                        </button>
                      </>
                    )}
                  </article>
                )
              })}

              {isAddingColumn ? (
                <form
                  onSubmit={handleCreateColumn}
                  className='w-72 shrink-0 rounded-2xl border border-border bg-white p-4 shadow-sm'
                >
                  <div className='mb-4 flex items-center justify-between gap-3'>
                    <h2 className='text-sm font-semibold'>New column</h2>
                    <button
                      type='button'
                      aria-label='Cancel adding column'
                      onClick={closeAddColumn}
                      className='rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink'
                    >
                      <X size={17} aria-hidden='true' />
                    </button>
                  </div>

                  <label
                    htmlFor='new-column-title'
                    className='mb-2 block text-sm font-medium'
                  >
                    Column name
                  </label>
                  <input
                    id='new-column-title'
                    value={newColumnTitle}
                    onChange={(event) => setNewColumnTitle(event.target.value)}
                    placeholder='e.g. To do'
                    maxLength={80}
                    autoFocus
                    className='w-full rounded-xl border border-border px-3 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
                  />

                  <div className='mt-4 flex gap-2'>
                    <button
                      type='submit'
                      className='flex-1 rounded-xl bg-teal-700 px-3 py-3 text-sm font-semibold text-white transition hover:bg-teal-800'
                    >
                      Create column
                    </button>
                    <button
                      type='button'
                      onClick={closeAddColumn}
                      className='rounded-xl border border-border px-3 py-3 text-sm font-semibold transition hover:bg-paper'
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type='button'
                  onClick={() => setIsAddingColumn(true)}
                  className='flex w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white/50 px-4 py-5 text-sm font-semibold text-muted transition hover:border-teal-700 hover:bg-white hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
                >
                  <Plus size={18} aria-hidden='true' />
                  Add column
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {cardDialogColumnId && (
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCardDialog()
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
                  {editingCardId ? "Edit card" : "Create a card"}
                </h2>
                <p className='mt-2 text-sm leading-6 text-muted'>
                  Capture the details so everyone knows what needs to be done.
                </p>
              </div>

              <button
                type='button'
                aria-label='Close card dialog'
                onClick={closeCardDialog}
                className='rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink'
              >
                <X size={19} aria-hidden='true' />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className='space-y-5'>
              <div>
                <label
                  htmlFor='card-title'
                  className='mb-2 block text-sm font-medium'
                >
                  Card title
                </label>
                <input
                  id='card-title'
                  value={cardForm.title}
                  onChange={(event) =>
                    setCardForm((current) => ({
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
                  value={cardForm.description}
                  onChange={(event) =>
                    setCardForm((current) => ({
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
                  Supports simple Markdown: headings, bold, italic, inline code,
                  and bulleted lists.
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
                  value={cardForm.tags}
                  onChange={(event) =>
                    setCardForm((current) => ({
                      ...current,
                      tags: event.target.value,
                    }))
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
                  value={cardForm.dueDate}
                  onChange={(event) =>
                    setCardForm((current) => ({
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
                  onClick={closeCardDialog}
                  className='rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-paper'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
                >
                  <Plus size={17} aria-hidden='true' />
                  {editingCardId ? "Save changes" : "Create card"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default BoardPage
