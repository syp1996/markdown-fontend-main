import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import CodeEditor from '../views/pages/CodeEditor.vue'
import FileManager from '../views/pages/FileManager.vue'
import HomePage from '../views/pages/Home.vue'
import MarkdownEditor from '../views/pages/MarkdownEditor.vue'
import ProjectList from '../views/pages/ProjectList.vue'
import RichEditor from '../views/pages/RichEditor.vue'
import UserSettings from '../views/pages/UserSettings.vue'
import UniversalCompilerDemo from '../views/pages/UniversalCompilerDemo.vue'

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
        path: 'markdown-editor',
        name: 'MarkdownEditor',
        component: MarkdownEditor
      },
      {
        path: 'rich-editor',
        name: 'RichEditor',
        component: RichEditor
      },
      {
        path: 'code-editor',
        name: 'CodeEditor',
        component: CodeEditor
      },
      {
        path: 'project-list',
        name: 'ProjectList',
        component: ProjectList
      },
      {
        path: 'file-manager',
        name: 'FileManager',
        component: FileManager
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: UserSettings
      },
      {
        path: 'universal-compiler',
        name: 'UniversalCompilerDemo',
        component: UniversalCompilerDemo
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
