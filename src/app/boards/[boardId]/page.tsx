"use client"

import Link from "next/link"
import { useState } from "react"
import type { FormEvent } from "react"
import {
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { useParams } from "next/navigation"
import { useBoardStore } from "@/stores/board-store"

const BoardPage = () => {
  const params = useParams<{ boardId: string }>()
  const boardId = params.boardId

  const board = useBoardStore((state) => state.boards[boardId])
  const allColumns = useBoardStore((state) => state.columns)

  const createColumn = useBoardStore((state) => state.createColumn)
  const updateColumnTitle = useBoardStore((state) => state.updateColumnTitle)
  const deleteColumn = useBoardStore((state) => state.deleteColumn)

  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const columns = (board?.columnIds ?? [])
    .map((id) => allColumns[id])
    .filter((column) => column !== undefined)

  const handleCreateColumn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = newColumnTitle.trim()

    if (!trimmedTitle) return

    const createdColumnId = createColumn(boardId, trimmedTitle)

    if (createdColumnId) {
      setNewColumnTitle("")
      setIsAddingColumn(false)
    }
  }

  const startEditingColumn = (columnId: string, title: string) => {
    setEditingColumnId(columnId)
    setEditingTitle(title)
  }

  const cancelEditingColumn = () => {
    setEditingColumnId(null)
    setEditingTitle("")
  }

  const handleRenameColumn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingColumnId || !editingTitle.trim()) return

    updateColumnTitle(editingColumnId, editingTitle)
    cancelEditingColumn()
  }

  const handleDeleteColumn = (columnId: string, title: string) => {
    const confirmed = window.confirm(
      `Delete "${title}" and all its cards? This cannot be undone.`,
    )

    if (!confirmed) return

    deleteColumn(columnId)

    if (editingColumnId === columnId) {
      cancelEditingColumn()
    }
  }

  if (!board) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-paper px-6 text-ink'>
        <section className='max-w-md text-center'>
          <h1 className='text-2xl font-semibold'>Board not found</h1>
          <p className='mt-2 text-sm leading-6 text-muted'>
            This board may have been deleted, or the link may be incorrect.
          </p>
          <Link
            href='/'
            className='mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
          >
            <ArrowLeft size={17} aria-hidden='true' />
            Back to all boards
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-paper text-ink'>
      <header className='sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur'>
        <div className='mx-auto flex min-h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8'>
          <Link
            href='/'
            aria-label='Back to all boards'
            className='rounded-lg p-2 text-muted hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
          >
            <ArrowLeft size={19} aria-hidden='true' />
          </Link>

          <div className='min-w-0 flex-1'>
            <h1 className='truncate text-lg font-semibold tracking-tight'>
              {board.title}
            </h1>
            <p className='truncate text-sm text-muted'>
              {board.description || "Your ideas, organised."}
            </p>
          </div>

          <span className='hidden rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 sm:inline-flex'>
            {columns.length} {columns.length === 1 ? "column" : "columns"}
          </span>
        </div>
      </header>

      <div className='mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-sm font-medium text-teal-800'>Your workspace</p>
            <h2 className='mt-1 text-2xl font-semibold tracking-tight sm:text-3xl'>
              Board overview
            </h2>
            <p className='mt-2 max-w-xl text-sm leading-6 text-muted'>
              Break your work into columns and keep each idea where it belongs.
            </p>
          </div>

          {!isAddingColumn && (
            <button
              type='button'
              onClick={() => setIsAddingColumn(true)}
              className='inline-flex items-center justify-center gap-2 self-start rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:self-auto'
            >
              <Plus size={17} aria-hidden='true' />
              Add column
            </button>
          )}
        </div>

        {isAddingColumn && (
          <form
            onSubmit={handleCreateColumn}
            className='mb-6 flex max-w-md flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row'
          >
            <label htmlFor='new-column-title' className='sr-only'>
              New column name
            </label>
            <input
              autoFocus
              id='new-column-title'
              name='title'
              value={newColumnTitle}
              onChange={(event) => setNewColumnTitle(event.target.value)}
              maxLength={60}
              required
              placeholder='e.g. To do'
              className='min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20'
            />
            <div className='flex gap-2'>
              <button
                type='submit'
                className='rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700'
              >
                Add
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsAddingColumn(false)
                  setNewColumnTitle("")
                }}
                aria-label='Cancel adding column'
                className='rounded-lg border border-border p-2 text-muted hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700'
              >
                <X size={18} aria-hidden='true' />
              </button>
            </div>
          </form>
        )}

        {columns.length === 0 ? (
          <section className='flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center'>
            <div className='flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700'>
              <Plus size={23} aria-hidden='true' />
            </div>
            <h3 className='mt-5 text-lg font-semibold'>Start with a column</h3>
            <p className='mt-2 max-w-sm text-sm leading-6 text-muted'>
              Add columns such as To do, In progress, and Done to organise this
              board.
            </p>
            {!isAddingColumn && (
              <button
                type='button'
                onClick={() => setIsAddingColumn(true)}
                className='mt-5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
              >
                Create your first column
              </button>
            )}
          </section>
        ) : (
          <section
            aria-label={`${board.title} columns`}
            className='flex items-start gap-5 overflow-x-auto pb-6'
          >
            {columns.map((column, index) => (
              <article
                key={column.id}
                className='w-[280px] shrink-0 sm:w-[300px]'
              >
                <div className='relative rounded-t-xl border border-b-0 border-border bg-white px-4 pb-4 pt-6'>
                  <span
                    aria-hidden='true'
                    className='absolute left-1/2 top-0 z-10 h-4 w-3 -translate-x-1/2 rounded-b-full border border-red-300 bg-red-500 shadow-sm'
                  />

                  <div className='flex items-start justify-between gap-2'>
                    {editingColumnId === column.id ? (
                      <form
                        onSubmit={handleRenameColumn}
                        className='flex min-w-0 flex-1 gap-2'
                      >
                        <label
                          htmlFor={`edit-column-${column.id}`}
                          className='sr-only'
                        >
                          Rename {column.title}
                        </label>
                        <input
                          autoFocus
                          id={`edit-column-${column.id}`}
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(event.target.value)
                          }
                          maxLength={60}
                          required
                          className='min-w-0 flex-1 rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20'
                        />
                        <button
                          type='submit'
                          aria-label='Save column name'
                          className='rounded-md bg-teal-700 px-2 py-1 text-xs font-medium text-white hover:bg-teal-800'
                        >
                          Save
                        </button>
                        <button
                          type='button'
                          onClick={cancelEditingColumn}
                          aria-label='Cancel renaming column'
                          className='rounded-md p-1 text-muted hover:bg-paper'
                        >
                          <X size={16} aria-hidden='true' />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className='min-w-0'>
                          <h3 className='break-words font-semibold'>
                            {column.title}
                          </h3>
                          <p className='mt-1 text-xs text-muted'>
                            {column.cardIds.length}{" "}
                            {column.cardIds.length === 1 ? "card" : "cards"}
                          </p>
                        </div>

                        <div className='flex shrink-0 items-center gap-1'>
                          <button
                            type='button'
                            aria-label={`Rename ${column.title}`}
                            onClick={() =>
                              startEditingColumn(column.id, column.title)
                            }
                            className='rounded-md p-2 text-muted hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
                          >
                            <Pencil size={15} aria-hidden='true' />
                          </button>
                          <button
                            type='button'
                            aria-label={`Delete ${column.title}`}
                            onClick={() =>
                              handleDeleteColumn(column.id, column.title)
                            }
                            className='rounded-md p-2 text-muted hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-700'
                          >
                            <Trash2 size={15} aria-hidden='true' />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`min-h-44 rounded-b-xl border border-border p-3 ${
                    index % 4 === 0
                      ? "bg-note-yellow"
                      : index % 4 === 1
                        ? "bg-note-pink"
                        : index % 4 === 2
                          ? "bg-note-blue"
                          : "bg-note-green"
                  }`}
                >
                  <div className='flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-black/15 px-4 py-6 text-center'>
                    <MoreHorizontal
                      size={21}
                      className='text-ink/50'
                      aria-hidden='true'
                    />
                    <p className='mt-2 text-sm font-medium text-ink/75'>
                      No cards yet
                    </p>
                    <p className='mt-1 text-xs leading-5 text-ink/60'>
                      Cards for this column will appear here.
                    </p>
                  </div>
                </div>
              </article>
            ))}

            {!isAddingColumn && (
              <button
                type='button'
                onClick={() => setIsAddingColumn(true)}
                className='flex w-[180px] shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-white/60 px-4 py-4 text-sm font-medium text-muted transition-colors hover:border-teal-600 hover:bg-white hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700'
              >
                <Plus size={17} aria-hidden='true' />
                Add column
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default BoardPage
