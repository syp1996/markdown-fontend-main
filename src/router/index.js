import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要登录的页面
    if (!token) {
      next('/')
    } else {
      next()
    }
  } else {
    // 不需要登录的页面
    if (token && to.path === '/') {
      // 已登录用户访问登录页，重定向到Dashboard
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
