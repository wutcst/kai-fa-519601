import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PlayerInfo from './PlayerInfo.vue'

const mocks = vi.hoisted(() => ({
  getInfo: vi.fn(),
  getPlayerList: vi.fn(),
  getBackpackList: vi.fn(),
  saveGame: vi.fn(),
  push: vi.fn(),
}))

vi.mock('@/api', () => ({
  playerApi: {
    getInfo: mocks.getInfo,
    getList: mocks.getPlayerList,
  },
  backpackApi: {
    getList: mocks.getBackpackList,
  },
  gameApi: {
    save: mocks.saveGame,
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

vi.mock('@/utils/eventBus', () => ({
  bus: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}))

function mountPlayerInfo() {
  return mount(PlayerInfo, {
    global: {
      provide: {
        fetchRoom: vi.fn(),
      },
      stubs: {
        teleport: true,
      },
    },
  })
}

describe('PlayerInfo.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('playerId', '7')
  })

  it('fetches and renders player info with avatar image', async () => {
    mocks.getInfo.mockResolvedValue({
      data: {
        code: 200,
        data: {
          playerId: 7,
          playerName: 'Alice',
          playerScore: 100,
          playerStamina: 80,
          playerMaxStamina: 200,
          playerAvatarUrl: '',
        },
      },
    })
    mocks.getPlayerList.mockResolvedValue({
      data: { code: 200, data: [] },
    })
    mocks.getBackpackList.mockResolvedValue({
      data: { code: 200, data: { backpackSize: 10, itemList: [] } },
    })

    const wrapper = mountPlayerInfo()
    await flushPromises()

    expect(mocks.getInfo).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('100')
  })

  it('renders avatar image when avatarUrl is provided', async () => {
    mocks.getInfo.mockResolvedValue({
      data: {
        code: 200,
        data: {
          playerId: 7,
          playerName: 'Bob',
          playerScore: 120,
          playerStamina: 260,
          playerMaxStamina: 200,
          playerAvatarUrl: 'avatar.png',
        },
      },
    })
    mocks.getPlayerList.mockResolvedValue({
      data: { code: 200, data: [] },
    })
    mocks.getBackpackList.mockResolvedValue({
      data: { code: 200, data: { backpackSize: 10, itemList: [] } },
    })

    const wrapper = mountPlayerInfo()
    await flushPromises()

    expect(wrapper.find('img').attributes('src')).toBe('avatar.png')
  })
})
