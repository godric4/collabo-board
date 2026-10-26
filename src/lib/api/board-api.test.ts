import { beforeEach, describe, expect, it } from 'vitest'
import { boardApi } from './board-api'

describe('boardApi', () => {
  beforeEach(() => {
    boardApi.reset()
  })

  it('acknowledges a saved mutation with a server version', async () => {
    const result = await boardApi.saveMutation({
      type: 'card.deleted',
      cardId: 'card-1',
      columnId: 'column-1',
    })

    expect(result.mutation.type).toBe('card.deleted')
    expect(result.serverVersion).toBe(1)
    expect(result.savedAt).toBeTruthy()
  })

  it('increments the server version for subsequent mutations', async () => {
    await boardApi.saveMutation({
      type: 'card.deleted',
      cardId: 'card-1',
      columnId: 'column-1',
    })

    const result = await boardApi.saveMutation({
      type: 'card.deleted',
      cardId: 'card-2',
      columnId: 'column-1',
    })

    expect(result.serverVersion).toBe(2)
  })
})
