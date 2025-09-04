/**
 * UI模块 - 管理界面状态
 */

const state = {
  // 侧边栏状态
  sidebarCollapsed: false,
  sidebarWidth: 280,
  
  // 弹窗状态
  showSearchModal: false,
  showSettingsModal: false,
  showCreateDocumentModal: false,
  
  // 主题设置
  theme: 'light', // 'light', 'dark', 'auto'
  
  // 编辑器设置
  editorSettings: {
    fontSize: 14,
    lineHeight: 1.6,
    showLineNumbers: false,
    wordWrap: true,
    focusMode: false,
    preset: 'standard' // 'basic', 'standard', 'full', 'document', 'note'
  },
  
  // 布局设置
  layout: {
    showToolbar: true,
    showStatusBar: true,
    showTitle: true,
    compactMode: false
  },
  
  // 通知系统
  notifications: [],
  
  // 加载状态
  globalLoading: false,
  loadingMessage: '',
  
  // 错误状态
  globalError: null,
  
  // 导航历史
  navigationHistory: [],
  currentRouteIndex: -1
}

const mutations = {
  // 侧边栏
  TOGGLE_SIDEBAR(state) {
    state.sidebarCollapsed = !state.sidebarCollapsed
  },
  
  SET_SIDEBAR_COLLAPSED(state, collapsed) {
    state.sidebarCollapsed = collapsed
  },
  
  SET_SIDEBAR_WIDTH(state, width) {
    state.sidebarWidth = Math.max(200, Math.min(400, width))
  },
  
  // 弹窗
  SET_SEARCH_MODAL(state, show) {
    state.showSearchModal = show
  },
  
  SET_SETTINGS_MODAL(state, show) {
    state.showSettingsModal = show
  },
  
  SET_CREATE_DOCUMENT_MODAL(state, show) {
    state.showCreateDocumentModal = show
  },
  
  // 主题
  SET_THEME(state, theme) {
    state.theme = theme
  },
  
  // 编辑器设置
  SET_EDITOR_SETTINGS(state, settings) {
    state.editorSettings = { ...state.editorSettings, ...settings }
  },
  
  SET_EDITOR_FONT_SIZE(state, fontSize) {
    state.editorSettings.fontSize = fontSize
  },
  
  SET_EDITOR_LINE_HEIGHT(state, lineHeight) {
    state.editorSettings.lineHeight = lineHeight
  },
  
  SET_EDITOR_FOCUS_MODE(state, focusMode) {
    state.editorSettings.focusMode = focusMode
  },
  
  SET_EDITOR_PRESET(state, preset) {
    state.editorSettings.preset = preset
  },
  
  // 布局设置
  SET_LAYOUT_SETTINGS(state, settings) {
    state.layout = { ...state.layout, ...settings }
  },
  
  SET_COMPACT_MODE(state, compact) {
    state.layout.compactMode = compact
  },
  
  // 通知
  ADD_NOTIFICATION(state, notification) {
    const id = Date.now() + Math.random()
    state.notifications.push({
      id,
      ...notification,
      timestamp: new Date().toISOString()
    })
  },
  
  REMOVE_NOTIFICATION(state, id) {
    state.notifications = state.notifications.filter(n => n.id !== id)
  },
  
  CLEAR_NOTIFICATIONS(state) {
    state.notifications = []
  },
  
  // 加载状态
  SET_GLOBAL_LOADING(state, { loading, message = '' }) {
    state.globalLoading = loading
    state.loadingMessage = message
  },
  
  // 错误状态
  SET_GLOBAL_ERROR(state, error) {
    state.globalError = error
  },
  
  CLEAR_GLOBAL_ERROR(state) {
    state.globalError = null
  },
  
  // 导航历史
  ADD_NAVIGATION(state, route) {
    // 移除当前位置之后的历史记录
    if (state.currentRouteIndex < state.navigationHistory.length - 1) {
      state.navigationHistory = state.navigationHistory.slice(0, state.currentRouteIndex + 1)
    }
    
    // 添加新路由
    state.navigationHistory.push(route)
    state.currentRouteIndex = state.navigationHistory.length - 1
    
    // 限制历史记录数量
    if (state.navigationHistory.length > 50) {
      state.navigationHistory = state.navigationHistory.slice(-50)
      state.currentRouteIndex = state.navigationHistory.length - 1
    }
  },
  
  SET_NAVIGATION_INDEX(state, index) {
    if (index >= 0 && index < state.navigationHistory.length) {
      state.currentRouteIndex = index
    }
  }
}

const actions = {
  // 侧边栏操作
  toggleSidebar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  
  setSidebarCollapsed({ commit }, collapsed) {
    commit('SET_SIDEBAR_COLLAPSED', collapsed)
  },
  
  setSidebarWidth({ commit }, width) {
    commit('SET_SIDEBAR_WIDTH', width)
  },
  
  // 弹窗操作
  showSearchModal({ commit }) {
    commit('SET_SEARCH_MODAL', true)
  },
  
  hideSearchModal({ commit }) {
    commit('SET_SEARCH_MODAL', false)
  },
  
  showSettingsModal({ commit }) {
    commit('SET_SETTINGS_MODAL', true)
  },
  
  hideSettingsModal({ commit }) {
    commit('SET_SETTINGS_MODAL', false)
  },
  
  showCreateDocumentModal({ commit }) {
    commit('SET_CREATE_DOCUMENT_MODAL', true)
  },
  
  hideCreateDocumentModal({ commit }) {
    commit('SET_CREATE_DOCUMENT_MODAL', false)
  },
  
  // 主题操作
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
    
    // 应用主题到DOM
    document.documentElement.setAttribute('data-theme', theme)
    
    // 持久化到本地存储
    localStorage.setItem('app-theme', theme)
  },
  
  loadTheme({ commit }) {
    const savedTheme = localStorage.getItem('app-theme') || 'light'
    commit('SET_THEME', savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  },
  
  // 编辑器设置
  updateEditorSettings({ commit }, settings) {
    commit('SET_EDITOR_SETTINGS', settings)
    
    // 持久化编辑器设置
    localStorage.setItem('editor-settings', JSON.stringify(settings))
  },
  
  loadEditorSettings({ commit }) {
    try {
      const saved = localStorage.getItem('editor-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        commit('SET_EDITOR_SETTINGS', settings)
      }
    } catch (error) {
      console.error('加载编辑器设置失败:', error)
    }
  },
  
  setEditorFocusMode({ commit }, focusMode) {
    commit('SET_EDITOR_FOCUS_MODE', focusMode)
  },
  
  setEditorPreset({ commit }, preset) {
    commit('SET_EDITOR_PRESET', preset)
  },
  
  // 布局设置
  updateLayoutSettings({ commit }, settings) {
    commit('SET_LAYOUT_SETTINGS', settings)
    
    // 持久化布局设置
    localStorage.setItem('layout-settings', JSON.stringify(settings))
  },
  
  loadLayoutSettings({ commit }) {
    try {
      const saved = localStorage.getItem('layout-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        commit('SET_LAYOUT_SETTINGS', settings)
      }
    } catch (error) {
      console.error('加载布局设置失败:', error)
    }
  },
  
  setCompactMode({ commit }, compact) {
    commit('SET_COMPACT_MODE', compact)
  },
  
  // 通知操作
  showNotification({ commit }, { type = 'info', title, message, duration = 5000 }) {
    const notification = { type, title, message, duration }
    commit('ADD_NOTIFICATION', notification)
    
    // 自动移除通知
    if (duration > 0) {
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', notification.id)
      }, duration)
    }
    
    return notification
  },
  
  showSuccessNotification({ dispatch }, { title, message, duration }) {
    return dispatch('showNotification', { type: 'success', title, message, duration })
  },
  
  showErrorNotification({ dispatch }, { title, message, duration = 8000 }) {
    return dispatch('showNotification', { type: 'error', title, message, duration })
  },
  
  showWarningNotification({ dispatch }, { title, message, duration = 6000 }) {
    return dispatch('showNotification', { type: 'warning', title, message, duration })
  },
  
  removeNotification({ commit }, id) {
    commit('REMOVE_NOTIFICATION', id)
  },
  
  clearAllNotifications({ commit }) {
    commit('CLEAR_NOTIFICATIONS')
  },
  
  // 加载状态
  setGlobalLoading({ commit }, loading, message = '') {
    commit('SET_GLOBAL_LOADING', { loading, message })
  },
  
  // 错误处理
  setGlobalError({ commit }, error) {
    commit('SET_GLOBAL_ERROR', error)
  },
  
  clearGlobalError({ commit }) {
    commit('CLEAR_GLOBAL_ERROR')
  },
  
  // 导航操作
  addNavigation({ commit }, route) {
    commit('ADD_NAVIGATION', {
      path: route.path,
      name: route.name,
      title: route.meta?.title || route.name,
      timestamp: new Date().toISOString()
    })
  },
  
  navigateBack({ commit, state }) {
    if (state.currentRouteIndex > 0) {
      commit('SET_NAVIGATION_INDEX', state.currentRouteIndex - 1)
      return state.navigationHistory[state.currentRouteIndex]
    }
    return null
  },
  
  navigateForward({ commit, state }) {
    if (state.currentRouteIndex < state.navigationHistory.length - 1) {
      commit('SET_NAVIGATION_INDEX', state.currentRouteIndex + 1)
      return state.navigationHistory[state.currentRouteIndex]
    }
    return null
  }
}

const getters = {
  // 侧边栏
  sidebarCollapsed: state => state.sidebarCollapsed,
  sidebarWidth: state => state.sidebarWidth,
  
  // 弹窗
  showSearchModal: state => state.showSearchModal,
  showSettingsModal: state => state.showSettingsModal,
  showCreateDocumentModal: state => state.showCreateDocumentModal,
  
  // 主题
  theme: state => state.theme,
  isDarkTheme: state => state.theme === 'dark',
  isLightTheme: state => state.theme === 'light',
  
  // 编辑器设置
  editorSettings: state => state.editorSettings,
  editorFontSize: state => state.editorSettings.fontSize,
  editorLineHeight: state => state.editorSettings.lineHeight,
  editorFocusMode: state => state.editorSettings.focusMode,
  editorPreset: state => state.editorSettings.preset,
  
  // 布局设置
  layoutSettings: state => state.layout,
  showToolbar: state => state.layout.showToolbar,
  showStatusBar: state => state.layout.showStatusBar,
  showTitle: state => state.layout.showTitle,
  compactMode: state => state.layout.compactMode,
  
  // 通知
  notifications: state => state.notifications,
  hasNotifications: state => state.notifications.length > 0,
  unreadNotifications: state => state.notifications.filter(n => !n.read),
  
  // 加载状态
  globalLoading: state => state.globalLoading,
  loadingMessage: state => state.loadingMessage,
  
  // 错误状态
  globalError: state => state.globalError,
  hasGlobalError: state => !!state.globalError,
  
  // 导航历史
  navigationHistory: state => state.navigationHistory,
  currentRoute: state => state.navigationHistory[state.currentRouteIndex] || null,
  canNavigateBack: state => state.currentRouteIndex > 0,
  canNavigateForward: state => state.currentRouteIndex < state.navigationHistory.length - 1
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}