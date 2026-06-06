import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/welcome/login' },
  {
    path: '/welcome',
    component: () => import('@/views/Welcome.vue'),
    children: [
      { path: '', redirect: 'login' },
      { path: 'login', name: 'Login', component: () => import('@/views/Login.vue') },
      {
        path: 'archive',
        name: 'Archive',
        component: () => import('@/views/Archive.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/Game.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const hasPlayerSession = Boolean(localStorage.getItem('playerId'))

  if (to.meta.requiresAuth && !hasPlayerSession) {
    return { path: '/welcome/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/welcome/login' && hasPlayerSession) {
    return { path: '/welcome/archive' }
  }

  return true
})

export default router
