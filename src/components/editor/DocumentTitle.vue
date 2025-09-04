<template>
  <div class="document-title-container" v-if="show">
    <input 
      v-model="internalTitle"
      class="document-title-input"
      :placeholder="placeholder"
      @input="handleTitleInput"
      @blur="handleTitleBlur"
      @keydown.enter="handleEnterKey"
    />
  </div>
</template>

<script>
export default {
  name: 'DocumentTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '文档标题'
    },
    show: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Boolean,
      default: false
    },
    autoSaveDelay: {
      type: Number,
      default: 1000
    },
    syncDelay: {
      type: Number,
      default: 500
    }
  },
  emits: ['update:title', 'title-change', 'title-save'],
  data() {
    return {
      internalTitle: '',
      titleSaveTimer: null,
      titleSyncTimer: null
    }
  },
  watch: {
    title: {
      handler(newValue) {
        if (newValue !== this.internalTitle) {
          this.internalTitle = newValue
        }
      },
      immediate: true
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    handleTitleInput() {
      // 发射更新事件
      this.$emit('update:title', this.internalTitle)
      
      // 清除之前的同步定时器
      if (this.titleSyncTimer) {
        clearTimeout(this.titleSyncTimer)
      }
      
      // 延迟发送标题变化事件，避免频繁触发
      this.titleSyncTimer = setTimeout(() => {
        this.$emit('title-change', this.internalTitle)
      }, this.syncDelay)
      
      // 如果启用了自动保存，延迟保存标题
      if (this.autoSave) {
        this.handleTitleAutoSave()
      }
    },

    handleTitleBlur() {
      // 清除延迟定时器，立即同步标题
      if (this.titleSyncTimer) {
        clearTimeout(this.titleSyncTimer)
        this.titleSyncTimer = null
      }
      
      // 失焦时立即发送标题变化事件
      this.$emit('title-change', this.internalTitle)
      
      // 如果启用了自动保存，立即保存标题
      if (this.autoSave) {
        this.saveTitle()
      }
    },

    handleEnterKey(event) {
      // 回车键时失去焦点
      event.target.blur()
    },

    // 处理标题自动保存
    handleTitleAutoSave() {
      // 清除之前的标题保存定时器
      if (this.titleSaveTimer) {
        clearTimeout(this.titleSaveTimer)
      }
      
      // 设置新的定时器
      this.titleSaveTimer = setTimeout(() => {
        this.saveTitle()
      }, this.autoSaveDelay)
    },

    // 保存标题
    saveTitle() {
      if (!this.internalTitle.trim()) return
      
      this.$emit('title-save', this.internalTitle.trim())
    },

    // 手动保存标题
    manualSave() {
      this.saveTitle()
    },

    // 设置标题
    setTitle(title) {
      this.internalTitle = title
      this.$emit('update:title', title)
      this.$emit('title-change', title)
    },

    // 获取标题
    getTitle() {
      return this.internalTitle
    },

    // 聚焦输入框
    focus() {
      this.$nextTick(() => {
        const input = this.$el?.querySelector('.document-title-input')
        if (input) {
          input.focus()
        }
      })
    },

    // 清理资源
    cleanup() {
      if (this.titleSaveTimer) {
        clearTimeout(this.titleSaveTimer)
        this.titleSaveTimer = null
      }
      
      if (this.titleSyncTimer) {
        clearTimeout(this.titleSyncTimer)
        this.titleSyncTimer = null
      }
    }
  }
}
</script>

<style scoped>
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
  transition: box-shadow 0.2s ease;
}

.document-title-input::placeholder {
  color: #a8a8a8;
  font-weight: 700;
  opacity: 0.6;
}

.document-title-input:focus {
  box-shadow: none;
}

/* 当标题为空时的特殊样式 */
.document-title-input:placeholder-shown {
  color: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .document-title-container {
    padding: 12px 10px;
  }
  
  .document-title-input {
    font-size: 28px;
    min-height: 40px;
  }
}
</style>