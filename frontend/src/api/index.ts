import axios, { type AxiosResponse } from 'axios'

// 统一 axios 实例（后端所有接口均无 /api 前缀）
const api = axios.create({
  baseURL: '',
  withCredentials: true,
})

export interface ApiResult<T> {
  code: number
  message: string
  data: T | null
}

export interface PlayerProfile {
  player_id: number
  player_name: string
  player_avatar_url?: string | null
  player_backpack_id?: number | null
  player_score: number
  player_room_id?: number | null
  player_stamina: number
}

export interface LoginPayload {
  player_id: number
}

export function isSuccess<T>(response: AxiosResponse<ApiResult<T>>) {
  return response.data.code === 200
}

export function getMessage<T>(response: AxiosResponse<ApiResult<T>>, fallback = 'Request failed') {
  return response.data.message || fallback
}

export function getPayload<T>(response: AxiosResponse<ApiResult<T>>) {
  const payload = response.data.data
  if (payload === null) {
    throw new Error('Missing response payload')
  }
  return payload
}

export const playerApi = {
  login: (data: { username: string; password: string }) =>
    api.post<ApiResult<LoginPayload>>('/player/login', data),
  register: (data: FormData) => api.post<ApiResult<LoginPayload>>('/player/register', data),
  getInfo: (playerId: number) =>
    api.post<ApiResult<PlayerProfile>>('/player/info', { player_id: playerId }),
  getList: () => api.get<ApiResult<PlayerProfile[]>>('/player/list'),
}

export default api
