import Link from "next/link"
import { ArrowLeft, Redo2, Undo2 } from "lucide-react"

type BoardHeaderProps = {
  title: string
  columnCount: number
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export const BoardHeader = ({
  title,
  columnCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: BoardHeaderProps) => (
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
          {title}
        </h1>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <div className='flex items-center rounded-xl border border-border bg-white p-1'>
          <button
            type='button'
            aria-label='Undo last change'
            title='Undo last change'
            disabled={!canUndo}
            onClick={onUndo}
            className='rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-teal-700'
          >
            <Undo2 size={17} aria-hidden='true' />
          </button>
          <button
            type='button'
            aria-label='Redo last change'
            title='Redo last change'
            disabled={!canRedo}
            onClick={onRedo}
            className='rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-teal-700'
          >
            <Redo2 size={17} aria-hidden='true' />
          </button>
        </div>

        <span className='hidden rounded-full border border-border bg-white px-3 py-2 text-xs text-muted sm:inline-flex'>
          {columnCount} {columnCount === 1 ? "column" : "columns"}
        </span>
      </div>
    </div>
  </header>
)
