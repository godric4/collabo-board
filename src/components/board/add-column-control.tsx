import { useState, type FormEvent } from "react"
import { Plus, X } from "lucide-react"

type AddColumnControlProps = {
  isAdding: boolean
  onStart: () => void
  onCancel: () => void
  onCreate: (title: string) => boolean
}

export const AddColumnControl = ({
  isAdding,
  onStart,
  onCancel,
  onCreate,
}: AddColumnControlProps) => {
  const [title, setTitle] = useState("")

  const cancel = () => {
    setTitle("")
    onCancel()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (onCreate(title)) {
      setTitle("")
    }
  }

  if (!isAdding) {
    return (
      <button
        type='button'
        onClick={onStart}
        className='flex w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white/50 px-4 py-5 text-sm font-semibold text-muted transition hover:border-teal-700 hover:bg-white hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700'
      >
        <Plus size={18} aria-hidden='true' />
        Add column
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='w-72 shrink-0 rounded-2xl border border-border bg-white p-4 shadow-sm'
    >
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h2 className='text-sm font-semibold'>New column</h2>
        <button
          type='button'
          aria-label='Cancel adding column'
          onClick={cancel}
          className='rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink'
        >
          <X size={17} aria-hidden='true' />
        </button>
      </div>

      <label htmlFor='new-column-title' className='mb-2 block text-sm font-medium'>
        Column name
      </label>
      <input
        id='new-column-title'
        value={title}
        onChange={(event) => setTitle(event.target.value)}
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
          onClick={cancel}
          className='rounded-xl border border-border px-3 py-3 text-sm font-semibold transition hover:bg-paper'
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
