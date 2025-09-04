<template>
  <div class="status-bar" v-if="show && editor">
    <div class="status-left">
      <slot name="left"></slot>
    </div>
    
    <div class="status-center">
      <slot name="center"></slot>
    </div>
    
    <div class="status-right">
      <div v-if="showCharacterCount" class="status-item">
        字符: {{ characterCount }}
      </div>
      <div v-if="showWordCount" class="status-item">
        词数: {{ wordCount }}
      </div>
      <div v-if="showParagraphCount" class="status-item">
        段落: {{ paragraphCount }}
      </div>
      <div v-if="showSaveStatus" class="status-item save-status" :class="saveStatusClass">
        {{ saveStatusText }}
      </div>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorStatusBar',
  props: {
    editor: {
      type: Object,
      default: null
    },
    show: {
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
    showSaveStatus: {
      type: Boolean,
      default: false
    },
    saveStatus: {
      type: String,
      default: 'saved', // 'saving', 'saved', 'error', 'unsaved'
      validator: value => ['saving', 'saved', 'error', 'unsaved'].includes(value)
    }
  },
  data() {
    return {
      characterCount: 0,
      wordCount: 0,
      paragraphCount: 0
    }
  },
  computed: {
    saveStatusText() {
      switch (this.saveStatus) {
        case 'saving':
          return '保存中...'
        case 'saved':
          return '已保存'
        case 'error':
          return '保存失败'
        case 'unsaved':
          return '未保存'
        default:
          return ''
      }
    },
    
    saveStatusClass() {
      return {
        'save-saving': this.saveStatus === 'saving',
        'save-saved': this.saveStatus === 'saved',
        'save-error': this.saveStatus === 'error',
        'save-unsaved': this.saveStatus === 'unsaved'
      }
    }
  },
  watch: {
    editor: {
      handler(newEditor, oldEditor) {
        if (oldEditor) {
          this.removeEditorListeners(oldEditor)
        }
        
        if (newEditor) {
          this.addEditorListeners(newEditor)
          this.updateCounts()
        }
      },
      immediate: true
    }
  },
  beforeUnmount() {
    if (this.editor) {
      this.removeEditorListeners(this.editor)
    }
  },
  methods: {
    addEditorListeners(editor) {
      editor.on('transaction', this.updateCounts)
      editor.on('update', this.updateCounts)
    },
    
    removeEditorListeners(editor) {
      editor.off('transaction', this.updateCounts)
      editor.off('update', this.updateCounts)
    },
    
    updateCounts() {
      if (!this.editor) return
      
      try {
        // 字符统计
        const characterCountExtension = this.editor.extensionManager.extensions.find(
          ext => ext.name === 'characterCount'
        )
        
        if (characterCountExtension && this.editor.storage.characterCount) {
          this.characterCount = this.editor.storage.characterCount.characters() || 0
          this.wordCount = this.editor.storage.characterCount.words() || 0
        } else {
          // 回退计算方法
          const text = this.editor.getText()
          this.characterCount = text.length
          this.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
        }
        
        // 段落统计
        const doc = this.editor.getJSON()
        this.paragraphCount = this.countParagraphs(doc)
        
      } catch (error) {
        console.warn('更新统计计数失败:', error)
      }
    },
    
    countParagraphs(node) {
      let count = 0
      if (node.type === 'paragraph') {
        count++
      }
      if (node.content) {
        node.content.forEach(child => {
          count += this.countParagraphs(child)
        })
      }
      return count
    },
    
    // 手动更新统计
    refresh() {
      this.updateCounts()
    },
    
    // 获取统计数据
    getStats() {
      return {
        characterCount: this.characterCount,
        wordCount: this.wordCount,
        paragraphCount: this.paragraphCount
      }
    }
  }
}
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
  min-height: 32px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-center {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  font-family: monospace;
  white-space: nowrap;
}

.save-status {
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.save-saving {
  color: #f59e0b;
  background: #fef3c7;
}

.save-saved {
  color: #10b981;
  background: #d1fae5;
}

.save-error {
  color: #ef4444;
  background: #fee2e2;
}

.save-unsaved {
  color: #6b7280;
  background: #f3f4f6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-bar {
    padding: 6px 8px;
    font-size: 11px;
  }
  
  .status-right {
    gap: 8px;
  }
  
  .status-item {
    font-size: 10px;
  }
  
  .save-status {
    font-size: 10px;
    padding: 1px 4px;
  }
}
</style>