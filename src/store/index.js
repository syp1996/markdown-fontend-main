import { createStore } from 'vuex'

// 导入模块
import auth from './modules/auth'
import documents from './modules/documents'
import ui from './modules/ui'

// 创建store
const store = createStore({
  strict: process.env.NODE_ENV !== 'production',
  
  modules: {
    auth,
    documents,
    ui
  },
  
  // 根状态
  state: {
    appVersion: '1.0.0',
    appName: 'Markdown Editor',
    initialized: false
  },
  
  // 根mutations
  mutations: {
    SET_INITIALIZED(state, initialized) {
      state.initialized = initialized
    }
  },
  
  // 根actions
  actions: {
    // 应用初始化
    async initializeApp({ dispatch, commit }) {
      try {
        // 恢复认证状态
        await dispatch('auth/restoreAuth')
        
        // 加载UI设置
        await dispatch('ui/loadTheme')
        await dispatch('ui/loadEditorSettings')
        await dispatch('ui/loadLayoutSettings')
        
        // 如果用户已登录，加载文档
        if (store.getters['auth/isLoggedIn']) {
          await dispatch('documents/fetchDocuments')
        }
        
        commit('SET_INITIALIZED', true)
        
        console.log('应用初始化完成')
      } catch (error) {
        console.error('应用初始化失败:', error)
        throw error
      }
    },
    
    // 清理应用状态（用于退出登录）
    async cleanupApp({ dispatch, commit }) {
      await dispatch('documents/clearDocuments')
      await dispatch('ui/clearAllNotifications')
      commit('SET_INITIALIZED', false)
    }
  },
  
  // 根getters
  getters: {
    appVersion: state => state.appVersion,
    appName: state => state.appName,
    initialized: state => state.initialized,
    
    // 便捷的全局getters
    isLoggedIn: (state, getters) => getters['auth/isLoggedIn'],
    currentUser: (state, getters) => getters['auth/user'],
    currentDocument: (state, getters) => getters['documents/currentDocument'],
    theme: (state, getters) => getters['ui/theme']
  }
})

// 开发环境下启用状态日志
if (process.env.NODE_ENV === 'development') {
  // 监听所有mutations
  store.subscribe((mutation, state) => {
    console.log('[Vuex Mutation]', mutation.type, mutation.payload)
  })
  
  // 监听所有actions
  store.subscribeAction((action, state) => {
    console.log('[Vuex Action]', action.type, action.payload)
  })
}

export default store
