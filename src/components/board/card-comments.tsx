"use client"

import { useState, type FormEvent } from "react"
import { MessageCircle, Send } from "lucide-react"
import { useBoardStore } from "@/stores/board-store"
import { CommentThread } from "@/components/board/comment-thread"

type CardCommentsProps = {
  cardId: string
}

export const CardComments = ({ cardId }: CardCommentsProps) => {
  const [content, setContent] = useState("")

  const comments = useBoardStore((state) => state.comments)
  const createComment = useBoardStore((state) => state.createComment)

  const cardComments = Object.values(comments)
    .filter((comment) => comment.cardId === cardId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const rootComments = cardComments.filter(
    (comment) => comment.parentId === null,
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (!trimmedContent) return

    const createdId = createComment(cardId, trimmedContent)

    if (createdId) {
      setContent("")
    }
  }

  return (
    <section className='mt-6 border-t border-border pt-5'>
      <div className='mb-4 flex items-center gap-2'>
        <MessageCircle size={18} className='text-muted' />
        <h3 className='font-semibold text-ink'>Comments</h3>
        <span className='rounded-full bg-note-blue px-2 py-0.5 text-xs text-ink'>
          {cardComments.length}
        </span>
      </div>

      <form onSubmit={handleSubmit} className='space-y-2'>
        <label htmlFor={`new-comment-${cardId}`} className='sr-only'>
          Add a comment
        </label>
        <textarea
          id={`new-comment-${cardId}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder='Share a thought or ask a question...'
          rows={3}
          maxLength={2000}
          required
          className='w-full resize-y rounded-xl border border-border bg-white p-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20'
        />

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={!content.trim()}
            className='inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40'
          >
            <Send size={15} />
            Add comment
          </button>
        </div>
      </form>

      <div className='mt-5 space-y-4'>
        {rootComments.length === 0 ? (
          <p className='rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted'>
            No comments yet. Start the conversation.
          </p>
        ) : (
          rootComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              comments={comments}
            />
          ))
        )}
      </div>
    </section>
  )
}
