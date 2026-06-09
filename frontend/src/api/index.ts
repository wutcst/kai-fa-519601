import axios from 'axios'

const api = axios.create({
    baseURL: 'https://127.0.0.1:8080/api',
    withCredentials: true
})

// 全局请求拦截器：自动添加 Token（如果有的话）
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器：处理 401
api.interceptors.response.use(
    response => {
        const payload = response.data
        const isExpired =
            payload?.code === 401 ||
            payload?.message === 'auth expired' ||
            payload?.message === 'AUTH_EXPIRED'

        if (isExpired) {
            localStorage.removeItem('token')
            localStorage.removeItem('playerId')
            if (window.location.hash !== '#/welcome/login') {
                window.location.hash = '#/welcome/login'
            }
            return Promise.reject(new Error('auth expired'))
        }

        return response
    },
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('playerId')
            if (window.location.hash !== '#/welcome/login') {
                window.location.hash = '#/welcome/login'
            }
        }
        return Promise.reject(error)
    }
)

// 玩家相关接口
export const playerApi = {
    // 登录
    login: (data: { username: string; password: string }) => api.post('/player/login', data),
    // 注册
    register: (data: FormData) =>
        api.post('/player/register', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    // 获取玩家信息
    getInfo: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/player/info', { playerId })
    },
    // 移动
    move: (direction: string) => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/player/move', { playerId, direction })
    },
    // 获取玩家列表
    getList: () => api.get('/player/list'),
    // 传送
    trans: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/player/trans', { playerId })
    },
    // 返回上一个房间
    back: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/player/back', { playerId })
    },
    // 回到初始房间
    home: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/player/home', { playerId })
    }
}

// 房间相关接口
export const roomApi = {
    // 获取房间信息
    getInfo: (roomId: number) => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/room/info', { playerId, roomId })
    }
}

// 背包相关接口
export const backpackApi = {
    // 获取背包列表
    getList: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/backpack/list', { playerId })
    },
    // 拾取物品
    pickItem: (itemId: number) => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/backpack/pick', { playerId, itemId })
    },
    // 丢弃物品
    dropItem: (itemId: number) => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/backpack/throw', { playerId, itemId })
    },
    // 使用物品
    useItem: (itemId: number) => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/backpack/use', { playerId, itemId })
    }
}

export const gameApi = {
    /**
     * 拉取当前玩家的存档列表
     */
    list: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/game/list', { playerId })
    },

    /**
     * 保存当前玩家的存档
     */
    save: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/game/save', { playerId })
    },

    /**
     * 读取指定存档
     */
    load: (params: { saveId: number }) => {
        return api.post('/game/read', params)
    },

    /**
     * 删除指定存档
     */
    delete: (params: { saveId: number }) => {
        return api.post('/game/delete', params)
    },

    /**
     * 新建游戏
     */
    new: () => {
        const playerId = localStorage.getItem('playerId')
        return api.post('/game/new', { playerId })
    }
}

export default api