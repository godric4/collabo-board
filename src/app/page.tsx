"use client"

import Link from "next/link"
import { LayoutGrid, Menu, Plus, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useBoardStore } from "@/stores/board-store"

const Page = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const titleInputRef = useRef<HTMLInputElement>(null)
  const createButtonRef = useRef<HTMLButtonElement>(null)

  const boards = useBoardStore((state) => state.boards)
  const createBoard = useBoardStore((state) => state.createBoard)
  const boardList = Object.values(boards)

  const closeSidebar = () => setSidebarOpen(false)

  const openDialog = () => {
    // console.log("Create board clicked")
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setTitle("")
    setDescription("")
    requestAnimationFrame(() => createButtonRef.current?.focus())
  }

  useEffect(() => {
    if (!dialogOpen) return

    titleInputRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dialogOpen])

  const handleCreateBoard = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      titleInputRef.current?.focus()
      return
    }

    createBoard(trimmedTitle, description)
    closeDialog()
  }

  return (
    <div className='min-h-screen bg-paper text-ink'>
      {sidebarOpen && (
        <button
          type='button'
          aria-label='Close navigation'
          onClick={closeSidebar}
          className='fixed inset-0 z-40 bg-black/30 md:hidden'
        />
      )}

      <aside
        id='main-sidebar'
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className='flex h-16 items-center justify-between border-b border-border px-5'>
          <Link
            href='/'
            onClick={closeSidebar}
            className='flex items-center gap-2.5 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700'
          >
            <span className='flex size-8 items-center justify-center rounded-lg bg-teal-700 text-white'>
              <LayoutGrid size={18} aria-hidden='true' />
            </span>
            Collabo Board
          </Link>

          <button
            type='button'
            onClick={closeSidebar}
            aria-label='Close sidebar'
            className='rounded-md p-2 text-muted hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700 md:hidden'
          >
            <X size={18} aria-hidden='true' />
          </button>
        </div>

        <nav aria-label='Main navigation' className='flex-1 p-3'>
          <Link
            href='/'
            onClick={closeSidebar}
            aria-current='page'
            className='flex items-center gap-3 rounded-lg bg-teal-50 px-3 py-2.5 text-sm font-medium text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
          >
            <LayoutGrid size={18} aria-hidden='true' />
            All boards
          </Link>

          <div className='mt-8 px-3'>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted'>
              Your workspace
            </p>

            {boardList.length === 0 ? (
              <p className='mt-4 text-sm text-muted'>No boards yet</p>
            ) : (
              <ul className='mt-3 space-y-1'>
                {boardList.map((board) => (
                  <li key={board.id}>
                    <Link
                      href={`/boards/${board.id}`}
                      onClick={closeSidebar}
                      className='block truncate rounded-lg px-3 py-2 text-sm text-muted hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
                    >
                      {board.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <div className='border-t border-border p-4'>
          <p className='text-xs leading-5 text-muted'>
            A little space for big ideas.
          </p>
        </div>
      </aside>

      <div className='min-h-screen md:pl-64'>
        <header className='flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              aria-label='Open navigation'
              aria-controls='main-sidebar'
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
              className='rounded-md p-2 hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700 md:hidden'
            >
              <Menu size={20} aria-hidden='true' />
            </button>

            <span className='text-sm text-muted'>Workspace</span>
          </div>

          <button
            ref={createButtonRef}
            type='button'
            onClick={openDialog}
            className='inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
          >
            <Plus size={17} aria-hidden='true' />
            <span>Create board</span>
          </button>
        </header>

        <main className='mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                All boards
              </h1>
              <p className='mt-2 text-sm leading-6 text-muted'>
                Keep your projects and ideas organised.
              </p>
            </div>

            <p className='text-sm text-muted'>
              {boardList.length} {boardList.length === 1 ? "board" : "boards"}
            </p>
          </div>

          {boardList.length === 0 ? (
            <section
              aria-labelledby='empty-state-title'
              className='mt-10 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center'
            >
              <div className='flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700'>
                <LayoutGrid size={23} aria-hidden='true' />
              </div>

              <h2
                id='empty-state-title'
                className='mt-5 text-lg font-semibold tracking-tight'
              >
                No boards yet
              </h2>

              <p className='mt-2 max-w-sm text-sm leading-6 text-muted'>
                Create a board to organise tasks, track progress, and keep your
                ideas in one place.
              </p>

              <button
                type='button'
                onClick={openDialog}
                className='mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
              >
                <Plus size={17} aria-hidden='true' />
                Create your first board
              </button>
            </section>
          ) : (
            <section
              aria-label='Your boards'
              className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
            >
              {boardList.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className='rounded-xl border border-border bg-white p-5 transition-colors hover:border-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
                >
                  <h2 className='truncate font-semibold'>{board.title}</h2>
                  <p className='mt-2 line-clamp-3 min-h-12 text-sm leading-6 text-muted'>
                    {board.description || "No description"}
                  </p>
                  <p className='mt-4 text-xs text-muted'>
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </section>
          )}
        </main>
      </div>

      {dialogOpen && (
        <div
          className='fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <section
            role='dialog'
            aria-modal='true'
            aria-labelledby='create-board-title'
            className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 id='create-board-title' className='text-lg font-semibold'>
                  Create a board
                </h2>
                <p className='mt-1 text-sm text-muted'>
                  Give your workspace a name and a short description.
                </p>
              </div>

              <button
                type='button'
                aria-label='Close create board dialog'
                onClick={closeDialog}
                className='rounded-md p-2 text-muted hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700'
              >
                <X size={18} aria-hidden='true' />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className='mt-6 space-y-5'>
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
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={80}
                  placeholder='e.g. Website redesign'
                  className='w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20'
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
                  maxLength={300}
                  rows={3}
                  placeholder='What will this board help you organise?'
                  className='w-full resize-y rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20'
                />
              </div>

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={closeDialog}
                  className='rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
                >
                  Create board
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
