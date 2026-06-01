import axios from 'axios'

// 带 /api 前缀的 axios 实例
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// 不带 /api 前缀的 axios 实例（用于 /player/back、/room/info、/backpack/* 等接口）
const rawApi = axios.create({
  baseURL: '',
  withCredentials: true,
})

// 请求拦截器：自动注入 token
const requestInterceptor = (config: any) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(requestInterceptor)
rawApi.interceptors.request.use(requestInterceptor)

// ==================== 玩家模块 ====================

export const playerApi = {
  /** 登录 */
  login: (data: { username: string; password: string }) =>
    api.post('/player/login', data),

  /** 注册（FormData 含头像文件） */
  register: (data: FormData) =>
    api.post('/player/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** 获取玩家详细信息 */
  getInfo: (playerId: number) =>
    api.post('/player/info', { playerId }),

  /** 玩家移动 */
  move: (playerId: number, direction: string) =>
    api.post('/player/move', { playerId, direction }),

  /** 获取在线玩家列表 */
  getList: () => api.get('/player/list'),

  /** 返回上一房间（无 /api 前缀） */
  back: (playerId: number) =>
    rawApi.post('/player/back', { playerId }),

  /** 传送（无 /api 前缀，进入传送房间自动触发） */
  trans: (playerId: number) =>
    rawApi.post('/player/trans', { playerId }),

  /** 回城（无 /api 前缀） */
  home: (playerId: number) =>
    rawApi.post('/player/home', { playerId }),
}

// ==================== 房间模块 ====================

export const roomApi = {
  /** 获取房间信息（无 /api 前缀） */
  getInfo: (roomId: number) =>
    rawApi.post('/room/info', { roomId }),
}

// ==================== 背包模块 ====================

export const backpackApi = {
  /** 获取背包列表（无 /api 前缀） */
  getList: (playerId: number) =>
    rawApi.post('/backpack/list', { playerId }),

  /** 拾取物品（无 /api 前缀） */
  pickItem: (playerId: number, itemId: number) =>
    rawApi.post('/backpack/pickup', { playerId, itemId }),

  /** 丢弃物品（无 /api 前缀） */
  dropItem: (playerId: number, itemId: number) =>
    rawApi.post('/backpack/throw', { playerId, itemId }),

  /** 使用物品（无 /api 前缀） */
  useItem: (playerId: number, itemId: number) =>
    rawApi.post('/backpack/use', { playerId, itemId }),
}

// ==================== 游戏存档模块 ====================

export const gameApi = {
  /** 获取存档列表 */
  getList: () => api.get('/game/list'),

  /** 创建新存档 */
  save: (playerId: number) =>
    api.post('/game/save', { playerId }),

  /** 读取存档 */
  read: (saveId: number) =>
    api.post('/game/read', { saveId }),

  /** 删除存档 */
  delete: (saveId: number) =>
    api.post('/game/delete', { saveId }),

  /** 新建游戏 */
  new: (playerId: number) =>
    api.post('/game/new', { playerId }),
}

export default api