import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/auth', component: () => import('@/views/Auth.vue') },
  { path: '/', component: () => import('@/views/Main.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {next('/auth')}
  else next()
})

export default router
