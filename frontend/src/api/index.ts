import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const playerApi = {
  login: (data: { username: string; password: string }) => api.post('/player/login', data),
  register: (data: FormData) => api.post('/player/register', data),
  getInfo: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/player/info', { player_id: Number(playerId) })
  },
  move: (direction: string) => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/player/move', { player_id: Number(playerId), direction })
  },
  getList: () => api.get('/player/list'),
  trans: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/player/trans', { player_id: Number(playerId) })
  },
  back: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/player/back', { player_id: Number(playerId) })
  },
  home: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/player/home', { player_id: Number(playerId) })
  },
}

export const roomApi = {
  getInfo: (roomId: number) => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/room/info', { player_id: Number(playerId), room_id: roomId })
  },
}

export const backpackApi = {
  getList: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/backpack/list', { player_id: Number(playerId) })
  },
  pickItem: (itemId: number) => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/backpack/pick', { player_id: Number(playerId), item_id: itemId })
  },
  dropItem: (itemId: number) => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/backpack/throw', { player_id: Number(playerId), item_id: itemId })
  },
  useItem: (itemId: number) => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/backpack/use', { player_id: Number(playerId), item_id: itemId })
  },
}

export const gameApi = {
  getList: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/game/list', { player_id: Number(playerId) })
  },
  save: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/game/save', { player_id: Number(playerId) })
  },
  read: (saveId: number) => api.post('/game/read', { save_id: saveId }),
  delete: (saveId: number) => api.post('/game/delete', { save_id: saveId }),
  new: () => {
    const playerId = localStorage.getItem('playerId')
    return api.post('/game/new', { player_id: Number(playerId) })
  },
}

export default api