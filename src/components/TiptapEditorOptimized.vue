<template>
  <div class="tiptap-editor-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="editor-loading">
      <div class="loading-spinner"></div>
      <span>编辑器加载中...</span>
    </div>
    
    <!-- 工具栏 -->
    <div v-show="!isLoading" class="toolbar" v-if="showToolbar">
      <template v-for="group in availableToolbarGroups" :key="group.name">
        <div v-if="group.buttons.length > 0" class="toolbar-group">
          <button 
            v-for="button in group.buttons"
            :key="button.name"
            @click="button.action"
            :class="{ 
              'format-btn': true, 
              'active': button.isActive ? button.isActive() : false,
              'disabled': button.isDisabled ? button.isDisabled() : false
            }"
            :disabled="button.isDisabled ? button.isDisabled() : false"
            :title="button.title"
          >
            {{ button.label }}
          </button>
        </div>
        <div class="separator" v-if="group !== availableToolbarGroups[availableToolbarGroups.length - 1]"></div>
      </template>
    </div>

    <!-- 文档标题输入区域 -->
    <div v-show="!isLoading" class="document-title-container" v-if="showTitle">
      <input 
        v-model="documentTitle"
        class="document-title-input"
        placeholder="文档标题"
        @input="handleTitleInput"
        @blur="handleTitleBlur"
      />
    </div>
    
    <!-- 编辑器内容 -->
    <editor-content 
      v-show="!isLoading"
      :editor="editor" 
      class="editor-content"
      :style="{ height: height }"
    />
    
    <!-- 状态栏 -->
    <div v-show="!isLoading && showStatusBar && editor" class="status-bar">
      <div class="status-item">
        字符: {{ characterCount }}
      </div>
      <div class="status-item">
        词数: {{ wordCount }}
      </div>
      <div class="status-item">
        段落: {{ paragraphCount }}
      </div>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import extensionLoader, { getDefaultExtensionConfig } from '@/utils/tiptapExtensions'
import { updateDocument } from '@/api/documents'

export default {
  name: 'TiptapEditorOptimized',
  components: {
    EditorContent,
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    content: {
      type: [String, Object],
      default: ''
    },
    placeholder: {
      type: String,
      default: '开始输入...'
    },
    height: {
      type: String,
      default: '400px'
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    showStatusBar: {
      type: Boolean,
      default: true
    },
    preset: {
      type: String,
      default: 'standard',
      validator: value => ['basic', 'standard', 'full', 'document', 'note'].includes(value)
    },
    // 自动保存相关属性
    autoSave: {
      type: Boolean,
      default: false
    },
    documentId: {
      type: [String, Number],
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    // 延迟加载控制
    lazyLoad: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur', 'save-success', 'save-error', 'title-change', 'ready'],
  data() {
    return {
      editor: null,
      isLoading: true,
      loadingError: null,
      documentTitle: '',
      // 计数器
      characterCount: 0,
      wordCount: 0,
      paragraphCount: 0,
      // 自动保存
      autoSaveTimer: null,
      isSaving: false,
      lastSavedContent: '',
      // 标题保存
      titleSaveTimer: null,
      titleSyncTimer: null,
    }
  },
  computed: {
    availableToolbarGroups() {
      if (!this.editor) return []
      
      return [
        {
          name: 'format',
          buttons: this.getFormatButtons()
        },
        {
          name: 'heading',
          buttons: this.getHeadingButtons()
        },
        {
          name: 'list',
          buttons: this.getListButtons()
        },
        {
          name: 'media',
          buttons: this.getMediaButtons()
        },
        {
          name: 'table',
          buttons: this.getTableButtons()
        },
        {
          name: 'utility',
          buttons: this.getUtilityButtons()
        }
      ].filter(group => group.buttons.length > 0)
    }
  },
  watch: {
    preset: {
      handler(newPreset) {
        this.reinitializeEditor(newPreset)
      },
      immediate: false
    },
    title: {
      handler(newValue) {
        if (newValue !== this.documentTitle) {
          this.documentTitle = newValue
        }
      },
      immediate: true
    }
  },
  async mounted() {
    if (this.lazyLoad) {
      // 延迟加载，等待用户交互或延迟一段时间
      this.scheduleEditorInit()
    } else {
      // 立即加载
      await this.initializeEditor()
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    /**
     * 调度编辑器初始化
     */
    scheduleEditorInit() {
      // 监听用户交互
      const initOnInteraction = () => {
        this.initializeEditor()
        document.removeEventListener('click', initOnInteraction)
        document.removeEventListener('keydown', initOnInteraction)
      }
      
      document.addEventListener('click', initOnInteraction, { once: true })
      document.addEventListener('keydown', initOnInteraction, { once: true })
      
      // 或者2秒后自动初始化
      setTimeout(() => {
        if (this.isLoading) {
          this.initializeEditor()
        }
      }, 2000)
    },

    /**
     * 初始化编辑器
     */
    async initializeEditor() {
      try {
        this.isLoading = true
        this.loadingError = null
        
        // 获取配置
        const config = this.getEditorConfig()
        
        // 动态加载扩展
        const extensions = await extensionLoader.loadPreset(this.preset, config)
        
        // 创建编辑器实例
        this.editor = new Editor({
          content: this.getInitialContent(),
          extensions,
          onUpdate: this.handleEditorUpdate,
          onFocus: () => this.$emit('focus'),
          onBlur: () => this.$emit('blur'),
          onTransaction: this.handleTransaction,
          editorProps: {
            attributes: {
              class: 'tiptap-editor-instance',
            },
            handleKeyDown: this.handleKeyDown,
          },
        })
        
        // 初始化完成
        this.isLoading = false
        this.updateCounts()
        this.$emit('ready', this.editor)
        
      } catch (error) {
        console.error('编辑器初始化失败:', error)
        this.isLoading = false
        this.loadingError = error
      }
    },

    /**
     * 重新初始化编辑器（用于更改预设）
     */
    async reinitializeEditor(newPreset) {
      if (!this.editor) return
      
      const currentContent = this.editor.getHTML()
      this.editor.destroy()
      
      this.isLoading = true
      await this.initializeEditor()
      
      if (currentContent) {
        this.editor.commands.setContent(currentContent)
      }
    },

    /**
     * 获取编辑器配置
     */
    getEditorConfig() {
      const defaultConfig = getDefaultExtensionConfig()
      
      // 合并自定义配置
      return {
        ...defaultConfig,
        core: {
          ...defaultConfig.core,
          Placeholder: {
            ...defaultConfig.core.Placeholder,
            placeholder: this.placeholder
          }
        }
      }
    },

    /**
     * 获取初始内容
     */
    getInitialContent() {
      if (this.content) {
        return typeof this.content === 'string' ? this.content : this.content.html || ''
      }
      return this.modelValue || ''
    },

    /**
     * 处理编辑器更新
     */
    handleEditorUpdate() {
      if (!this.editor) return
      
      const content = this.editor.getHTML()
      this.updateCounts()
      
      this.$emit('update:modelValue', content)
      this.$emit('change', content)
      
      // 自动保存
      if (this.autoSave && this.documentId) {
        this.handleAutoSave(content)
      }
    },

    /**
     * 处理编辑器事务
     */
    handleTransaction() {
      this.updateCounts()
    },

    /**
     * 更新统计计数
     */
    updateCounts() {
      if (!this.editor) return
      
      const characterCountExtension = this.editor.extensionManager.extensions.find(
        ext => ext.name === 'characterCount'
      )
      
      if (characterCountExtension) {
        this.characterCount = this.editor.storage.characterCount?.characters() || 0
        this.wordCount = this.editor.storage.characterCount?.words() || 0
      }
      
      // 计算段落数
      try {
        const doc = this.editor.getJSON()
        this.paragraphCount = this.countParagraphs(doc)
      } catch (error) {
        console.warn('计算段落数失败:', error)
        this.paragraphCount = 0
      }
    },

    /**
     * 计算段落数量
     */
    countParagraphs(node) {
      let count = 0
      if (node.type === 'paragraph') count++
      if (node.content) {
        node.content.forEach(child => {
          count += this.countParagraphs(child)
        })
      }
      return count
    },

    /**
     * 处理键盘事件
     */
    handleKeyDown(view, event) {
      // 处理快捷键
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'b':
            event.preventDefault()
            this.editor.chain().focus().toggleBold().run()
            return true
          case 'i':
            event.preventDefault()
            this.editor.chain().focus().toggleItalic().run()
            return true
          case 's':
            event.preventDefault()
            if (this.autoSave && this.documentId) {
              this.manualSave()
            }
            return true
        }
      }
      return false
    },

    // 工具栏按钮组
    getFormatButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      // 基础格式按钮
      if (this.editor.can().toggleBold()) {
        buttons.push({
          name: 'bold',
          label: 'B',
          title: '粗体',
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive('bold')
        })
      }
      
      if (this.editor.can().toggleItalic()) {
        buttons.push({
          name: 'italic',
          label: 'I',
          title: '斜体',
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive('italic')
        })
      }
      
      if (this.editor.can().toggleUnderline()) {
        buttons.push({
          name: 'underline',
          label: 'U',
          title: '下划线',
          action: () => this.editor.chain().focus().toggleUnderline().run(),
          isActive: () => this.editor.isActive('underline')
        })
      }
      
      return buttons
    },

    getHeadingButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      for (let level = 1; level <= 3; level++) {
        if (this.editor.can().toggleHeading({ level })) {
          buttons.push({
            name: `heading-${level}`,
            label: `H${level}`,
            title: `标题${level}`,
            action: () => this.editor.chain().focus().toggleHeading({ level }).run(),
            isActive: () => this.editor.isActive('heading', { level })
          })
        }
      }
      
      return buttons
    },

    getListButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      if (this.editor.can().toggleBulletList()) {
        buttons.push({
          name: 'bullet-list',
          label: '• 列表',
          title: '无序列表',
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive('bulletList')
        })
      }
      
      if (this.editor.can().toggleOrderedList()) {
        buttons.push({
          name: 'ordered-list',
          label: '1. 列表',
          title: '有序列表',
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive('orderedList')
        })
      }
      
      return buttons
    },

    getMediaButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      if (this.editor.can().setLink()) {
        buttons.push({
          name: 'link',
          label: '🔗',
          title: '插入链接',
          action: this.setLink,
          isActive: () => this.editor.isActive('link')
        })
      }
      
      return buttons
    },

    getTableButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      if (this.editor.can().insertTable()) {
        buttons.push({
          name: 'table',
          label: '表格',
          title: '插入表格',
          action: () => this.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        })
      }
      
      return buttons
    },

    getUtilityButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      if (this.editor.can().undo()) {
        buttons.push({
          name: 'undo',
          label: '↶',
          title: '撤销',
          action: () => this.editor.chain().focus().undo().run(),
          isDisabled: () => !this.editor.can().undo()
        })
      }
      
      if (this.editor.can().redo()) {
        buttons.push({
          name: 'redo',
          label: '↷',
          title: '重做',
          action: () => this.editor.chain().focus().redo().run(),
          isDisabled: () => !this.editor.can().redo()
        })
      }
      
      return buttons
    },

    // 媒体操作
    setLink() {
      const url = window.prompt('请输入链接地址:')
      if (url && this.editor) {
        this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    },

    // 自动保存功能
    handleAutoSave(content) {
      if (!this.autoSave || !this.documentId || content === this.lastSavedContent || this.isSaving) {
        return
      }

      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = setTimeout(() => {
        this.performAutoSave(content)
      }, 3000)
    },

    async performAutoSave(content) {
      if (this.isSaving || !this.documentId) return

      try {
        this.isSaving = true
        await updateDocument(this.documentId, { content: { html: content, type: "html" } })
        this.lastSavedContent = content
        this.$emit('save-success', { documentId: this.documentId, content, timestamp: new Date().toISOString() })
      } catch (error) {
        this.$emit('save-error', { documentId: this.documentId, error, content, timestamp: new Date().toISOString() })
      } finally {
        this.isSaving = false
      }
    },

    manualSave() {
      if (!this.editor) return
      const content = this.editor.getHTML()
      clearTimeout(this.autoSaveTimer)
      this.performAutoSave(content)
    },

    // 标题处理
    handleTitleInput() {
      clearTimeout(this.titleSyncTimer)
      this.titleSyncTimer = setTimeout(() => {
        this.$emit('title-change', this.documentTitle)
      }, 500)

      if (this.autoSave && this.documentId) {
        this.handleTitleAutoSave()
      }
    },

    handleTitleBlur() {
      clearTimeout(this.titleSyncTimer)
      this.$emit('title-change', this.documentTitle)

      if (this.autoSave && this.documentId) {
        this.saveTitle()
      }
    },

    handleTitleAutoSave() {
      clearTimeout(this.titleSaveTimer)
      this.titleSaveTimer = setTimeout(() => {
        this.saveTitle()
      }, 1000)
    },

    async saveTitle() {
      if (!this.documentId || !this.documentTitle.trim()) return

      try {
        await updateDocument(this.documentId, { title: this.documentTitle.trim() })
      } catch (error) {
        console.error('标题保存失败:', error)
      }
    },

    // 公共API
    focus() {
      if (this.editor) {
        this.editor.commands.focus()
      }
    },

    blur() {
      if (this.editor) {
        this.editor.commands.blur()
      }
    },

    getHTML() {
      return this.editor ? this.editor.getHTML() : ''
    },

    getText() {
      return this.editor ? this.editor.getText() : ''
    },

    getJSON() {
      return this.editor ? this.editor.getJSON() : null
    },

    setContent(content) {
      if (this.editor) {
        this.editor.commands.setContent(content)
      }
    },

    // 清理资源
    cleanup() {
      if (this.editor) {
        this.editor.destroy()
      }
      
      clearTimeout(this.autoSaveTimer)
      clearTimeout(this.titleSaveTimer)
      clearTimeout(this.titleSyncTimer)
    }
  }
}
</script>

<style scoped>
.tiptap-editor-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 加载状态 */
.editor-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.toolbar-group {
  display: flex;
  gap: 4px;
}

.format-btn {
  padding: 6px 10px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  color: #333;
  min-width: 36px;
  white-space: nowrap;
}

.format-btn:hover:not(.disabled) {
  background: #e9e9e9;
}

.format-btn.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.format-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.separator {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 8px;
}

/* 文档标题 */
.document-title-container {
  border-bottom: 1px solid #e8e8e8;
  background: white;
  padding: 16px 12px;
}

.document-title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #37352f;
  background: transparent;
  padding: 3px 2px;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
  resize: none;
  overflow: hidden;
  min-height: 44px;
}

.document-title-input::placeholder {
  color: #a8a8a8;
  font-weight: 700;
  opacity: 0.6;
}

/* 编辑器内容 */
.editor-content {
  flex: 1;
  overflow-y: auto;
  background: white;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.editor-content::-webkit-scrollbar {
  display: none;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
  gap: 16px;
}

.status-item {
  font-family: monospace;
}

/* TipTap 编辑器样式 */
:deep(.tiptap-editor-instance) {
  padding: 12px;
  height: auto;
  min-height: 100px;
  outline: none;
  box-shadow: none;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow-y: visible;
  box-sizing: border-box;
}

/* 基础样式 */
:deep(.tiptap-editor-instance h1) {
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0 8px 0;
  line-height: 1.3;
}

:deep(.tiptap-editor-instance h2) {
  font-size: 20px;
  font-weight: bold;
  margin: 14px 0 6px 0;
  line-height: 1.3;
}

:deep(.tiptap-editor-instance h3) {
  font-size: 18px;
  font-weight: bold;
  margin: 12px 0 4px 0;
  line-height: 1.3;
}

:deep(.tiptap-editor-instance p) {
  margin: 8px 0;
}

:deep(.tiptap-editor-instance strong) {
  font-weight: bold;
}

:deep(.tiptap-editor-instance em) {
  font-style: italic;
}

:deep(.tiptap-editor-instance u) {
  text-decoration: underline;
}

:deep(.tiptap-editor-instance ul) {
  list-style-type: disc;
  padding-left: 20px;
  margin: 8px 0;
}

:deep(.tiptap-editor-instance ol) {
  list-style-type: decimal;
  padding-left: 20px;
  margin: 8px 0;
}

:deep(.tiptap-editor-instance li) {
  margin: 2px 0;
}

/* 占位符样式 */
:deep(.is-editor-empty:before) {
  content: attr(data-placeholder);
  float: left;
  color: #999;
  pointer-events: none;
  height: 0;
}

/* 链接样式 */
:deep(.tiptap-link) {
  color: #007acc;
  text-decoration: underline;
  cursor: pointer;
}

:deep(.tiptap-link:hover) {
  color: #005fa3;
  text-decoration: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .document-title-input {
    font-size: 28px;
    min-height: 40px;
  }
  
  .toolbar {
    padding: 6px 8px;
  }
  
  .format-btn {
    padding: 4px 8px;
    font-size: 11px;
    min-width: 32px;
  }
  
  :deep(.tiptap-editor-instance) {
    padding: 10px;
    font-size: 13px;
  }
}
</style>