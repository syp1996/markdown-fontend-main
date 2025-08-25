import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import DocumentEditor from '../views/pages/DocumentEditor.vue'
import FileManager from '../views/pages/FileManager.vue'
import HomePage from '../views/pages/Home.vue'
import LexicalDemo from '../views/pages/LexicalDemo.vue'
import ProjectManagement from '../views/pages/ProjectManagement.vue'
import SystemSettings from '../views/pages/SystemSettings.vue'

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
      },
      {
        path: 'project-management',
        name: 'ProjectManagement',
        component: ProjectManagement
      },
      {
        path: 'document-editor',
        name: 'DocumentEditor',
        component: DocumentEditor
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: SystemSettings
      },
      {
        path: 'lexical-demo',
        name: 'LexicalDemo',
        component: LexicalDemo
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
