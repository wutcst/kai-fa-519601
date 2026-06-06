import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const instance = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  }

  return {
    create: vi.fn(() => instance),
    instance,
  }
})

vi.mock('axios', () => ({
  default: {
    create: mocks.create,
  },
}))

import api, { backpackApi, gameApi, playerApi, roomApi } from './index'

describe('api layer', () => {
  beforeEach(() => {
    mocks.instance.post.mockClear()
    mocks.instance.get.mockClear()
    localStorage.clear()
    window.location.hash = ''
  })

  it('creates axios instance with shared defaults', () => {
    expect(mocks.create).toHaveBeenCalledWith({
      baseURL: '/api',
      withCredentials: true,
    })
    expect(api).toBe(mocks.instance)
  })

  it('injects bearer token into request headers', () => {
    const onRequest = mocks.instance.interceptors.request.use.mock.calls[0][0]

    localStorage.setItem('token', 'test-token')

    const config = onRequest({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('clears auth state and redirects when response payload marks auth expired', async () => {
    const onResponse = mocks.instance.interceptors.response.use.mock.calls[0][0]

    localStorage.setItem('token', 'test-token')
    localStorage.setItem('playerId', '7')
    window.location.hash = '#/game'

    await expect(
      onResponse({
        data: {
          code: 401,
          message: 'auth expired',
        },
      }),
    ).rejects.toThrow('auth expired')

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('playerId')).toBeNull()
    expect(window.location.hash).toBe('#/welcome/login')
  })

  it('clears auth state and redirects when http 401 is returned', async () => {
    const onRejected = mocks.instance.interceptors.response.use.mock.calls[0][1]
    const error = {
      response: {
        status: 401,
      },
    }

    localStorage.setItem('token', 'test-token')
    localStorage.setItem('playerId', '7')
    window.location.hash = '#/game'

    await expect(onRejected(error)).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('playerId')).toBeNull()
    expect(window.location.hash).toBe('#/welcome/login')
  })

  describe('playerApi', () => {
    it('calls login with username and password payload', () => {
      playerApi.login({ username: 'alice', password: 'secret' })

      expect(mocks.instance.post).toHaveBeenCalledWith('/player/login', {
        username: 'alice',
        password: 'secret',
      })
    })

    it('calls register with form data and multipart headers', () => {
      const data = new FormData()
      data.append('playerName', 'alice')
      data.append('password', 'secret')

      playerApi.register(data)

      expect(mocks.instance.post).toHaveBeenCalledWith('/player/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    })

    it('calls getInfo with playerId payload', () => {
      playerApi.getInfo(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/player/info', {
        playerId: 12,
      })
    })

    it('calls move with playerId and direction payload', () => {
      playerApi.move(12, 'left')

      expect(mocks.instance.post).toHaveBeenCalledWith('/player/move', {
        playerId: 12,
        direction: 'left',
      })
    })

    it('calls getList with player list endpoint', () => {
      playerApi.getList()

      expect(mocks.instance.get).toHaveBeenCalledWith('/player/list')
    })

    it('calls back with playerId payload', () => {
      playerApi.back(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/player/back', {
        playerId: 12,
      })
    })

    it('calls trans with playerId payload', () => {
      playerApi.trans(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/player/trans', {
        playerId: 12,
      })
    })

    it('calls home with playerId payload', () => {
      playerApi.home(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/player/home', {
        playerId: 12,
      })
    })
  })

  describe('roomApi', () => {
    it('calls getInfo with roomId payload', () => {
      roomApi.getInfo(3)

      expect(mocks.instance.post).toHaveBeenCalledWith('/room/info', {
        roomId: 3,
      })
    })
  })

  describe('backpackApi', () => {
    it('calls getList with playerId payload', () => {
      backpackApi.getList(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/backpack/list', {
        playerId: 12,
      })
    })

    it('calls pickItem with playerId and itemId payload', () => {
      backpackApi.pickItem(12, 101)

      expect(mocks.instance.post).toHaveBeenCalledWith('/backpack/pick', {
        playerId: 12,
        itemId: 101,
      })
    })

    it('calls dropItem with playerId and itemId payload', () => {
      backpackApi.dropItem(12, 101)

      expect(mocks.instance.post).toHaveBeenCalledWith('/backpack/throw', {
        playerId: 12,
        itemId: 101,
      })
    })

    it('calls useItem with playerId and itemId payload', () => {
      backpackApi.useItem(12, 101)

      expect(mocks.instance.post).toHaveBeenCalledWith('/backpack/use', {
        playerId: 12,
        itemId: 101,
      })
    })
  })

  describe('gameApi', () => {
    it('calls getList with playerId payload', () => {
      gameApi.getList(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/game/list', {
        playerId: 12,
      })
    })

    it('calls save with playerId payload', () => {
      gameApi.save(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/game/save', {
        playerId: 12,
      })
    })

    it('calls read with saveId payload', () => {
      gameApi.read(8)

      expect(mocks.instance.post).toHaveBeenCalledWith('/game/read', {
        saveId: 8,
      })
    })

    it('calls delete with saveId payload', () => {
      gameApi.delete(8)

      expect(mocks.instance.post).toHaveBeenCalledWith('/game/delete', {
        saveId: 8,
      })
    })

    it('calls new with playerId payload', () => {
      gameApi.new(12)

      expect(mocks.instance.post).toHaveBeenCalledWith('/game/new', {
        playerId: 12,
      })
    })
  })
})
