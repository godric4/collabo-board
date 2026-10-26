import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import BoardPage from './page'
import { useBoardStore } from '@/stores/board-store'

vi.mock('next/navigation', () => ({
  useParams: () => ({ boardId: 'test-board' }),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/components/ui/alert-provider', () => ({
  useAlerts: () => ({
    confirm: vi.fn().mockResolvedValue(false),
    notify: vi.fn(),
  }),
}))

describe('Board page integration', () => {
  beforeEach(() => {
    useBoardStore.setState({
      boards: {
        'test-board': {
          id: 'test-board',
          title: 'Test board',
          description: '',
          createdAt: '2026-01-01T00:00:00.000Z',
          columnIds: ['todo-column'],
        },
      },
      columns: {
        'todo-column': {
          id: 'todo-column',
          boardId: 'test-board',
          title: 'To do',
          cardIds: [],
        },
      },
      cards: {},
      comments: {},
      history: {
        past: [],
        future: [],
      },
    })
  })

  it('creates a card through the board UI', () => {
    render(<BoardPage />)

    fireEvent.click(screen.getByRole('button', { name: /add card/i }))

    fireEvent.change(screen.getByRole('textbox', { name: /card title/i }), {
      target: { value: 'Write integration test' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create card/i }))

    expect(screen.getByText('Write integration test')).toBeTruthy()

    const state = useBoardStore.getState()
    const column = state.columns['todo-column']
    const cardId = column.cardIds[0]

    expect(column.cardIds).toHaveLength(1)
    expect(state.cards[cardId].title).toBe('Write integration test')
    expect(state.cards[cardId].columnId).toBe('todo-column')
  })
})
