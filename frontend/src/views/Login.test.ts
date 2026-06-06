import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Login from './Login.vue'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
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

vi.mock('element-plus', () => ({
  ElMessage: mocks.message,
}))

vi.mock('@/api', () => ({
  playerApi: {
    login: mocks.login,
    register: mocks.register,
  },
}))

async function openAuthPanel() {
  const wrapper = mount(Login)

  await wrapper.get('.start-screen').trigger('click')
  await wrapper.get('.start-btn').trigger('click')
  await vi.advanceTimersByTimeAsync(900)
  await flushPromises()

  return wrapper
}

describe('Login.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the login form after entering the auth flow', async () => {
    const wrapper = await openAuthPanel()

    expect(wrapper.find('#login-username').exists()).toBe(true)
    expect(wrapper.find('#login-password').exists()).toBe(true)
    expect(wrapper.find('.submit-button').exists()).toBe(true)
    expect(wrapper.find('.switch-button').exists()).toBe(true)
  })

  it('submits login data and navigates to archive on success', async () => {
    mocks.login.mockResolvedValue({
      data: {
        code: 200,
        data: {
          playerId: 7,
          token: 'token-7',
        },
      },
    })

    const wrapper = await openAuthPanel()

    await wrapper.get('#login-username').setValue('alice')
    await wrapper.get('#login-password').setValue('secret')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(mocks.login).toHaveBeenCalledWith({
      username: 'alice',
      password: 'secret',
    })
    expect(localStorage.getItem('playerId')).toBe('7')
    expect(localStorage.getItem('token')).toBe('token-7')
    expect(localStorage.getItem('roomId')).toBe('1')
    expect(mocks.push).toHaveBeenCalledWith('/welcome/archive')
    expect(mocks.message.success).toHaveBeenCalled()
  })

  it('switches to register mode and submits form data', async () => {
    mocks.register.mockResolvedValue({
      data: {
        code: 200,
      },
    })

    const wrapper = await openAuthPanel()

    await wrapper.get('.switch-button').trigger('click')
    await nextTick()

    expect(wrapper.find('#reg-username').exists()).toBe(true)
    expect(wrapper.find('#reg-password').exists()).toBe(true)
    expect(wrapper.find('#reg-confirm').exists()).toBe(true)

    await wrapper.get('#reg-username').setValue('alice')
    await wrapper.get('#reg-password').setValue('secret')
    await wrapper.get('#reg-confirm').setValue('secret')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(mocks.register).toHaveBeenCalledTimes(1)

    const payload = mocks.register.mock.calls[0][0] as FormData

    expect(payload.get('playerName')).toBe('alice')
    expect(payload.get('password')).toBe('secret')
    expect(mocks.message.success).toHaveBeenCalled()
    expect(wrapper.find('#login-username').exists()).toBe(true)
  })
})
