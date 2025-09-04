// utils/eventBus.js
import mitt from 'mitt'

/**
 * 增强的事件总线，支持内存泄漏检测和自动清理
 */
class EnhancedEventBus {
  constructor() {
    this.eventBus = mitt()
    this.listeners = new Map() // 跟踪监听器
    this.componentListeners = new Map() // 按组件跟踪监听器
  }

  /**
   * 添加事件监听器
   */
  on(event, handler, componentId = null) {
    this.eventBus.on(event, handler)
    
    // 跟踪监听器
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(handler)
    
    // 按组件跟踪
    if (componentId) {
      if (!this.componentListeners.has(componentId)) {
        this.componentListeners.set(componentId, new Map())
      }
      
      if (!this.componentListeners.get(componentId).has(event)) {
        this.componentListeners.get(componentId).set(event, new Set())
      }
      
      this.componentListeners.get(componentId).get(event).add(handler)
    }
    
    return handler
  }

  /**
   * 移除事件监听器
   */
  off(event, handler) {
    this.eventBus.off(event, handler)
    
    // 更新跟踪
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler)
      
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event)
      }
    }
    
    // 从组件跟踪中移除
    this.componentListeners.forEach((events, componentId) => {
      if (events.has(event)) {
        events.get(event).delete(handler)
        
        if (events.get(event).size === 0) {
          events.delete(event)
        }
        
        if (events.size === 0) {
          this.componentListeners.delete(componentId)
        }
      }
    })
  }

  /**
   * 发送事件
   */
  emit(event, data) {
    this.eventBus.emit(event, data)
  }

  /**
   * 清理组件的所有监听器
   */
  clearComponentListeners(componentId) {
    const componentEvents = this.componentListeners.get(componentId)
    if (!componentEvents) return
    
    let clearedCount = 0
    componentEvents.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.off(event, handler)
        clearedCount++
      })
    })
    
    console.log(`[EventBus] 清理组件 ${componentId} 的 ${clearedCount} 个监听器`)
    return clearedCount
  }

  /**
   * 获取监听器统计信息
   */
  getListenerStats() {
    const stats = {
      totalEvents: this.listeners.size,
      totalListeners: 0,
      eventDetails: {},
      componentStats: {}
    }
    
    // 统计事件监听器
    this.listeners.forEach((handlers, event) => {
      stats.totalListeners += handlers.size
      stats.eventDetails[event] = handlers.size
    })
    
    // 统计组件监听器
    this.componentListeners.forEach((events, componentId) => {
      let componentListenerCount = 0
      events.forEach((handlers) => {
        componentListenerCount += handlers.size
      })
      stats.componentStats[componentId] = {
        events: events.size,
        listeners: componentListenerCount
      }
    })
    
    return stats
  }

  /**
   * 检测潜在的内存泄漏
   */
  detectMemoryLeaks() {
    const leaks = []
    const stats = this.getListenerStats()
    
    // 检查是否有组件监听器过多
    Object.entries(stats.componentStats).forEach(([componentId, stat]) => {
      if (stat.listeners > 10) {
        leaks.push({
          type: 'excessive-listeners',
          componentId,
          count: stat.listeners,
          message: `组件 ${componentId} 有 ${stat.listeners} 个监听器，可能存在内存泄漏`
        })
      }
    })
    
    // 检查是否有事件监听器过多
    Object.entries(stats.eventDetails).forEach(([event, count]) => {
      if (count > 20) {
        leaks.push({
          type: 'excessive-event-listeners',
          event,
          count,
          message: `事件 ${event} 有 ${count} 个监听器，可能存在重复注册`
        })
      }
    })
    
    return leaks
  }

  /**
   * 清理所有监听器（用于应用关闭时）
   */
  cleanup() {
    this.eventBus.all.clear()
    this.listeners.clear()
    this.componentListeners.clear()
    console.log('[EventBus] 所有监听器已清理')
  }
}

// 创建增强的事件总线实例
const eventBus = new EnhancedEventBus()

// 开发环境下的监控
if (process.env.NODE_ENV === 'development') {
  // 定期检测内存泄漏
  let leakDetectionTimer
  
  const startLeakDetection = () => {
    leakDetectionTimer = setInterval(() => {
      const leaks = eventBus.detectMemoryLeaks()
      if (leaks.length > 0) {
        console.warn('[EventBus] 检测到潜在内存泄漏:', leaks)
      }
    }, 30000) // 每30秒检查一次
  }
  
  const stopLeakDetection = () => {
    if (leakDetectionTimer) {
      clearInterval(leakDetectionTimer)
      leakDetectionTimer = null
    }
  }
  
  // 启动监控
  startLeakDetection()
  
  // 在窗口关闭前停止监控
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      stopLeakDetection()
      eventBus.cleanup()
    })
  }
  
  // 暴露调试方法到全局
  if (typeof window !== 'undefined') {
    window.eventBusDebug = {
      getStats: () => eventBus.getListenerStats(),
      detectLeaks: () => eventBus.detectMemoryLeaks(),
      cleanup: () => eventBus.cleanup()
    }
  }
}

export default eventBus