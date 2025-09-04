/**
 * 认证模块 - 管理用户认证状态
 */
import authManager from '@/utils/auth'

const state = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.isLoggedIn = !!user
  },
  
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  async login({ commit }, credentials) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // 这里应该调用登录API
      // const response = await loginAPI(credentials)
      
      // 模拟登录响应
      const user = { username: credentials.username, id: 1 }
      const token = 'mock-token-' + Date.now()
      
      // 使用安全的认证管理器存储
      authManager.setToken(token)
      authManager.setUserInfo(user)
      
      commit('SET_USER', user)
      
      return { success: true, user }
    } catch (error) {
      commit('SET_ERROR', error.message || '登录失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async logout({ commit }) {
    try {
      commit('SET_LOADING', true)
      
      // 清理认证信息
      authManager.clearAll()
      commit('SET_USER', null)
      
      return { success: true }
    } catch (error) {
      commit('SET_ERROR', error.message || '退出失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 从存储中恢复用户状态
  restoreAuth({ commit }) {
    try {
      if (authManager.isAuthenticated()) {
        const user = authManager.getUserInfo()
        if (user) {
          commit('SET_USER', user)
        }
      }
    } catch (error) {
      console.error('恢复认证状态失败:', error)
      authManager.clearAll()
    }
  },
  
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}

const getters = {
  user: state => state.user,
  isLoggedIn: state => state.isLoggedIn,
  isLoading: state => state.isLoading,
  error: state => state.error,
  username: state => state.user?.username || state.user?.name || '',
  userId: state => state.user?.id || null
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}