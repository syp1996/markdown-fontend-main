/**
 * 内存泄漏检测和修复工具
 * 帮助识别和预防Vue组件中常见的内存泄漏问题
 */

class MemoryLeakDetector {
  constructor() {
    this.components = new Map()
    this.globalListeners = new Set()
    this.timers = new Set()
    this.intervals = new Set()
    this.observers = new Set()
    this.eventBusListeners = new Map()
  }

  /**
   * 注册组件，开始监控
   */
  register(componentInstance, componentName = 'Unknown') {
    const componentId = this.generateComponentId(componentInstance)
    
    this.components.set(componentId, {
      name: componentName,
      instance: componentInstance,
      registeredAt: Date.now(),
      listeners: new Set(),
      timers: new Set(),
      intervals: new Set(),
      observers: new Set(),
      eventBusListeners: new Set()
    })

    // 包装原生方法来追踪资源使用
    this.wrapComponentMethods(componentInstance, componentId)

    return componentId
  }

  /**
   * 注销组件，检查是否有未清理的资源
   */
  unregister(componentId) {
    const component = this.components.get(componentId)
    if (!component) return

    const leaks = this.detectLeaks(componentId)
    
    if (leaks.length > 0) {
      console.warn(`[内存泄漏检测] 组件 ${component.name} 存在以下未清理的资源:`, leaks)
      
      // 尝试自动清理
      this.autoCleanup(componentId)
    }

    this.components.delete(componentId)
  }

  /**
   * 生成组件唯一ID
   */
  generateComponentId(instance) {
    return `${instance.$options?.name || 'Anonymous'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 包装组件方法来追踪资源使用
   */
  wrapComponentMethods(instance, componentId) {
    const component = this.components.get(componentId)
    if (!component) return

    // 包装 addEventListener
    const originalAddEventListener = document.addEventListener
    const originalRemoveEventListener = document.removeEventListener
    
    // 包装 setTimeout
    const originalSetTimeout = window.setTimeout
    const originalClearTimeout = window.clearTimeout
    
    // 包装 setInterval
    const originalSetInterval = window.setInterval
    const originalClearInterval = window.clearInterval

    // 注意：这种全局包装可能影响其他组件，实际项目中需要更精细的实现
    // 这里提供概念性实现
  }

  /**
   * 检测内存泄漏
   */
  detectLeaks(componentId) {
    const component = this.components.get(componentId)
    if (!component) return []

    const leaks = []

    // 检查未清理的事件监听器
    if (component.listeners.size > 0) {
      leaks.push({
        type: 'event-listeners',
        count: component.listeners.size,
        items: Array.from(component.listeners)
      })
    }

    // 检查未清理的定时器
    if (component.timers.size > 0) {
      leaks.push({
        type: 'timeouts',
        count: component.timers.size,
        items: Array.from(component.timers)
      })
    }

    // 检查未清理的间隔器
    if (component.intervals.size > 0) {
      leaks.push({
        type: 'intervals',
        count: component.intervals.size,
        items: Array.from(component.intervals)
      })
    }

    // 检查未清理的观察器
    if (component.observers.size > 0) {
      leaks.push({
        type: 'observers',
        count: component.observers.size,
        items: Array.from(component.observers)
      })
    }

    return leaks
  }

  /**
   * 自动清理资源
   */
  autoCleanup(componentId) {
    const component = this.components.get(componentId)
    if (!component) return

    // 清理事件监听器
    component.listeners.forEach(listener => {
      try {
        document.removeEventListener(listener.type, listener.handler, listener.options)
        console.log(`[自动清理] 移除事件监听器: ${listener.type}`)
      } catch (error) {
        console.warn(`[自动清理] 移除事件监听器失败:`, error)
      }
    })

    // 清理定时器
    component.timers.forEach(timerId => {
      try {
        clearTimeout(timerId)
        console.log(`[自动清理] 清理定时器: ${timerId}`)
      } catch (error) {
        console.warn(`[自动清理] 清理定时器失败:`, error)
      }
    })

    // 清理间隔器
    component.intervals.forEach(intervalId => {
      try {
        clearInterval(intervalId)
        console.log(`[自动清理] 清理间隔器: ${intervalId}`)
      } catch (error) {
        console.warn(`[自动清理] 清理间隔器失败:`, error)
      }
    })

    // 清理观察器
    component.observers.forEach(observer => {
      try {
        if (observer.disconnect) {
          observer.disconnect()
        } else if (observer.unobserve) {
          observer.unobserve()
        }
        console.log(`[自动清理] 断开观察器`)
      } catch (error) {
        console.warn(`[自动清理] 断开观察器失败:`, error)
      }
    })
  }

  /**
   * 获取内存使用报告
   */
  getMemoryReport() {
    const report = {
      totalComponents: this.components.size,
      activeComponents: [],
      potentialLeaks: [],
      recommendations: []
    }

    this.components.forEach((component, componentId) => {
      const leaks = this.detectLeaks(componentId)
      
      report.activeComponents.push({
        id: componentId,
        name: component.name,
        registeredAt: component.registeredAt,
        age: Date.now() - component.registeredAt,
        resourceCounts: {
          listeners: component.listeners.size,
          timers: component.timers.size,
          intervals: component.intervals.size,
          observers: component.observers.size
        }
      })

      if (leaks.length > 0) {
        report.potentialLeaks.push({
          componentId,
          componentName: component.name,
          leaks
        })
      }
    })

    // 生成建议
    if (report.potentialLeaks.length > 0) {
      report.recommendations.push('发现潜在内存泄漏，建议在组件销毁时清理所有资源')
    }

    if (report.activeComponents.some(c => c.age > 300000)) { // 5分钟
      report.recommendations.push('某些组件存活时间过长，请检查是否正常')
    }

    return report
  }

  /**
   * 清理所有资源（用于应用关闭时）
   */
  cleanup() {
    this.components.forEach((component, componentId) => {
      this.autoCleanup(componentId)
    })
    
    this.components.clear()
    this.globalListeners.clear()
    this.timers.clear()
    this.intervals.clear()
    this.observers.clear()
    this.eventBusListeners.clear()
  }
}

// 创建全局实例
const memoryLeakDetector = new MemoryLeakDetector()

/**
 * Vue 3 组合式API Hook
 */
export function useMemoryLeakDetection(componentName) {
  import { getCurrentInstance, onBeforeUnmount } from 'vue'
  
  const instance = getCurrentInstance()
  if (!instance) {
    console.warn('useMemoryLeakDetection must be called within a setup function')
    return
  }

  const componentId = memoryLeakDetector.register(instance, componentName)

  onBeforeUnmount(() => {
    memoryLeakDetector.unregister(componentId)
  })

  return {
    componentId,
    detector: memoryLeakDetector
  }
}

/**
 * 资源清理助手类
 */
export class ResourceCleaner {
  constructor() {
    this.timers = new Set()
    this.intervals = new Set()
    this.listeners = new Map()
    this.observers = new Set()
    this.eventBusListeners = new Map()
  }

  /**
   * 添加定时器
   */
  addTimeout(callback, delay) {
    const timerId = setTimeout(() => {
      this.timers.delete(timerId)
      callback()
    }, delay)
    
    this.timers.add(timerId)
    return timerId
  }

  /**
   * 添加间隔器
   */
  addInterval(callback, delay) {
    const intervalId = setInterval(callback, delay)
    this.intervals.add(intervalId)
    return intervalId
  }

  /**
   * 添加事件监听器
   */
  addEventListener(element, type, handler, options) {
    element.addEventListener(type, handler, options)
    
    if (!this.listeners.has(element)) {
      this.listeners.set(element, new Set())
    }
    
    this.listeners.get(element).add({ type, handler, options })
    
    return () => this.removeEventListener(element, type, handler)
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(element, type, handler) {
    element.removeEventListener(type, handler)
    
    const elementListeners = this.listeners.get(element)
    if (elementListeners) {
      elementListeners.forEach(listener => {
        if (listener.type === type && listener.handler === handler) {
          elementListeners.delete(listener)
        }
      })
      
      if (elementListeners.size === 0) {
        this.listeners.delete(element)
      }
    }
  }

  /**
   * 添加事件总线监听器
   */
  addEventBusListener(eventBus, event, handler) {
    eventBus.on(event, handler)
    
    if (!this.eventBusListeners.has(eventBus)) {
      this.eventBusListeners.set(eventBus, new Map())
    }
    
    if (!this.eventBusListeners.get(eventBus).has(event)) {
      this.eventBusListeners.get(eventBus).set(event, new Set())
    }
    
    this.eventBusListeners.get(eventBus).get(event).add(handler)
    
    return () => this.removeEventBusListener(eventBus, event, handler)
  }

  /**
   * 移除事件总线监听器
   */
  removeEventBusListener(eventBus, event, handler) {
    eventBus.off(event, handler)
    
    const busListeners = this.eventBusListeners.get(eventBus)
    if (busListeners && busListeners.has(event)) {
      busListeners.get(event).delete(handler)
      
      if (busListeners.get(event).size === 0) {
        busListeners.delete(event)
      }
      
      if (busListeners.size === 0) {
        this.eventBusListeners.delete(eventBus)
      }
    }
  }

  /**
   * 添加观察器
   */
  addObserver(observer) {
    this.observers.add(observer)
    return observer
  }

  /**
   * 清理所有资源
   */
  cleanup() {
    // 清理定时器
    this.timers.forEach(timerId => clearTimeout(timerId))
    this.timers.clear()

    // 清理间隔器
    this.intervals.forEach(intervalId => clearInterval(intervalId))
    this.intervals.clear()

    // 清理事件监听器
    this.listeners.forEach((listeners, element) => {
      listeners.forEach(({ type, handler, options }) => {
        element.removeEventListener(type, handler)
      })
    })
    this.listeners.clear()

    // 清理观察器
    this.observers.forEach(observer => {
      try {
        if (observer.disconnect) {
          observer.disconnect()
        } else if (observer.unobserve) {
          observer.unobserve()
        }
      } catch (error) {
        console.warn('清理观察器失败:', error)
      }
    })
    this.observers.clear()

    // 清理事件总线监听器
    this.eventBusListeners.forEach((events, eventBus) => {
      events.forEach((handlers, event) => {
        handlers.forEach(handler => {
          eventBus.off(event, handler)
        })
      })
    })
    this.eventBusListeners.clear()
  }

  /**
   * 获取资源统计
   */
  getStats() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      listeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      observers: this.observers.size,
      eventBusListeners: Array.from(this.eventBusListeners.values())
        .reduce((sum, events) => sum + Array.from(events.values())
        .reduce((eventSum, handlers) => eventSum + handlers.size, 0), 0)
    }
  }
}

// 导出
export default memoryLeakDetector

export { 
  MemoryLeakDetector,
  memoryLeakDetector
}