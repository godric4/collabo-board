"use client"

import Link from "next/link"
import { LayoutGrid, Menu, Plus, X } from "lucide-react"
import { useState } from "react"

const Page = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

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
            <p className='mt-4 text-sm text-muted'>No boards yet</p>
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
            type='button'
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

            <p className='text-sm text-muted'>0 boards</p>
          </div>

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
              className='mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
            >
              <Plus size={17} aria-hidden='true' />
              Create your first board
            </button>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Page
