<template>
  <div class="editor-content-container" :style="{ height: height }">
    <div v-if="isLoading" class="editor-loading">
      <div class="loading-spinner"></div>
      <span>{{ loadingText }}</span>
    </div>
    
    <div v-else-if="loadingError" class="editor-error">
      <div class="error-icon">⚠️</div>
      <div class="error-message">
        <h3>编辑器加载失败</h3>
        <p>{{ loadingError.message || '未知错误' }}</p>
        <button @click="$emit('retry')" class="retry-button">重试</button>
      </div>
    </div>
    
    <editor-content 
      v-else-if="editor"
      :editor="editor" 
      class="editor-content"
      :class="{ 'focus-mode': focusMode }"
    />
    
    <div v-else class="editor-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">📝</div>
        <p>编辑器准备中...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { EditorContent } from '@tiptap/vue-3'

export default {
  name: 'EditorContent',
  components: {
    EditorContent
  },
  props: {
    editor: {
      type: Object,
      default: null
    },
    height: {
      type: String,
      default: '400px'
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '编辑器加载中...'
    },
    loadingError: {
      type: Error,
      default: null
    },
    focusMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry'],
  mounted() {
    // 监听编辑器焦点状态
    this.setupFocusListeners()
  },
  methods: {
    setupFocusListeners() {
      if (!this.editor) return
      
      this.editor.on('focus', this.handleFocus)
      this.editor.on('blur', this.handleBlur)
    },
    
    handleFocus() {
      this.$emit('focus')
    },
    
    handleBlur() {
      this.$emit('blur')
    },
    
    // 滚动到顶部
    scrollToTop() {
      const container = this.$el.querySelector('.editor-content')
      if (container) {
        container.scrollTop = 0
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      const container = this.$el.querySelector('.editor-content')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    // 滚动到指定位置
    scrollTo(position) {
      const container = this.$el.querySelector('.editor-content')
      if (container) {
        container.scrollTop = position
      }
    }
  }
}
</script>

<style scoped>
.editor-content-container {
  flex: 1;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
}

/* 加载状态 */
.editor-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #6b7280;
  gap: 12px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.editor-error {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
}

.error-message h3 {
  color: #ef4444;
  margin: 0 0 8px 0;
  font-size: 18px;
}

.error-message p {
  color: #6b7280;
  margin: 0 0 16px 0;
  font-size: 14px;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

/* 占位符状态 */
.editor-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 编辑器内容 */
.editor-content {
  flex: 1;
  overflow-y: auto;
  background: white;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.editor-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 专注模式 */
.editor-content.focus-mode {
  background: #fafafa;
}

/* TipTap 编辑器实例样式 */
.editor-content :deep(.tiptap-editor-instance) {
  padding: 12px;
  height: 100%;
  min-height: 100px;
  outline: none;
  box-shadow: none;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 专注模式下的编辑器样式 */
.focus-mode :deep(.tiptap-editor-instance) {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 60px;
}

/* 基础内容样式 */
.editor-content :deep(.tiptap-editor-instance h1) {
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0 8px 0;
  line-height: 1.3;
}

.editor-content :deep(.tiptap-editor-instance h2) {
  font-size: 20px;
  font-weight: bold;
  margin: 14px 0 6px 0;
  line-height: 1.3;
}

.editor-content :deep(.tiptap-editor-instance h3) {
  font-size: 18px;
  font-weight: bold;
  margin: 12px 0 4px 0;
  line-height: 1.3;
}

.editor-content :deep(.tiptap-editor-instance p) {
  margin: 8px 0;
}

.editor-content :deep(.tiptap-editor-instance p:first-child) {
  margin-top: 0;
}

.editor-content :deep(.tiptap-editor-instance p:last-child) {
  margin-bottom: 0;
}

.editor-content :deep(.tiptap-editor-instance strong) {
  font-weight: bold;
}

.editor-content :deep(.tiptap-editor-instance em) {
  font-style: italic;
}

.editor-content :deep(.tiptap-editor-instance u) {
  text-decoration: underline;
}

.editor-content :deep(.tiptap-editor-instance s) {
  text-decoration: line-through;
}

.editor-content :deep(.tiptap-editor-instance code) {
  background-color: #f1f3f4;
  color: #c7254e;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

/* 列表样式 */
.editor-content :deep(.tiptap-editor-instance ul) {
  list-style-type: disc;
  padding-left: 20px;
  margin: 8px 0;
}

.editor-content :deep(.tiptap-editor-instance ol) {
  list-style-type: decimal;
  padding-left: 20px;
  margin: 8px 0;
}

.editor-content :deep(.tiptap-editor-instance li) {
  margin: 2px 0;
}

.editor-content :deep(.tiptap-editor-instance li p) {
  margin: 0;
}

/* 引用样式 */
.editor-content :deep(.tiptap-editor-instance blockquote) {
  border-left: 4px solid #007acc;
  margin: 16px 0;
  padding-left: 16px;
  color: #666;
  font-style: italic;
}

.editor-content :deep(.tiptap-editor-instance blockquote p) {
  margin: 4px 0;
}

/* 占位符样式 */
.editor-content :deep(.is-editor-empty:before) {
  content: attr(data-placeholder);
  float: left;
  color: #999;
  pointer-events: none;
  height: 0;
}

/* 链接样式 */
.editor-content :deep(.tiptap-link) {
  color: #007acc;
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.tiptap-link:hover) {
  color: #005fa3;
  text-decoration: none;
}

/* 高亮样式 */
.editor-content :deep(.tiptap-highlight) {
  background-color: #ffeb3b;
  padding: 2px 4px;
  border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-content :deep(.tiptap-editor-instance) {
    padding: 10px;
    font-size: 13px;
  }
  
  .focus-mode :deep(.tiptap-editor-instance) {
    padding: 20px 16px;
  }
  
  .editor-content :deep(.tiptap-editor-instance h1) {
    font-size: 20px;
  }
  
  .editor-content :deep(.tiptap-editor-instance h2) {
    font-size: 18px;
  }
  
  .editor-content :deep(.tiptap-editor-instance h3) {
    font-size: 16px;
  }
}
</style>