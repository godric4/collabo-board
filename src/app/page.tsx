"use client"

import Link from "next/link"
import { LayoutGrid, Menu, Plus, Trash2, X, Pencil } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { useAlerts } from "@/components/ui/alert-provider"
import { useBoardStore } from "@/stores/board-store"

const Page = () => {
  const boards = useBoardStore((state) => state.boards)
  const createBoard = useBoardStore((state) => state.createBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  const deleteBoard = useBoardStore((state) => state.deleteBoard)
  const { confirm, notify } = useAlerts()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const createButtonRef = useRef<HTMLButtonElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const boardList = Object.values(boards).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  )

  const isEditing = editingBoardId !== null

  useEffect(() => {
    if (dialogOpen) {
      titleInputRef.current?.focus()
    }
  }, [dialogOpen])

  const openCreateDialog = () => {
    setEditingBoardId(null)
    setTitle("")
    setDescription("")
    setDialogOpen(true)
  }

  const openEditDialog = (
    boardId: string,
    boardTitle: string,
    boardDescription: string,
  ) => {
    setEditingBoardId(boardId)
    setTitle(boardTitle)
    setDescription(boardDescription)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingBoardId(null)
    setTitle("")
    setDescription("")

    requestAnimationFrame(() => {
      createButtonRef.current?.focus()
    })
  }

  const handleSaveBoard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      notify("Please enter a board name.", "error")
      titleInputRef.current?.focus()
      return
    }

    if (editingBoardId) {
      updateBoard(editingBoardId, trimmedTitle, trimmedDescription)
      notify(`Board "${trimmedTitle}" updated successfully.`, "success")
    } else {
      const boardId = createBoard(trimmedTitle, trimmedDescription)

      if (!boardId) {
        notify("Could not create the board. Please try again.", "error")
        return
      }

      notify(`Board "${trimmedTitle}" created successfully.`, "success")
    }

    closeDialog()
  }

  const handleDeleteBoard = async (boardId: string, boardTitle: string) => {
    const confirmed = await confirm({
      title: "Delete this board?",
      message: `"${boardTitle}" and all its columns and cards will be permanently deleted. This action cannot be undone.`,
      confirmLabel: "Delete board",
      cancelLabel: "Keep board",
      destructive: true,
    })

    if (!confirmed) return

    deleteBoard(boardId)
    notify("Board deleted successfully.")
  }

  useEffect(() => {
    if (!dialogOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [dialogOpen])

  return (
    <div className='min-h-screen bg-paper text-ink'>
      <div className='flex min-h-screen'>
        {sidebarOpen && (
          <button
            type='button'
            aria-label='Close navigation'
            className='fixed inset-0 z-30 bg-black/30 md:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-white transition-transform duration-200 md:static md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className='flex h-20 items-center justify-between border-b border-border px-6'>
            <Link
              href='/'
              className='flex items-center gap-3'
              aria-label='Collabo Board home'
            >
              <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white'>
                <LayoutGrid size={21} aria-hidden='true' />
              </span>
              <span>
                <span className='block text-lg font-bold tracking-tight'>
                  Collabo Board
                </span>
                <span className='block text-xs text-muted'>
                  A little space for big ideas
                </span>
              </span>
            </Link>

            <button
              type='button'
              aria-label='Close sidebar'
              className='rounded-lg p-2 text-muted hover:bg-paper md:hidden'
              onClick={() => setSidebarOpen(false)}
            >
              <X size={19} aria-hidden='true' />
            </button>
          </div>

          <div className='flex-1 px-4 py-6'>
            <div className='mb-3 flex items-center justify-between px-2'>
              <h2 className='text-xs font-semibold uppercase tracking-widest text-muted'>
                Your workspace
              </h2>
              <span className='rounded-full bg-paper px-2 py-1 text-xs text-muted'>
                {boardList.length}
              </span>
            </div>

            <nav aria-label='Your boards' className='space-y-1'>
              {boardList.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className='flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink transition hover:bg-paper'
                >
                  <span className='h-2 w-2 shrink-0 rounded-full bg-teal-600' />
                  <span className='min-w-0 flex-1 truncate'>{board.title}</span>
                </Link>
              ))}

              {boardList.length === 0 && (
                <p className='px-3 py-3 text-sm leading-6 text-muted'>
                  Your boards will show up here once you create one.
                </p>
              )}
            </nav>
          </div>

          <div className='border-t border-border px-6 py-4'>
            <p className='text-xs text-muted'>Make room for good ideas.</p>
          </div>
        </aside>

        <main className='min-w-0 flex-1'>
          <header className='flex h-20 items-center justify-between border-b border-border px-5 sm:px-8'>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                aria-label='Open navigation'
                className='rounded-lg p-2 hover:bg-white md:hidden'
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={21} aria-hidden='true' />
              </button>

              <div>
                <p className='text-sm text-muted'>Workspace</p>
                <h1 className='text-xl font-bold tracking-tight sm:text-2xl'>
                  Your boards
                </h1>
              </div>
            </div>

            <button
              ref={createButtonRef}
              type='button'
              onClick={openCreateDialog}
              className='inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
            >
              <Plus size={18} aria-hidden='true' />
              <span className='hidden sm:inline'>New board</span>
              <span className='sm:hidden'>New</span>
            </button>
          </header>

          <div className='mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10'>
            <div className='mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <h2 className='text-lg font-semibold'>All boards</h2>
                <p className='mt-1 text-sm text-muted'>
                  Keep your projects, plans, and ideas in one place.
                </p>
              </div>

              <p className='text-sm text-muted'>
                {boardList.length} {boardList.length === 1 ? "board" : "boards"}
              </p>
            </div>

            {boardList.length === 0 ? (
              <section className='flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center'>
                <span className='mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm'>
                  <LayoutGrid
                    size={28}
                    className='text-teal-700'
                    aria-hidden='true'
                  />
                </span>

                <h2 className='text-xl font-semibold'>
                  Your first board starts here
                </h2>

                <p className='mt-2 max-w-sm text-sm leading-6 text-muted'>
                  Create a board for a project, a plan, or an idea you want to
                  bring to life.
                </p>

                <button
                  type='button'
                  onClick={openCreateDialog}
                  className='mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800'
                >
                  <Plus size={18} aria-hidden='true' />
                  Create your first board
                </button>
              </section>
            ) : (
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
                {boardList.map((board, index) => {
                  const noteColors = [
                    "bg-note-yellow",
                    "bg-note-pink",
                    "bg-note-blue",
                    "bg-note-green",
                  ]

                  const noteColor = noteColors[index % noteColors.length]

                  return (
                    <article
                      key={board.id}
                      className={`group relative rounded-2xl border border-black/5 ${noteColor} p-5 pt-8 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
                    >
                      <span
                        aria-hidden='true'
                        className='absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full border border-black/15 bg-white shadow-sm'
                      />

                      <div className='flex items-start justify-between gap-3'>
                        <Link
                          href={`/boards/${board.id}`}
                          className='min-w-0 flex-1 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800'
                        >
                          <h3 className='break-words text-lg font-semibold'>
                            {board.title}
                          </h3>

                          <p className='mt-2 min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-ink/75'>
                            {board.description || "A space for your ideas."}
                          </p>
                        </Link>

                        <div className='flex shrink-0 items-center gap-1'>
                          <button
                            type='button'
                            aria-label={`Edit ${board.title}`}
                            title={`Edit ${board.title}`}
                            onClick={() =>
                              openEditDialog(
                                board.id,
                                board.title,
                                board.description,
                              )
                            }
                            className='rounded-lg p-2 text-ink/60 transition hover:bg-white/60 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
                          >
                            <Pencil size={17} aria-hidden='true' />
                          </button>

                          <button
                            type='button'
                            aria-label={`Delete ${board.title}`}
                            title={`Delete ${board.title}`}
                            onClick={() =>
                              handleDeleteBoard(board.id, board.title)
                            }
                            className='rounded-lg p-2 text-ink/60 transition hover:bg-white/60 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700'
                          >
                            <Trash2 size={17} aria-hidden='true' />
                          </button>
                        </div>
                      </div>

                      <div className='mt-5 flex items-center justify-between border-t border-black/10 pt-3'>
                        <p className='text-xs text-ink/60'>
                          Created{" "}
                          {new Date(board.createdAt).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>

                        <Link
                          href={`/boards/${board.id}`}
                          className='text-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink'
                        >
                          Open board
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {dialogOpen && (
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog()
            }
          }}
        >
          <section
            role='dialog'
            aria-modal='true'
            aria-labelledby='board-dialog-title'
            aria-describedby='board-dialog-description'
            className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8'
          >
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <h2 id='board-dialog-title' className='text-xl font-bold'>
                  {isEditing ? "Edit board" : "Create a board"}
                </h2>
                <p
                  id='board-dialog-description'
                  className='mt-2 text-sm leading-6 text-muted'
                >
                  {isEditing
                    ? "Update your board name or description."
                    : "Give your next idea a place to grow."}
                </p>
              </div>

              <button
                type='button'
                aria-label='Close board dialog'
                onClick={closeDialog}
                className='rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink'
              >
                <X size={19} aria-hidden='true' />
              </button>
            </div>

            <form onSubmit={handleSaveBoard} className='space-y-5'>
              <div>
                <label
                  htmlFor='board-title'
                  className='mb-2 block text-sm font-medium'
                >
                  Board name
                </label>
                <input
                  ref={titleInputRef}
                  id='board-title'
                  name='title'
                  type='text'
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder='e.g. Website redesign'
                  maxLength={100}
                  required
                  className='w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
                />
              </div>

              <div>
                <label
                  htmlFor='board-description'
                  className='mb-2 block text-sm font-medium'
                >
                  Description{" "}
                  <span className='font-normal text-muted'>(optional)</span>
                </label>
                <textarea
                  id='board-description'
                  name='description'
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder='What is this board for?'
                  rows={3}
                  maxLength={500}
                  className='w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
                />
              </div>

              <div className='flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end'>
                <button
                  type='button'
                  onClick={closeDialog}
                  className='rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-paper'
                >
                  Cancel
                </button>

                <button
                  type='submit'
                  className='inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
                >
                  {isEditing ? (
                    <Pencil size={17} aria-hidden='true' />
                  ) : (
                    <Plus size={17} aria-hidden='true' />
                  )}
                  {isEditing ? "Save changes" : "Create board"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Page
