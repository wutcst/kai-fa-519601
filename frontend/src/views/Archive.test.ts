import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ElementPlus from 'element-plus'
import Archive from './Archive.vue'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  getList: vi.fn(),
  newGame: vi.fn(),
  read: vi.fn(),
  deleteSave: vi.fn(),
  confirm: vi.fn(),
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

vi.mock('@/api', () => ({
  gameApi: {
    getList: mocks.getList,
    new: mocks.newGame,
    read: mocks.read,
    delete: mocks.deleteSave,
  },
}))

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus')

  return {
    ...actual,
    ElMessage: mocks.message,
    ElMessageBox: {
      confirm: mocks.confirm,
    },
  }
})

function createSaves() {
  return [
    {
      saveId: 1,
      playerId: 7,
      saveTime: '2024-01-20T15:30:45',
      playerScore: 100,
      playerStamina: 80,
      playerRoomId: 2,
    },
    {
      saveId: 2,
      playerId: 7,
      saveTime: '2024-01-21T09:10:11',
      playerScore: 120,
      playerStamina: 60,
      playerRoomId: 3,
    },
  ]
}

async function mountArchive() {
  const wrapper = mount(Archive, {
    global: {
      plugins: [ElementPlus],
    },
  })

  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await flushPromises()

  return wrapper
}

function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find((button) => button.text().includes(text))
}

describe('Archive.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('playerId', '7')

    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )

    mocks.confirm.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders fetched save records on mount', async () => {
    mocks.getList.mockResolvedValue({
      data: {
        code: 200,
        data: createSaves(),
      },
    })

    const wrapper = await mountArchive()

    expect(mocks.getList).toHaveBeenCalledWith(7)
    expect(wrapper.text()).toContain('2024-01-20 15:30')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('80')
    expect(wrapper.text()).toContain('120')
  })

  it('starts a new game and navigates to game page', async () => {
    mocks.getList.mockResolvedValue({
      data: {
        code: 200,
        data: createSaves(),
      },
    })
    mocks.newGame.mockResolvedValue({
      data: {
        code: 200,
      },
    })

    const wrapper = await mountArchive()

    await wrapper.get('.new-btn').trigger('click')
    await flushPromises()

    expect(mocks.newGame).toHaveBeenCalledWith(7)
    expect(mocks.push).toHaveBeenCalledWith('/game')
  })

  it('reads a save and pushes encoded save data into the route', async () => {
    const saves = createSaves()
    const savePayload = {
      playerId: 7,
      playerName: 'alice',
      playerScore: 100,
      playerStamina: 80,
      playerRoomId: 2,
      playerBackpackId: 3,
      saveTime: '2024-01-20T15:30:45',
    }

    mocks.getList.mockResolvedValue({
      data: {
        code: 200,
        data: saves,
      },
    })
    mocks.read.mockResolvedValue({
      data: {
        code: 200,
        data: savePayload,
      },
    })

    const wrapper = await mountArchive()
    const readButton = findButtonByText(wrapper, '读取')

    expect(readButton).toBeDefined()

    await readButton!.trigger('click')
    await flushPromises()

    expect(mocks.read).toHaveBeenCalledWith(1)
    expect(mocks.push).toHaveBeenCalledWith({
      path: '/game',
      query: {
        save: encodeURIComponent(JSON.stringify(savePayload)),
      },
    })
  })

  it('deletes a save and refreshes the save list', async () => {
    const initialSaves = createSaves()
    const refreshedSaves = [initialSaves[1]]

    mocks.getList
      .mockResolvedValueOnce({
        data: {
          code: 200,
          data: initialSaves,
        },
      })
      .mockResolvedValueOnce({
        data: {
          code: 200,
          data: refreshedSaves,
        },
      })
    mocks.deleteSave.mockResolvedValue({
      data: {
        code: 200,
      },
    })

    const wrapper = await mountArchive()
    const deleteButton = findButtonByText(wrapper, '删除')

    expect(deleteButton).toBeDefined()

    await deleteButton!.trigger('click')
    await flushPromises()

    expect(mocks.confirm).toHaveBeenCalled()
    expect(mocks.deleteSave).toHaveBeenCalledWith(1)
    expect(mocks.getList).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('2024-01-20 15:30')
    expect(mocks.message.success).toHaveBeenCalled()
  })
})
