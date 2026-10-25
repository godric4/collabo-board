import { Plus } from "lucide-react"

export const BoardEmptyState = ({ onAddColumn }: { onAddColumn: () => void }) => (
  <div className='flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center'>
    <span className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm'>
      <Plus size={25} className='text-teal-700' aria-hidden='true' />
    </span>

    <h2 className='text-lg font-semibold'>Start with a column</h2>
    <p className='mt-2 max-w-sm text-sm leading-6 text-muted'>
      Columns help you organise work into stages, such as To do, In progress, and
      Done.
    </p>

    <button
      type='button'
      onClick={onAddColumn}
      className='mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
    >
      <Plus size={18} aria-hidden='true' />
      Add your first column
    </button>
  </div>
)
