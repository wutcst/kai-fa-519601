import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Archive from './Archive.vue'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  load: vi.fn(),
  newGame: vi.fn(),
  deleteSave: vi.fn(),
  push: vi.fn(),
}))

vi.mock('@/api', () => ({
  gameApi: {
    list: mocks.list,
    load: mocks.load,
    new: mocks.newGame,
    delete: mocks.deleteSave,
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

function mountArchive() {
  return mount(Archive, {
    global: {
      stubs: {
        transition: false,
      },
    },
  })
}

describe('Archive.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('fetches and renders save list on mount', async () => {
    mocks.list.mockResolvedValue({
      data: {
        code: 200,
        data: [
          {
            saveId: 1,
            playerScore: 100,
            playerStamina: 80,
            playerRoomId: 3,
            saveTime: '2025-06-01 12:00:00',
          },
        ],
      },
    })

    const wrapper = mountArchive()
    await flushPromises()

    expect(mocks.list).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Save #1')
    expect(wrapper.text()).toContain('Score 100')
  })

  it('calls gameApi.new() and navigates on "新的开始" click', async () => {
    mocks.list.mockResolvedValue({
      data: { code: 200, data: [] },
    })
    mocks.newGame.mockResolvedValue({
      data: { code: 200 },
    })

    const wrapper = mountArchive()
    await flushPromises()

    await wrapper.find('.empty-slot').trigger('click')
    await flushPromises()

    expect(mocks.newGame).toHaveBeenCalled()
    expect(mocks.push).toHaveBeenCalledWith('/game')
  })

  it('calls gameApi.read() and navigates on save click', async () => {
    mocks.list.mockResolvedValue({
      data: {
        code: 200,
        data: [
          {
            saveId: 1,
            playerScore: 100,
            playerStamina: 80,
            playerRoomId: 3,
            saveTime: '2025-06-01 12:00:00',
          },
        ],
      },
    })
    mocks.load.mockResolvedValue({
      data: {
        code: 200,
        data: {
          saveId: 1,
          playerId: 7,
          saveTime: '2025-06-01 12:00:00',
          playerScore: 100,
          playerStamina: 80,
          playerRoomId: 3,
          playerBackpackId: 1,
        },
      },
    })

    const wrapper = mountArchive()
    await flushPromises()

    await wrapper.find('.save-slot').trigger('click')
    await flushPromises()

    expect(mocks.load).toHaveBeenCalledWith({ saveId: 1 })
    expect(mocks.push).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/game' })
    )
  })

  it('calls gameApi.delete() on delete button click', async () => {
    // Mock confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    mocks.list.mockResolvedValue({
      data: {
        code: 200,
        data: [
          {
            saveId: 1,
            playerScore: 100,
            playerStamina: 80,
            playerRoomId: 3,
            saveTime: '2025-06-01 12:00:00',
          },
        ],
      },
    })
    mocks.deleteSave.mockResolvedValue({
      data: { code: 200 },
    })

    const wrapper = mountArchive()
    await flushPromises()

    await wrapper.find('.delete-btn').trigger('click')
    await flushPromises()

    expect(window.confirm).toHaveBeenCalledWith('确认删除此存档？')
    expect(mocks.deleteSave).toHaveBeenCalledWith({ saveId: 1 })
  })
})