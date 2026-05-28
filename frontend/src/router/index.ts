import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/welcome/login' },
  {
    path: '/welcome',
    component: () => import('@/views/Welcome.vue'),
    children: [
      { path: '', redirect: 'login' },
      { path: 'login', name: 'Login', component: () => import('@/views/Login.vue') },
      { path: 'archive', name: 'Archive', component: () => import('@/views/Archive.vue') },
    ],
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/Game.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})