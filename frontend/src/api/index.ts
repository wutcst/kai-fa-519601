import axios from 'axios'

// 统一 axios 实例
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

function clearAuthState() {
  localStorage.removeItem('token')
  localStorage.removeItem('playerId')
}

function redirectToLogin() {
  if (window.location.hash !== '#/welcome/login') {
    window.location.hash = '#/welcome/login'
  }
}

// 请求拦截器：自动注入 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const payload = response.data
    const isExpired =
      payload?.code === 401 ||
      payload?.message === 'auth expired' ||
      payload?.message === 'AUTH_EXPIRED'

    if (isExpired) {
      clearAuthState()
      redirectToLogin()
      return Promise.reject(new Error('auth expired'))
    }

    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuthState()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

// ==================== 玩家模块 ====================

export const playerApi = {
  /** 登录 */
  login: (data: { username: string; password: string }) => api.post('/player/login', data),

  /** 注册（FormData 含头像文件） */
  register: (data: FormData) =>
    api.post('/player/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** 获取玩家详细信息 */
  getInfo: (playerId: number) => api.post('/player/info', { playerId }),

  /** 玩家移动 */
  move: (playerId: number, direction: string) => api.post('/player/move', { playerId, direction }),

  /** 获取在线玩家列表 */
  getList: () => api.get('/player/list'),

  /** 返回上一房间 */
  back: (playerId: number) => api.post('/player/back', { playerId }),

  /** 传送（随机房间） */
  trans: (playerId: number) => api.post('/player/trans', { playerId }),

  /** 回城（回到主城） */
  home: (playerId: number) => api.post('/player/home', { playerId }),
}

// ==================== 房间模块 ====================

export const roomApi = {
  /** 获取房间信息 */
  getInfo: (roomId: number) => api.post('/room/info', { roomId }),
}

// ==================== 背包模块 ====================

export const backpackApi = {
  /** 获取背包列表 */
  getList: (playerId: number) => api.post('/backpack/list', { playerId }),

  /** 拾取物品 */
  pickItem: (playerId: number, itemId: number) => api.post('/backpack/pick', { playerId, itemId }),

  /** 丢弃物品 */
  dropItem: (playerId: number, itemId: number) => api.post('/backpack/throw', { playerId, itemId }),

  /** 使用物品 */
  useItem: (playerId: number, itemId: number) => api.post('/backpack/use', { playerId, itemId }),
}

// ==================== 游戏存档模块 ====================

export const gameApi = {
  /** 获取存档列表 */
  getList: (playerId: number) => api.post('/game/list', { playerId }),

  /** 创建新存档 */
  save: (playerId: number) => api.post('/game/save', { playerId }),

  /** 读取存档 */
  read: (saveId: number) => api.post('/game/read', { saveId }),

  /** 删除存档 */
  delete: (saveId: number) => api.post('/game/delete', { saveId }),

  /** 新建游戏 */
  new: (playerId: number) => api.post('/game/new', { playerId }),
}

export default api
