<template>
  <div class="tiptap-editor-container">
    <!-- 工具栏 -->
    <EditorToolbar
      :editor="editor"
      :show="showToolbar"
      :groups="toolbarGroups"
    />

    <!-- 文档标题 -->
    <DocumentTitle
      v-model:title="documentTitle"
      :show="showTitle"
      :placeholder="titlePlaceholder"
      :auto-save="autoSave && !!documentId"
      :auto-save-delay="1000"
      :sync-delay="500"
      @title-change="handleTitleChange"
      @title-save="handleTitleSave"
      ref="titleRef"
    />
    
    <!-- 编辑器内容 -->
    <EditorContent
      :editor="editor"
      :height="height"
      :is-loading="isLoading"
      :loading-text="loadingText"
      :loading-error="loadingError"
      :focus-mode="focusMode"
      @focus="handleFocus"
      @blur="handleBlur"
      @retry="initializeEditor"
      ref="contentRef"
    />

    <!-- 状态栏 -->
    <EditorStatusBar
      :editor="editor"
      :show="showStatusBar"
      :show-character-count="showCharacterCount"
      :show-word-count="showWordCount"
      :show-paragraph-count="showParagraphCount"
      :show-save-status="autoSave && !!documentId"
      :save-status="saveStatus"
      ref="statusRef"
    />
  </div>
</template>

<script>
import { Editor } from '@tiptap/vue-3'
import extensionLoader, { getDefaultExtensionConfig } from '@/utils/tiptapExtensions'
import { updateDocument } from '@/api/documents'

// 子组件
import EditorToolbar from './editor/EditorToolbar.vue'
import DocumentTitle from './editor/DocumentTitle.vue'
import EditorContent from './editor/EditorContent.vue'
import EditorStatusBar from './editor/EditorStatusBar.vue'

export default {
  name: 'TiptapEditorRefactored',
  components: {
    EditorToolbar,
    DocumentTitle,
    EditorContent,
    EditorStatusBar
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
    // 显示控制
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
    showCharacterCount: {
      type: Boolean,
      default: true
    },
    showWordCount: {
      type: Boolean,
      default: true
    },
    showParagraphCount: {
      type: Boolean,
      default: true
    },
    // 编辑器预设
    preset: {
      type: String,
      default: 'standard',
      validator: value => ['basic', 'standard', 'full', 'document', 'note'].includes(value)
    },
    // 工具栏配置
    toolbarGroups: {
      type: Array,
      default: () => ['format', 'heading', 'list', 'media', 'table', 'utility']
    },
    // 标题相关
    title: {
      type: String,
      default: ''
    },
    titlePlaceholder: {
      type: String,
      default: '文档标题'
    },
    // 自动保存
    autoSave: {
      type: Boolean,
      default: false
    },
    autoSaveDelay: {
      type: Number,
      default: 3000
    },
    documentId: {
      type: [String, Number],
      default: null
    },
    // 延迟加载
    lazyLoad: {
      type: Boolean,
      default: true
    },
    loadingText: {
      type: String,
      default: '编辑器加载中...'
    },
    // 专注模式
    focusMode: {
      type: Boolean,
      default: false
    },
    // 用户输入监听
    enableUserInputAutoSave: {
      type: Boolean,
      default: true
    },
    userInactivityDelay: {
      type: Number,
      default: 3000
    }
  },
  emits: [
    'update:modelValue', 
    'change', 
    'focus', 
    'blur', 
    'save-success', 
    'save-error', 
    'title-change',
    'ready'
  ],
  data() {
    return {
      editor: null,
      isLoading: true,
      loadingError: null,
      documentTitle: '',
      // 保存状态
      saveStatus: 'saved', // 'saving', 'saved', 'error', 'unsaved'
      autoSaveTimer: null,
      isSaving: false,
      lastSavedContent: '',
      // 用户输入监听
      userInputTimer: null,
      isUserActive: false
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
    },
    modelValue: {
      handler(newValue) {
        if (this.editor && newValue !== this.getCurrentValue()) {
          this.setContent(newValue)
        }
      }
    },
    content: {
      handler(newValue) {
        if (this.editor && newValue) {
          this.setContentFromProp(newValue)
        }
      },
      deep: true,
      immediate: true
    }
  },
  async mounted() {
    if (this.lazyLoad) {
      this.scheduleEditorInit()
    } else {
      await this.initializeEditor()
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    // === 编辑器初始化 ===
    
    scheduleEditorInit() {
      const initOnInteraction = () => {
        this.initializeEditor()
        document.removeEventListener('click', initOnInteraction)
        document.removeEventListener('keydown', initOnInteraction)
      }
      
      document.addEventListener('click', initOnInteraction, { once: true })
      document.addEventListener('keydown', initOnInteraction, { once: true })
      
      setTimeout(() => {
        if (this.isLoading) {
          this.initializeEditor()
        }
      }, 2000)
    },

    async initializeEditor() {
      try {
        this.isLoading = true
        this.loadingError = null
        
        const config = this.getEditorConfig()
        const extensions = await extensionLoader.loadPreset(this.preset, config)
        
        this.editor = new Editor({
          content: this.getInitialContent(),
          extensions,
          onUpdate: this.handleEditorUpdate,
          onFocus: this.handleEditorFocus,
          onBlur: this.handleEditorBlur,
          onTransaction: this.handleTransaction,
          editorProps: {
            attributes: {
              class: 'tiptap-editor-instance',
            },
            handleKeyDown: this.handleKeyDown,
          },
        })
        
        this.isLoading = false
        this.setSaveStatus('saved')
        this.setLastSavedContent()
        this.$emit('ready', this.editor)
        
      } catch (error) {
        console.error('编辑器初始化失败:', error)
        this.isLoading = false
        this.loadingError = error
      }
    },

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

    getEditorConfig() {
      const defaultConfig = getDefaultExtensionConfig()
      
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

    // === 内容管理 ===
    
    getInitialContent() {
      if (this.content) {
        return this.extractContentValue(this.content)
      }
      return this.modelValue || ''
    },

    extractContentValue(content) {
      if (typeof content === 'object' && content !== null) {
        if (content.html) return content.html
        if (content.markdown) return content.markdown
        if (content.content) return content.content
        if (content.text) return content.text
        return JSON.stringify(content)
      }
      return content || ''
    },

    setContentFromProp(content) {
      if (!this.editor) return
      
      const contentValue = this.extractContentValue(content)
      const currentValue = this.getCurrentValue()
      
      if (contentValue && contentValue !== currentValue) {
        this.setContent(contentValue)
      }
    },

    getCurrentValue() {
      if (!this.editor) return ''
      
      try {
        return this.editor.getHTML()
      } catch (error) {
        console.warn('获取内容失败:', error)
        return ''
      }
    },

    setContent(content) {
      if (!this.editor) return
      
      try {
        this.editor.commands.setContent(content || '')
      } catch (error) {
        console.warn('设置内容失败:', error)
        this.editor.commands.setContent('')
      }
    },

    // === 事件处理 ===
    
    handleEditorUpdate() {
      if (!this.editor) return
      
      const content = this.getCurrentValue()
      
      this.$emit('update:modelValue', content)
      this.$emit('change', content)
      
      // 标记为未保存
      if (content !== this.lastSavedContent) {
        this.setSaveStatus('unsaved')
      }
      
      // 自动保存
      if (this.autoSave && this.documentId) {
        this.handleAutoSave(content)
      }
      
      // 用户输入监听
      if (this.enableUserInputAutoSave) {
        this.handleUserInput()
      }
    },

    handleEditorFocus() {
      this.$emit('focus')
      if (this.enableUserInputAutoSave) {
        this.handleUserInput()
      }
    },

    handleEditorBlur() {
      this.$emit('blur')
      if (this.enableUserInputAutoSave) {
        this.handleUserInput()
      }
    },

    handleTransaction() {
      if (this.enableUserInputAutoSave) {
        this.handleUserInput()
      }
    },

    handleFocus() {
      this.$emit('focus')
    },

    handleBlur() {
      this.$emit('blur')
    },

    handleKeyDown(view, event) {
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

    // === 标题处理 ===
    
    handleTitleChange(title) {
      this.$emit('title-change', title)
    },

    async handleTitleSave(title) {
      if (!this.documentId || !title.trim()) return

      try {
        await updateDocument(this.documentId, { title: title.trim() })
        console.log('标题保存成功:', title)
      } catch (error) {
        console.error('标题保存失败:', error)
      }
    },

    // === 自动保存 ===
    
    handleAutoSave(content) {
      if (!this.autoSave || !this.documentId || content === this.lastSavedContent || this.isSaving) {
        return
      }

      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = setTimeout(() => {
        this.performAutoSave(content)
      }, this.autoSaveDelay)
    },

    async performAutoSave(content) {
      if (this.isSaving || !this.documentId) return

      try {
        this.isSaving = true
        this.setSaveStatus('saving')
        
        const saveData = {
          content: {
            html: content,
            type: "html"
          }
        }

        await updateDocument(this.documentId, saveData)
        
        this.lastSavedContent = content
        this.setSaveStatus('saved')
        
        this.$emit('save-success', {
          documentId: this.documentId,
          content: content,
          timestamp: new Date().toISOString()
        })

        console.log('文档自动保存成功')
        
      } catch (error) {
        console.error('自动保存失败:', error)
        this.setSaveStatus('error')
        
        this.$emit('save-error', {
          documentId: this.documentId,
          error: error,
          content: content,
          timestamp: new Date().toISOString()
        })
        
      } finally {
        this.isSaving = false
      }
    },

    manualSave() {
      if (!this.editor) return
      const content = this.getCurrentValue()
      clearTimeout(this.autoSaveTimer)
      this.performAutoSave(content)
    },

    setLastSavedContent(content) {
      this.lastSavedContent = content || this.getCurrentValue()
    },

    setSaveStatus(status) {
      this.saveStatus = status
    },

    // === 用户输入监听 ===
    
    handleUserInput() {
      if (!this.enableUserInputAutoSave || !this.documentId) return

      this.isUserActive = true
      this.clearUserInputTimer()
      
      this.userInputTimer = setTimeout(() => {
        this.onUserInactive()
      }, this.userInactivityDelay)
    },

    onUserInactive() {
      this.isUserActive = false
      
      if (this.documentId && !this.isSaving) {
        const currentContent = this.getCurrentValue()
        
        if (currentContent !== this.lastSavedContent) {
          console.log('检测到内容变化，开始自动保存')
          this.performAutoSave(currentContent)
        }
      }
    },

    clearUserInputTimer() {
      if (this.userInputTimer) {
        clearTimeout(this.userInputTimer)
        this.userInputTimer = null
      }
    },

    // === 公共API ===
    
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
      return this.getCurrentValue()
    },

    getText() {
      return this.editor ? this.editor.getText() : ''
    },

    getJSON() {
      return this.editor ? this.editor.getJSON() : null
    },

    clearContent() {
      if (this.editor) {
        this.editor.commands.clearContent()
        this.editor.commands.focus()
      }
    },

    // 获取子组件引用
    getToolbarRef() {
      return this.$refs.toolbarRef
    },

    getTitleRef() {
      return this.$refs.titleRef
    },

    getContentRef() {
      return this.$refs.contentRef
    },

    getStatusRef() {
      return this.$refs.statusRef
    },

    // === 清理资源 ===
    
    cleanup() {
      if (this.editor) {
        this.editor.destroy()
      }
      
      clearTimeout(this.autoSaveTimer)
      this.clearUserInputTimer()
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

/* 响应式设计 */
@media (max-width: 768px) {
  .tiptap-editor-container {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
</style>