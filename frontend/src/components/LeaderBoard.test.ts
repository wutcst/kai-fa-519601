import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LeaderBoard from './LeaderBoard.vue'

const mocks = vi.hoisted(() => ({
  getList: vi.fn(),
}))

vi.mock('@/api', () => ({
  playerApi: {
    getList: mocks.getList,
  },
}))

describe('LeaderBoard.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sorts players by score in descending order', async () => {
    mocks.getList.mockResolvedValue({
      data: {
        code: 200,
        data: [
          { playerId: 1, playerName: 'Bravo', playerScore: 20 },
          { playerId: 2, playerName: 'Alpha', playerScore: 40 },
          { playerId: 3, playerName: 'Charlie', playerScore: 30 },
        ],
      },
    })

    const wrapper = mount(LeaderBoard)

    await flushPromises()

    expect(wrapper.findAll('.name').map((node) => node.text())).toEqual([
      'Alpha',
      'Charlie',
      'Bravo',
    ])
    expect(wrapper.findAll('.score').map((node) => node.text())).toEqual(['40', '30', '20'])

    wrapper.unmount()
  })

  it('polls every 5 seconds and refreshes the leaderboard', async () => {
    mocks.getList
      .mockResolvedValueOnce({
        data: {
          code: 200,
          data: [
            { playerId: 1, playerName: 'Bravo', playerScore: 20 },
            { playerId: 2, playerName: 'Alpha', playerScore: 40 },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          code: 200,
          data: [
            { playerId: 3, playerName: 'Delta', playerScore: 60 },
            { playerId: 2, playerName: 'Alpha', playerScore: 40 },
          ],
        },
      })

    const wrapper = mount(LeaderBoard)

    await flushPromises()
    await vi.advanceTimersByTimeAsync(5000)
    await flushPromises()

    expect(mocks.getList).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('.name').map((node) => node.text())).toEqual(['Delta', 'Alpha'])

    wrapper.unmount()
  })
})
