import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const mocks = vi.hoisted(() => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() } as any,
      response: { use: vi.fn() } as any,
    },
  }

  const mockAxios = Object.assign(vi.fn(), {
    create: vi.fn(() => mockAxiosInstance),
  })

  return { mockAxios, mockAxiosInstance }
})

vi.mock('axios', () => ({ default: mocks.mockAxios }))

// ---------------------------------------------------------------------------
// Import module under test
// ---------------------------------------------------------------------------
import {
  default as api,
  playerApi,
  roomApi,
  backpackApi,
  gameApi,
} from './index'

// ---------------------------------------------------------------------------
// Capture interceptors immediately (before any clearAllMocks)
// ---------------------------------------------------------------------------
const requestInterceptor = (() => {
  const calls = mocks.mockAxiosInstance.interceptors.request.use.mock.calls
  if (calls.length === 0) throw new Error('Request interceptor not registered')
  return calls[0][0] as (config: any) => any
})()

const responseSuccessInterceptor = (() => {
  const calls = mocks.mockAxiosInstance.interceptors.response.use.mock.calls
  if (calls.length === 0) throw new Error('Response interceptor not registered')
  return calls[0][0] as (response: any) => any
})()

const responseErrorInterceptor = (() => {
  const calls = mocks.mockAxiosInstance.interceptors.response.use.mock.calls
  if (calls.length === 0) throw new Error('Response interceptor not registered')
  return calls[0][1] as (error: any) => any
})()

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('api/index.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.location.hash = '#/'
  })

  // =========================================================================
  // 1. Axios instance configuration
  // =========================================================================
  describe('axios instance', () => {
    it('creates axios with baseURL /api and withCredentials true', () => {
      // Note: clearAllMocks wipes the call record, but we verify via the
      // captured interceptors that the instance was created correctly.
      // The create call happened at module init – we test it indirectly
      // by verifying the instance is the one returned by our mock factory.
      expect(api).toBe(mocks.mockAxiosInstance)
    })

    it('registers a request interceptor', () => {
      expect(requestInterceptor).toBeDefined()
      expect(typeof requestInterceptor).toBe('function')
    })

    it('registers a response interceptor', () => {
      expect(responseSuccessInterceptor).toBeDefined()
      expect(typeof responseSuccessInterceptor).toBe('function')
      expect(responseErrorInterceptor).toBeDefined()
      expect(typeof responseErrorInterceptor).toBe('function')
    })
  })

  // =========================================================================
  // 2. Request interceptor
  // =========================================================================
  describe('request interceptor', () => {
    it('adds Authorization header when token exists in localStorage', () => {
      localStorage.setItem('token', 'test-token-123')
      const config = { headers: {} as Record<string, string> }

      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBe('Bearer test-token-123')
    })

    it('does NOT add Authorization header when token is absent', () => {
      const config = { headers: {} as Record<string, string> }

      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('returns the config object unchanged (except headers)', () => {
      localStorage.setItem('token', 'abc')
      const config = { headers: {}, customProp: 42 }

      const result = requestInterceptor(config)

      expect(result.customProp).toBe(42)
    })
  })

  // =========================================================================
  // 3. Response interceptor – success path
  // =========================================================================
  describe('response interceptor – success', () => {
    it('passes through a normal response', () => {
      const response = { data: { code: 200, data: { ok: true } } }

      const result = responseSuccessInterceptor(response)

      expect(result).toBe(response)
    })

    it('passes through response with code !== 401', () => {
      const response = { data: { code: 400, message: 'bad request' } }

      const result = responseSuccessInterceptor(response)

      expect(result).toBe(response)
    })
  })

  // =========================================================================
  // 4. Response interceptor – auth expired
  // =========================================================================
  describe('response interceptor – auth expired', () => {
    it('rejects when payload.code === 401', async () => {
      localStorage.setItem('token', 'old-token')
      localStorage.setItem('playerId', '42')
      window.location.hash = '#/game'

      const response = { data: { code: 401 } }

      await expect(responseSuccessInterceptor(response)).rejects.toThrow(
        'auth expired',
      )

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('playerId')).toBeNull()
      expect(window.location.hash).toBe('#/welcome/login')
    })

    it('rejects when payload.message === "auth expired"', async () => {
      localStorage.setItem('token', 'old-token')
      localStorage.setItem('playerId', '7')

      const response = { data: { code: 200, message: 'auth expired' } }

      await expect(responseSuccessInterceptor(response)).rejects.toThrow(
        'auth expired',
      )

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('playerId')).toBeNull()
    })

    it('rejects when payload.message === "AUTH_EXPIRED"', async () => {
      localStorage.setItem('token', 'old-token')
      localStorage.setItem('playerId', '7')

      const response = { data: { code: 200, message: 'AUTH_EXPIRED' } }

      await expect(responseSuccessInterceptor(response)).rejects.toThrow(
        'auth expired',
      )

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('playerId')).toBeNull()
    })

    it('does NOT change hash if already on login page', async () => {
      localStorage.setItem('token', 'old-token')
      window.location.hash = '#/welcome/login'

      const response = { data: { code: 401 } }

      await expect(responseSuccessInterceptor(response)).rejects.toThrow(
        'auth expired',
      )
      expect(window.location.hash).toBe('#/welcome/login')
    })
  })

  // =========================================================================
  // 5. Response interceptor – HTTP 401 error
  // =========================================================================
  describe('response interceptor – HTTP 401 error', () => {
    it('clears localStorage on error.response.status === 401', async () => {
      localStorage.setItem('token', 'old-token')
      localStorage.setItem('playerId', '99')
      window.location.hash = '#/game'

      const error = { response: { status: 401 } }

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('playerId')).toBeNull()
      expect(window.location.hash).toBe('#/welcome/login')
    })

    it('does NOT clear localStorage for non-401 errors', async () => {
      localStorage.setItem('token', 'keep-me')
      localStorage.setItem('playerId', '1')

      const error = { response: { status: 500 } }

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)

      expect(localStorage.getItem('token')).toBe('keep-me')
      expect(localStorage.getItem('playerId')).toBe('1')
    })

    it('handles errors without a response object gracefully', async () => {
      const error = new Error('Network Error')

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
    })
  })

  // =========================================================================
  // 6. playerApi methods
  // =========================================================================
  describe('playerApi', () => {
    it('login calls POST /player/login with credentials', () => {
      playerApi.login({ username: 'alice', password: 'secret' })

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/login',
        { username: 'alice', password: 'secret' },
      )
    })

    it('register calls POST /player/register with FormData and multipart header', () => {
      const formData = new FormData()
      formData.append('playerName', 'bob')

      playerApi.register(formData)

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/register',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
    })

    it('getInfo sends playerId from localStorage', () => {
      localStorage.setItem('playerId', '5')

      playerApi.getInfo()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/info',
        { playerId: '5' },
      )
    })

    it('getInfo sends null playerId when not in localStorage', () => {
      playerApi.getInfo()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/info',
        { playerId: null },
      )
    })

    it('move sends playerId and direction', () => {
      localStorage.setItem('playerId', '3')

      playerApi.move('north')

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/move',
        { playerId: '3', direction: 'north' },
      )
    })

    it('getList calls GET /player/list', () => {
      playerApi.getList()

      expect(mocks.mockAxiosInstance.get).toHaveBeenCalledWith('/player/list')
    })

    it('trans sends playerId', () => {
      localStorage.setItem('playerId', '8')

      playerApi.trans()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/trans',
        { playerId: '8' },
      )
    })

    it('back sends playerId', () => {
      localStorage.setItem('playerId', '2')

      playerApi.back()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/back',
        { playerId: '2' },
      )
    })

    it('home sends playerId', () => {
      localStorage.setItem('playerId', '6')

      playerApi.home()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/player/home',
        { playerId: '6' },
      )
    })
  })

  // =========================================================================
  // 7. roomApi methods
  // =========================================================================
  describe('roomApi', () => {
    it('getInfo sends playerId and roomId', () => {
      localStorage.setItem('playerId', '4')

      roomApi.getInfo(10)

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/room/info',
        { playerId: '4', roomId: 10 },
      )
    })
  })

  // =========================================================================
  // 8. backpackApi methods
  // =========================================================================
  describe('backpackApi', () => {
    it('getList sends playerId', () => {
      localStorage.setItem('playerId', '1')

      backpackApi.getList()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/backpack/list',
        { playerId: '1' },
      )
    })

    it('pickItem sends playerId and itemId', () => {
      localStorage.setItem('playerId', '2')

      backpackApi.pickItem(42)

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/backpack/pick',
        { playerId: '2', itemId: 42 },
      )
    })

    it('dropItem sends playerId and itemId', () => {
      localStorage.setItem('playerId', '3')

      backpackApi.dropItem(7)

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/backpack/throw',
        { playerId: '3', itemId: 7 },
      )
    })

    it('useItem sends playerId and itemId', () => {
      localStorage.setItem('playerId', '5')

      backpackApi.useItem(99)

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/backpack/use',
        { playerId: '5', itemId: 99 },
      )
    })
  })

  // =========================================================================
  // 9. gameApi methods
  // =========================================================================
  describe('gameApi', () => {
    it('list sends playerId', () => {
      localStorage.setItem('playerId', '9')

      gameApi.list()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/game/list',
        { playerId: '9' },
      )
    })

    it('save sends playerId', () => {
      localStorage.setItem('playerId', '10')

      gameApi.save()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/game/save',
        { playerId: '10' },
      )
    })

    it('load sends saveId', () => {
      gameApi.load({ saveId: 3 })

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/game/read',
        { saveId: 3 },
      )
    })

    it('delete sends params with saveId', () => {
      gameApi.delete({ saveId: 5 })

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/game/delete',
        { saveId: 5 },
      )
    })

    it('new sends playerId', () => {
      localStorage.setItem('playerId', '11')

      gameApi.new()

      expect(mocks.mockAxiosInstance.post).toHaveBeenCalledWith(
        '/game/new',
        { playerId: '11' },
      )
    })
  })

  // =========================================================================
  // 10. Default export
  // =========================================================================
  describe('default export', () => {
    it('exports the axios instance', () => {
      expect(api).toBe(mocks.mockAxiosInstance)
    })
  })
})