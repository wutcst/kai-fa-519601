import { createRouter, createWebHashHistory } from 'vue-router'
import { getStoredPlayerId } from '@/utils/session'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/welcome/login' },
    {
      path: '/welcome',
      component: () => import('@/views/Welcome.vue'),
      children: [
        { path: '', redirect: '/welcome/login' },
        { path: 'login', name: 'Login', component: () => import('@/views/Login.vue') },
        { path: 'archive', name: 'Archive', component: () => import('@/views/Archive.vue') },
      ],
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import('@/views/Game.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const playerId = getStoredPlayerId()
  const needsAuth = to.path === '/welcome/archive' || to.path === '/game'

  if (needsAuth && !playerId) {
    return '/welcome/login'
  }

  if (to.path === '/welcome/login' && playerId) {
    return '/welcome/archive'
  }

  return true
})

export default router
