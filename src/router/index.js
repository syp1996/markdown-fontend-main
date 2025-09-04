import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import FileManager from '../views/pages/FileManager.vue'
import HomePage from '../views/pages/Home.vue'
import authManager from '@/utils/auth'

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
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: HomePage
      },
      {
        path: 'home',
        name: 'HomePage',
        component: HomePage
      },
      {
        path: 'file-manager',
        name: 'FileManager',
        component: FileManager
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = authManager.isAuthenticated()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要登录的页面
    if (!isAuthenticated) {
      next('/')
    } else {
      next()
    }
  } else {
    // 不需要登录的页面
    if (isAuthenticated && to.path === '/') {
      // 已登录用户访问登录页，重定向到Dashboard
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
