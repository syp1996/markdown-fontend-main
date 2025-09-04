/**
 * 安全的认证token管理工具
 * 提供更安全的token存储方案，减少XSS攻击风险
 */

// 使用sessionStorage作为更安全的替代方案
// sessionStorage在关闭标签页后自动清除，减少token泄露风险
const STORAGE_KEY = 'app_auth_token'
const USER_INFO_KEY = 'app_user_info'

// 添加前缀以避免冲突
const PREFIX = '__secure_'

class AuthManager {
  constructor() {
    // 使用sessionStorage而不是localStorage提高安全性
    this.storage = sessionStorage
    
    // 检查是否支持sessionStorage
    if (!this.storage) {
      console.warn('SessionStorage不支持，回退到内存存储')
      this.memoryStore = {}
    }
  }

  /**
   * 设置token
   * @param {string} token - JWT token
   */
  setToken(token) {
    if (!token) {
      this.removeToken()
      return
    }

    try {
      const tokenData = {
        value: token,
        timestamp: Date.now(),
        // 添加简单的校验码
        checksum: this._generateChecksum(token)
      }

      if (this.storage) {
        this.storage.setItem(PREFIX + STORAGE_KEY, JSON.stringify(tokenData))
      } else {
        this.memoryStore[STORAGE_KEY] = tokenData
      }
    } catch (error) {
      console.error('设置token失败:', error)
    }
  }

  /**
   * 获取token
   * @returns {string|null} token值或null
   */
  getToken() {
    try {
      let tokenData = null
      
      if (this.storage) {
        const stored = this.storage.getItem(PREFIX + STORAGE_KEY)
        tokenData = stored ? JSON.parse(stored) : null
      } else {
        tokenData = this.memoryStore[STORAGE_KEY] || null
      }

      if (!tokenData) return null

      // 验证token完整性
      if (!this._validateToken(tokenData)) {
        console.warn('Token验证失败，清除无效token')
        this.removeToken()
        return null
      }

      // 检查token是否过期（24小时）
      const MAX_AGE = 24 * 60 * 60 * 1000 // 24小时
      if (Date.now() - tokenData.timestamp > MAX_AGE) {
        console.warn('Token已过期，自动清除')
        this.removeToken()
        return null
      }

      return tokenData.value
    } catch (error) {
      console.error('获取token失败:', error)
      this.removeToken()
      return null
    }
  }

  /**
   * 移除token
   */
  removeToken() {
    try {
      if (this.storage) {
        this.storage.removeItem(PREFIX + STORAGE_KEY)
      } else {
        delete this.memoryStore[STORAGE_KEY]
      }
    } catch (error) {
      console.error('移除token失败:', error)
    }
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken()
  }

  /**
   * 设置用户信息
   * @param {object} userInfo - 用户信息对象
   */
  setUserInfo(userInfo) {
    if (!userInfo) {
      this.removeUserInfo()
      return
    }

    try {
      const userData = {
        value: userInfo,
        timestamp: Date.now(),
        checksum: this._generateChecksum(JSON.stringify(userInfo))
      }

      if (this.storage) {
        this.storage.setItem(PREFIX + USER_INFO_KEY, JSON.stringify(userData))
      } else {
        this.memoryStore[USER_INFO_KEY] = userData
      }
    } catch (error) {
      console.error('设置用户信息失败:', error)
    }
  }

  /**
   * 获取用户信息
   * @returns {object|null}
   */
  getUserInfo() {
    try {
      let userData = null
      
      if (this.storage) {
        const stored = this.storage.getItem(PREFIX + USER_INFO_KEY)
        userData = stored ? JSON.parse(stored) : null
      } else {
        userData = this.memoryStore[USER_INFO_KEY] || null
      }

      if (!userData) return null

      // 验证数据完整性
      if (!this._validateUserData(userData)) {
        console.warn('用户信息验证失败，清除无效数据')
        this.removeUserInfo()
        return null
      }

      return userData.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.removeUserInfo()
      return null
    }
  }

  /**
   * 移除用户信息
   */
  removeUserInfo() {
    try {
      if (this.storage) {
        this.storage.removeItem(PREFIX + USER_INFO_KEY)
      } else {
        delete this.memoryStore[USER_INFO_KEY]
      }
    } catch (error) {
      console.error('移除用户信息失败:', error)
    }
  }

  /**
   * 清除所有认证数据
   */
  clearAll() {
    this.removeToken()
    this.removeUserInfo()
  }

  /**
   * 从localStorage迁移数据到新的安全存储
   * 这是一个一次性迁移方法，用于平滑过渡
   */
  migrateFromLocalStorage() {
    try {
      // 迁移token
      const oldToken = localStorage.getItem('token')
      if (oldToken) {
        this.setToken(oldToken)
        localStorage.removeItem('token')
        console.log('Token已从localStorage迁移到安全存储')
      }

      // 迁移用户信息
      const oldUserInfo = localStorage.getItem('userInfo')
      if (oldUserInfo) {
        const userInfo = JSON.parse(oldUserInfo)
        this.setUserInfo(userInfo)
        localStorage.removeItem('userInfo')
        console.log('用户信息已从localStorage迁移到安全存储')
      }
    } catch (error) {
      console.error('数据迁移失败:', error)
    }
  }

  /**
   * 生成简单的校验码
   * @private
   */
  _generateChecksum(str) {
    let hash = 0
    if (str.length === 0) return hash
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(36)
  }

  /**
   * 验证token数据完整性
   * @private
   */
  _validateToken(tokenData) {
    if (!tokenData || typeof tokenData !== 'object') return false
    if (!tokenData.value || !tokenData.timestamp || !tokenData.checksum) return false
    
    const expectedChecksum = this._generateChecksum(tokenData.value)
    return expectedChecksum === tokenData.checksum
  }

  /**
   * 验证用户数据完整性
   * @private
   */
  _validateUserData(userData) {
    if (!userData || typeof userData !== 'object') return false
    if (!userData.value || !userData.timestamp || !userData.checksum) return false
    
    const expectedChecksum = this._generateChecksum(JSON.stringify(userData.value))
    return expectedChecksum === userData.checksum
  }
}

// 创建单例实例
const authManager = new AuthManager()

// 应用启动时执行一次迁移
authManager.migrateFromLocalStorage()

export default authManager