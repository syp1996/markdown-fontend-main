/**
 * TipTap扩展动态加载器
 * 实现按需加载，减少初始bundle大小
 */

// 扩展配置映射
const EXTENSION_CONFIG = {
  // 核心扩展（必须加载）
  core: {
    StarterKit: () => import('@tiptap/starter-kit'),
    Placeholder: () => import('@tiptap/extension-placeholder'),
    EditorContent: () => import('@tiptap/vue-3'),
  },

  // 基础文本格式
  textFormat: {
    Color: () => import('@tiptap/extension-color'),
    TextStyle: () => import('@tiptap/extension-text-style'),
    Underline: () => import('@tiptap/extension-underline'),
    Highlight: () => import('@tiptap/extension-highlight'),
    Superscript: () => import('@tiptap/extension-superscript'),
    Subscript: () => import('@tiptap/extension-subscript'),
  },

  // 媒体扩展
  media: {
    Image: () => import('@tiptap/extension-image'),
    Link: () => import('@tiptap/extension-link'),
  },

  // 表格扩展
  table: {
    Table: () => import('@tiptap/extension-table'),
    TableCell: () => import('@tiptap/extension-table-cell'),
    TableHeader: () => import('@tiptap/extension-table-header'),
    TableRow: () => import('@tiptap/extension-table-row'),
  },

  // 列表和任务
  lists: {
    TaskItem: () => import('@tiptap/extension-task-item'),
    TaskList: () => import('@tiptap/extension-task-list'),
  },

  // 布局和对齐
  layout: {
    TextAlign: () => import('@tiptap/extension-text-align'),
    HorizontalRule: () => import('@tiptap/extension-horizontal-rule'),
  },

  // 代码和编程
  code: {
    CodeBlock: () => import('@tiptap/extension-code-block'),
  },

  // 辅助功能
  utility: {
    CharacterCount: () => import('@tiptap/extension-character-count'),
    Typography: () => import('@tiptap/extension-typography'),
  }
}

// 预设配置
const PRESETS = {
  // 基础编辑器（最小功能集）
  basic: ['core', 'textFormat'],
  
  // 标准编辑器（常用功能）
  standard: ['core', 'textFormat', 'media', 'lists', 'layout'],
  
  // 完整编辑器（所有功能）
  full: ['core', 'textFormat', 'media', 'table', 'lists', 'layout', 'code', 'utility'],
  
  // 文档编辑器（文档写作优化）
  document: ['core', 'textFormat', 'media', 'lists', 'layout', 'utility'],
  
  // 笔记编辑器（笔记记录优化）
  note: ['core', 'textFormat', 'media', 'lists', 'code']
}

class TiptapExtensionLoader {
  constructor() {
    this.loadedExtensions = new Map()
    this.loadingPromises = new Map()
  }

  /**
   * 根据预设加载扩展
   * @param {string} preset - 预设名称
   * @param {object} options - 扩展配置选项
   * @returns {Promise<Array>} 加载的扩展数组
   */
  async loadPreset(preset = 'standard', options = {}) {
    const categories = PRESETS[preset] || PRESETS.standard
    const extensions = []

    for (const category of categories) {
      const categoryExtensions = await this.loadCategory(category, options[category] || {})
      extensions.push(...categoryExtensions)
    }

    return extensions
  }

  /**
   * 加载指定分类的扩展
   * @param {string} category - 扩展分类
   * @param {object} options - 扩展配置选项
   * @returns {Promise<Array>} 加载的扩展数组
   */
  async loadCategory(category, options = {}) {
    const categoryConfig = EXTENSION_CONFIG[category]
    if (!categoryConfig) {
      console.warn(`未知的扩展分类: ${category}`)
      return []
    }

    const extensions = []
    const loadPromises = []

    for (const [name, loader] of Object.entries(categoryConfig)) {
      loadPromises.push(this.loadExtension(name, loader, options[name]))
    }

    const results = await Promise.allSettled(loadPromises)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        extensions.push(result.value)
      } else {
        const extensionName = Object.keys(categoryConfig)[index]
        console.error(`加载扩展失败: ${extensionName}`, result.reason)
      }
    })

    return extensions
  }

  /**
   * 加载单个扩展
   * @param {string} name - 扩展名称
   * @param {function} loader - 加载函数
   * @param {object} config - 扩展配置
   * @returns {Promise<object>} 配置好的扩展实例
   */
  async loadExtension(name, loader, config = {}) {
    // 检查是否已加载
    if (this.loadedExtensions.has(name)) {
      const Extension = this.loadedExtensions.get(name)
      return this.configureExtension(Extension, config)
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(name)) {
      const Extension = await this.loadingPromises.get(name)
      return this.configureExtension(Extension, config)
    }

    // 开始加载
    const loadingPromise = this.loadExtensionModule(name, loader)
    this.loadingPromises.set(name, loadingPromise)

    try {
      const Extension = await loadingPromise
      this.loadedExtensions.set(name, Extension)
      this.loadingPromises.delete(name)
      
      return this.configureExtension(Extension, config)
    } catch (error) {
      this.loadingPromises.delete(name)
      throw error
    }
  }

  /**
   * 加载扩展模块
   * @private
   */
  async loadExtensionModule(name, loader) {
    try {
      const module = await loader()
      return module.default || module[name] || module
    } catch (error) {
      console.error(`加载扩展模块失败: ${name}`, error)
      throw error
    }
  }

  /**
   * 配置扩展实例
   * @private
   */
  configureExtension(Extension, config) {
    if (!Extension) return null

    try {
      // 如果有配置，使用configure方法
      if (config && Object.keys(config).length > 0 && Extension.configure) {
        return Extension.configure(config)
      }
      
      // 否则直接返回扩展
      return Extension
    } catch (error) {
      console.error('配置扩展失败:', error)
      return Extension
    }
  }

  /**
   * 预加载指定的扩展分类
   * @param {Array<string>} categories - 要预加载的分类
   */
  async preloadCategories(categories) {
    const promises = categories.map(category => this.loadCategory(category))
    await Promise.allSettled(promises)
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.loadedExtensions.clear()
    this.loadingPromises.clear()
  }

  /**
   * 获取已加载的扩展列表
   */
  getLoadedExtensions() {
    return Array.from(this.loadedExtensions.keys())
  }
}

// 创建单例实例
const extensionLoader = new TiptapExtensionLoader()

// 导出常用方法
export default extensionLoader

export {
  PRESETS,
  EXTENSION_CONFIG,
  TiptapExtensionLoader
}

/**
 * 快捷方法：加载基础编辑器扩展
 */
export async function loadBasicExtensions(options = {}) {
  return await extensionLoader.loadPreset('basic', options)
}

/**
 * 快捷方法：加载标准编辑器扩展
 */
export async function loadStandardExtensions(options = {}) {
  return await extensionLoader.loadPreset('standard', options)
}

/**
 * 快捷方法：加载完整编辑器扩展
 */
export async function loadFullExtensions(options = {}) {
  return await extensionLoader.loadPreset('full', options)
}

/**
 * 获取扩展默认配置
 */
export function getDefaultExtensionConfig() {
  return {
    core: {
      Placeholder: {
        placeholder: '开始输入...',
        emptyEditorClass: 'is-editor-empty',
      }
    },
    textFormat: {
      Color: {
        types: ['textStyle'],
      }
    },
    media: {
      Link: {
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }
    },
    table: {
      Table: {
        resizable: true,
        handleWidth: 5,
        lastColumnResizable: false,
      }
    },
    lists: {
      TaskItem: {
        nested: true,
      }
    },
    layout: {
      TextAlign: {
        types: ['heading', 'paragraph'],
      }
    },
    code: {
      CodeBlock: {
        HTMLAttributes: {
          class: 'tiptap-code-block',
        },
      }
    }
  }
}