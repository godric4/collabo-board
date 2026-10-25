"use client"

import { useState, type FormEvent } from "react"
import { Check, MessageCircle, Pencil, Trash2, X } from "lucide-react"
import { useBoardStore } from "@/stores/board-store"
import type { BoardComment } from "@/types/board"

type CommentThreadProps = {
  comment: BoardComment
  comments: Record<string, BoardComment>
  depth?: number
}

export const CommentThread = ({
  comment,
  comments,
  depth = 0,
}: CommentThreadProps) => {
  const [replyText, setReplyText] = useState("")
  const [editText, setEditText] = useState(comment.content)
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const createComment = useBoardStore((state) => state.createComment)
  const updateComment = useBoardStore((state) => state.updateComment)
  const deleteComment = useBoardStore((state) => state.deleteComment)

  const replies = Object.values(comments)
    .filter((item) => item.parentId === comment.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const handleReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const content = replyText.trim()

    if (!content) return

    const createdId = createComment(comment.cardId, content, comment.id)

    if (createdId) {
      setReplyText("")
      setIsReplying(false)
    }
  }

  const handleEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const content = editText.trim()

    if (!content) return

    updateComment(comment.id, content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm("Delete this comment and all its replies?")) {
      deleteComment(comment.id)
    }
  }

  return (
    <div className='min-w-0'>
      <article className='rounded-xl border border-border bg-paper p-3'>
        {isEditing ? (
          <form onSubmit={handleEdit} className='space-y-2'>
            <label htmlFor={`edit-comment-${comment.id}`} className='sr-only'>
              Edit comment
            </label>
            <textarea
              id={`edit-comment-${comment.id}`}
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              rows={3}
              maxLength={2000}
              required
              className='w-full resize-y rounded-lg border border-border bg-white p-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20'
            />
            <div className='flex gap-2'>
              <button
                type='submit'
                className='inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white'
              >
                <Check size={14} />
                Save
              </button>
              <button
                type='button'
                onClick={() => {
                  setEditText(comment.content)
                  setIsEditing(false)
                }}
                className='inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-ink'
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className='whitespace-pre-wrap break-words text-sm text-ink'>
              {comment.content}
            </p>

            <p className='mt-2 text-xs text-muted'>
              {new Date(comment.createdAt).toLocaleString()}
              {comment.updatedAt !== comment.createdAt && " · Edited"}
            </p>

            <div className='mt-3 flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={() => setIsReplying((value) => !value)}
                aria-expanded={isReplying}
                className='inline-flex items-center gap-1 text-xs text-muted hover:text-ink'
              >
                <MessageCircle size={14} />
                Reply
              </button>

              <button
                type='button'
                onClick={() => {
                  setEditText(comment.content)
                  setIsEditing(true)
                  setIsReplying(false)
                }}
                className='inline-flex items-center gap-1 text-xs text-muted hover:text-ink'
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type='button'
                onClick={handleDelete}
                className='inline-flex items-center gap-1 text-xs text-muted hover:text-red-600'
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </>
        )}
      </article>

      {isReplying && (
        <form onSubmit={handleReply} className='mt-3 space-y-2'>
          <label htmlFor={`reply-comment-${comment.id}`} className='sr-only'>
            Reply to comment
          </label>
          <textarea
            id={`reply-comment-${comment.id}`}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder='Write a reply...'
            rows={2}
            maxLength={2000}
            required
            className='w-full resize-y rounded-lg border border-border bg-white p-2 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20'
          />
          <div className='flex gap-2'>
            <button
              type='submit'
              className='rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white'
            >
              Post reply
            </button>
            <button
              type='button'
              onClick={() => {
                setReplyText("")
                setIsReplying(false)
              }}
              className='rounded-lg border border-border px-3 py-1.5 text-xs text-ink'
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div
          className={`mt-3 space-y-3 border-l-2 border-border pl-3 ${
            depth < 4 ? "ml-3 sm:ml-5" : "ml-1"
          }`}
        >
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              comments={comments}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
