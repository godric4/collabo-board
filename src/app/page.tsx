"use client"

import Link from "next/link"
import { LayoutGrid, Menu, Plus, Trash2, X, Pencil } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { useAlerts } from "@/components/ui/alert-provider"
import { useBoardStore } from "@/stores/board-store"

const noteColors = [
  "bg-note-green",
  "bg-note-blue",
  "bg-note-yellow",
  "bg-note-pink",
]

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
  const dialogRef = useRef<HTMLElement>(null)
  const dialogTriggerRef = useRef<HTMLElement | null>(null)

  const boardList = Object.values(boards).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  )

  const isEditing = editingBoardId !== null

  useEffect(() => {
    if (dialogOpen) titleInputRef.current?.focus()
  }, [dialogOpen])

  const openCreateDialog = () => {
    dialogTriggerRef.current = document.activeElement as HTMLElement | null
    setEditingBoardId(null)
    setTitle("")
    setDescription("")
    setDialogOpen(true)
  }

  const openEditDialog = (
    boardId: string,
    boardTitle: string,
    boardDescription: string,
    trigger: HTMLElement,
  ) => {
    dialogTriggerRef.current = trigger
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

    // Return the keyboard to the control that opened the dialog.
    requestAnimationFrame(() => {
      if (dialogTriggerRef.current?.isConnected) {
        dialogTriggerRef.current.focus()
      } else {
        createButtonRef.current?.focus()
      }
    })
  }

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      closeDialog()
      return
    }

    if (event.key !== "Tab") return

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "textarea:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(","),
    )

    if (!focusableElements?.length) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
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
      message: `"${boardTitle}" and all its columns and cards will be deleted.`,
      confirmLabel: "Delete board",
      cancelLabel: "Keep board",
      destructive: true,
    })

    if (!confirmed) return

    deleteBoard(boardId)
    notify("Board deleted successfully.")
  }

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
          id='workspace-sidebar'
          aria-label='Workspace sidebar'
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-teal-800/20 bg-teal-700 transition-transform duration-200 md:static md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className='flex h-20 items-center justify-between border-b border-white/15 px-6'>
            <Link
              href='/'
              className='flex items-center gap-3'
              aria-label='Collabo Board home'
            >
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700'>
                <LayoutGrid size={21} aria-hidden='true' />
              </span>
              <span>
                <span className='block text-lg font-bold tracking-tight text-white'>
                  Collabo
                </span>
                <span className='block text-xs text-teal-100'>
                  A little space for big ideas
                </span>
              </span>
            </Link>

            <button
              type='button'
              aria-label='Close sidebar'
              className='rounded-lg p-2 text-white hover:bg-white/10 md:hidden'
              onClick={() => setSidebarOpen(false)}
            >
              <X size={19} aria-hidden='true' />
            </button>
          </div>

          <div className='flex-1 px-4 py-6'>
            <div className='mb-3 flex items-center justify-between px-2'>
              <h2 className='text-xs font-semibold uppercase tracking-widest text-teal-50'>
                Your workspace
              </h2>
              <span className='rounded-full bg-white/15 px-2 py-1 text-xs text-white'>
                {boardList.length}
              </span>
            </div>

            <nav aria-label='Your boards' className='space-y-1'>
              {boardList.map((board, index) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className='flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white transition hover:bg-white/15 focus-visible:outline-white'
                >
                  <span
                    aria-hidden='true'
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      [
                        "bg-note-yellow",
                        "bg-note-pink",
                        "bg-note-blue",
                        "bg-note-green",
                      ][index % 4]
                    }`}
                  />
                  <span className='min-w-0 flex-1 truncate'>{board.title}</span>
                </Link>
              ))}

              {boardList.length === 0 && (
                <p className='px-3 py-3 text-sm leading-6 text-teal-100'>
                  Your boards will show up here once you create one.
                </p>
              )}
            </nav>
          </div>
        </aside>

        <main className='min-w-0 flex-1'>
          <header className='flex h-20 items-center justify-between border-b border-border px-5 sm:px-8'>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                aria-label='Open navigation'
                aria-controls='workspace-sidebar'
                aria-expanded={sidebarOpen}
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
              className='inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800'
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
                  Your projects, plans, and ideas — all in one place.
                </p>
              </div>

              <p className='text-sm text-muted' aria-live='polite'>
                {boardList.length} {boardList.length === 1 ? "board" : "boards"}
              </p>
            </div>

            {boardList.length === 0 ? (
              <section className='flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/50 px-6 py-12 text-center'>
                <div
                  aria-hidden='true'
                  className='mb-5 flex h-14 w-14 rotate-3 items-center justify-center rounded-xl bg-note-yellow shadow-sm'
                >
                  <Plus size={25} />
                </div>
                <h2 className='text-lg font-semibold'>
                  A little space for your next idea
                </h2>
                <p className='mt-2 max-w-sm text-sm leading-6 text-muted'>
                  Start a board for something you are planning, building, or
                  figuring out.
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
                {boardList.map((board, index) => (
                  <article
                    key={board.id}
                    className={`group relative rounded-xl border border-black/5 ${
                      noteColors[index % noteColors.length]
                    } p-5 pt-8 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    {/* A small pin keeps the paper-note idea without adding clutter. */}
                    <span
                      aria-hidden='true'
                      className='absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full border border-black/15 bg-white shadow-sm'
                    />

                    <div className='flex items-start justify-between gap-3'>
                      <Link
                        href={`/boards/${board.id}`}
                        className='min-w-0 flex-1 rounded-sm'
                      >
                        <h3 className='break-words text-lg font-semibold leading-snug'>
                          {board.title}
                        </h3>
                        <p className='mt-2 min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-ink/75'>
                          {board.description || "A space for your ideas."}
                        </p>
                      </Link>

                      <div className='flex shrink-0 items-center gap-1 opacity-100 sm:opacity-70 sm:transition group-hover:opacity-100'>
                        <button
                          type='button'
                          aria-label={`Edit ${board.title}`}
                          title={`Edit ${board.title}`}
                          onClick={(event) =>
                            openEditDialog(
                              board.id,
                              board.title,
                              board.description,
                              event.currentTarget,
                            )
                          }
                          className='rounded-lg p-2 text-ink/65 transition hover:bg-white/60 hover:text-teal-800'
                        >
                          <Pencil size={16} aria-hidden='true' />
                        </button>
                        <button
                          type='button'
                          aria-label={`Delete ${board.title}`}
                          title={`Delete ${board.title}`}
                          onClick={() =>
                            handleDeleteBoard(board.id, board.title)
                          }
                          className='rounded-lg p-2 text-ink/65 transition hover:bg-white/60 hover:text-red-700'
                        >
                          <Trash2 size={16} aria-hidden='true' />
                        </button>
                      </div>
                    </div>

                    <div className='mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-3'>
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
                        className='rounded-sm text-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink'
                      >
                        Open board
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {dialogOpen && (
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-ink/40 px-4 py-8'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <section
            ref={dialogRef}
            role='dialog'
            aria-modal='true'
            aria-labelledby='board-dialog-title'
            aria-describedby='board-dialog-description'
            onKeyDown={handleDialogKeyDown}
            className='my-auto w-full max-w-md rounded-xl border border-border bg-paper p-6 shadow-2xl outline-none sm:p-8'
          >
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-teal-700'>
                  {isEditing ? "Make a change" : "New idea"}
                </p>
                <h2 id='board-dialog-title' className='text-xl font-bold'>
                  {isEditing ? "Edit board" : "Create a board"}
                </h2>
                <p
                  id='board-dialog-description'
                  className='mt-2 text-sm leading-6 text-muted'
                >
                  {isEditing
                    ? "Change the name or give your board a little more context."
                    : "Give your next idea somewhere to live."}
                </p>
              </div>

              <button
                type='button'
                aria-label='Close board dialog'
                onClick={closeDialog}
                className='rounded-lg p-2 text-muted transition hover:bg-white hover:text-ink'
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
                  className='w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
                />
              </div>

              <div>
                <label
                  htmlFor='board-description'
                  className='mb-2 block text-sm font-medium'
                >
                  A few details{" "}
                  <span className='font-normal text-muted'>(optional)</span>
                </label>
                <textarea
                  id='board-description'
                  name='description'
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder='What are you working on?'
                  rows={3}
                  maxLength={500}
                  className='w-full resize-y rounded-lg border border-border bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted/70 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'
                />
              </div>

              <div className='flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end'>
                <button
                  type='button'
                  onClick={closeDialog}
                  className='rounded-lg border border-border px-4 py-3 text-sm font-semibold transition hover:bg-white'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800'
                >
                  {isEditing ? (
                    <Pencil size={16} aria-hidden='true' />
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
