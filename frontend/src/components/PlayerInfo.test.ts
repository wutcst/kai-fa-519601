import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PlayerInfo from './PlayerInfo.vue'

const mocks = vi.hoisted(() => ({
  getInfo: vi.fn(),
}))

vi.mock('@/api', () => ({
  playerApi: {
    getInfo: mocks.getInfo,
  },
}))

function mountPlayerInfo() {
  return mount(PlayerInfo, {
    global: {
      stubs: {
        ElProgress: {
          props: ['percentage'],
          template: '<div class="progress-stub">{{ percentage }}</div>',
        },
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

  it('fetches and renders player info with avatar placeholder', async () => {
    mocks.getInfo.mockResolvedValue({
      data: {
        code: 200,
        data: {
          playerName: 'Alice',
          playerScore: 100,
          playerStamina: 80,
          playerAvatarUrl: '',
        },
      },
    })

    const wrapper = mountPlayerInfo()

    await flushPromises()

    expect(mocks.getInfo).toHaveBeenCalledWith(7)
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.find('.avatar-placeholder').text()).toBe('A')
    expect(wrapper.find('.progress-stub').text()).toBe('40')
  })

  it('renders avatar image and caps progress percentage at 100', async () => {
    mocks.getInfo.mockResolvedValue({
      data: {
        code: 200,
        data: {
          playerName: 'Bob',
          playerScore: 120,
          playerStamina: 260,
          playerAvatarUrl: 'avatar.png',
        },
      },
    })

    const wrapper = mountPlayerInfo()

    await flushPromises()

    expect(wrapper.find('img').attributes('src')).toBe('avatar.png')
    expect(wrapper.find('.progress-stub').text()).toBe('100')
  })
})
