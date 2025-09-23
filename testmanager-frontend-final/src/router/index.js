import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Auth/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Users from '@/views/Users.vue'
import Clients from '@/views/Clients.vue'
import Projects from '@/views/Projects.vue'
import Tests from '@/views/Tests.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/users', name: 'Users', component: Users, meta: { requiresAuth: true } },
    { path: '/clients', name: 'Clients', component: Clients, meta: { requiresAuth: true } },
    { path: '/projects', name: 'Projects', component: Projects, meta: { requiresAuth: true } },
    { path: '/tests', name: 'Tests', component: Tests, meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

let hydrated = false
router.beforeEach(async (to, from, next) => {
  const store = useAuthStore()
  if (!hydrated) { await store.initAuth(); hydrated = true }
  const authed = !!(store.isAuthenticated && store.isAuthenticated.value)

  if (to.meta.requiresAuth && !authed) return next({ name: 'Login', replace: true })
  if (to.meta.guestOnly && authed)     return next({ name: 'Dashboard', replace: true })
  next()
})

export default router
