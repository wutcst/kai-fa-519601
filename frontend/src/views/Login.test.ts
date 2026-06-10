import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from './Login.vue'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  push: vi.fn(),
}))

vi.mock('@/api', () => ({
  playerApi: {
    login: mocks.login,
    register: mocks.register,
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

function mountLogin() {
  return mount(Login, {
    global: {
      stubs: {
        transition: false,
      },
    },
  })
}

describe('Login.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.useFakeTimers()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders login form with correct input ids', async () => {
    const wrapper = mountLogin()
    // Click through start screen and welcome screen to reach login form
    await wrapper.find('.start-screen').trigger('click')
    await flushPromises()
    await wrapper.find('.start-btn').trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
  })

  it('calls login API and navigates on success', async () => {
    mocks.login.mockResolvedValue({
      data: {
        data: {
          playerId: 7,
          playerAvatarUrl: '',
        },
      },
    })

    const wrapper = mountLogin()
    await wrapper.find('.start-screen').trigger('click')
    await flushPromises()
    await wrapper.find('.start-btn').trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#password').setValue('testpass')
    await wrapper.find('.login-button').trigger('submit')

    await flushPromises()

    expect(mocks.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass',
    })
    expect(localStorage.getItem('playerId')).toBe('7')
    expect(mocks.push).toHaveBeenCalledWith('archive')
  })

  it('switches to register mode and renders register inputs', async () => {
    const wrapper = mountLogin()
    await wrapper.find('.start-screen').trigger('click')
    await flushPromises()
    await wrapper.find('.start-btn').trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    await wrapper.find('.register-button').trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    expect(wrapper.find('#r-username').exists()).toBe(true)
    expect(wrapper.find('#r-password').exists()).toBe(true)
    expect(wrapper.find('#confirm').exists()).toBe(true)
  })

  it('calls register API on form submit', async () => {
    mocks.register.mockResolvedValue({ data: {} })

    const wrapper = mountLogin()
    await wrapper.find('.start-screen').trigger('click')
    await flushPromises()
    await wrapper.find('.start-btn').trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    await wrapper.find('.register-button').trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    await wrapper.find('#r-username').setValue('newuser')
    await wrapper.find('#r-password').setValue('newpass')
    await wrapper.find('#confirm').setValue('newpass')
    await wrapper.find('.login-button').trigger('submit')

    await flushPromises()

    expect(mocks.register).toHaveBeenCalled()
    const formData = mocks.register.mock.calls[0][0]
    expect(formData.get('playerName')).toBe('newuser')
    expect(formData.get('password')).toBe('newpass')
  })
})
