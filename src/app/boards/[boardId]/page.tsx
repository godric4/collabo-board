"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"
import { useBoardStore } from "@/stores/board-store"

export default function BoardPage() {
  const params = useParams<{ boardId: string }>()
  const boardId = params.boardId

  // Subscribe to the board identified by this route.
  const board = useBoardStore((state) => state.boards[boardId])

  if (!board) {
    return (
      <main className='min-h-screen bg-paper px-6 py-10 text-ink'>
        <div className='mx-auto max-w-3xl'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
          >
            <ArrowLeft size={16} aria-hidden='true' />
            Back to all boards
          </Link>

          <h1 className='mt-10 text-2xl font-semibold'>Board not found</h1>
          <p className='mt-2 text-muted'>
            This board may have been deleted or the link may be incorrect.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-paper px-6 py-8 text-ink sm:px-10'>
      <div className='mx-auto max-w-6xl'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-700'
        >
          <ArrowLeft size={16} aria-hidden='true' />
          All boards
        </Link>

        <header className='mt-8'>
          <p className='text-sm text-muted'>Your workspace</p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight'>
            {board.title}
          </h1>
          {board.description && (
            <p className='mt-3 max-w-2xl leading-7 text-muted'>
              {board.description}
            </p>
          )}
        </header>

        <section
          aria-label='Board columns'
          className='mt-10 rounded-2xl border border-dashed border-border p-10 text-center'
        >
          <h2 className='font-semibold'>Your ideas will live here</h2>
          <p className='mt-2 text-sm text-muted'>
            We&apos;ll add columns and pinned sticky notes here next.
          </p>
        </section>
      </div>
    </main>
  )
}
