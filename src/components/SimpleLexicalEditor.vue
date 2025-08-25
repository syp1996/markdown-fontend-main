<template>
  <div class="simple-lexical-editor">
    <div class="toolbar" v-if="showToolbar">
      <button 
        @click="execCommand('bold')"
        :class="{ active: formatStates.bold }"
        class="format-btn"
        title="加粗"
      >
        <strong>B</strong>
      </button>
      <button 
        @click="execCommand('italic')"
        :class="{ active: formatStates.italic }"
        class="format-btn"
        title="斜体"
      >
        <em>I</em>
      </button>
      <button 
        @click="execCommand('underline')"
        :class="{ active: formatStates.underline }"
        class="format-btn"
        title="下划线"
      >
        <u>U</u>
      </button>
      <div class="separator"></div>
      <button 
        @click="execCommand('insertUnorderedList')"
        class="format-btn"
        title="无序列表"
      >
        • 列表
      </button>
      <button 
        @click="execCommand('insertOrderedList')"
        class="format-btn"
        title="有序列表"
      >
        1. 列表
      </button>
      <div class="separator"></div>
      <button 
        @click="undo"
        class="format-btn"
        title="撤销"
      >
        ↶ 撤销
      </button>
      <button 
        @click="redo"
        class="format-btn"
        title="重做"
      >
        ↷ 重做
      </button>
      <button 
        @click="clearContent"
        class="format-btn"
        title="清空"
      >
        🗑️ 清空
      </button>
    </div>
    <div 
      ref="editorRef"
      class="editor-content"
      :style="{ height: height }"
      contenteditable="true"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @paste="handlePaste"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'SimpleLexicalEditor',
  props: {
    modelValue: {
      type: String,
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
    format: {
      type: String,
      default: 'html',
      validator: value => ['html', 'text'].includes(value)
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  data() {
    return {
      formatStates: {
        bold: false,
        italic: false,
        underline: false
      },
      isInitialized: false
    };
  },
  mounted() {
    this.initEditor();
  },
  watch: {
    modelValue(newValue) {
      if (this.isInitialized && newValue !== this.getCurrentValue()) {
        this.setContent(newValue);
      }
    }
  },
  methods: {
    initEditor() {
      // 设置初始内容
      if (this.modelValue) {
        this.setContent(this.modelValue);
      }
      
      // 设置占位符样式
      this.updatePlaceholder();
      
      this.isInitialized = true;
    },

    getCurrentValue() {
      const editor = this.$refs.editorRef;
      if (!editor) return '';
      
      if (this.format === 'text') {
        return editor.textContent || '';
      } else {
        return editor.innerHTML || '';
      }
    },

    setContent(content) {
      const editor = this.$refs.editorRef;
      if (!editor) return;
      
      if (this.format === 'text') {
        editor.textContent = content;
      } else {
        editor.innerHTML = content;
      }
      
      this.updatePlaceholder();
    },

    handleInput() {
      const content = this.getCurrentValue();
      this.$emit('update:modelValue', content);
      this.$emit('change', content);
      this.updateFormatStates();
      this.updatePlaceholder();
    },

    handleFocus() {
      this.$emit('focus');
      this.updateFormatStates();
    },

    handleBlur() {
      this.$emit('blur');
    },

    handleKeydown(event) {
      // 处理快捷键
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'b':
            event.preventDefault();
            this.execCommand('bold');
            break;
          case 'i':
            event.preventDefault();
            this.execCommand('italic');
            break;
          case 'u':
            event.preventDefault();
            this.execCommand('underline');
            break;
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              this.redo();
            } else {
              event.preventDefault();
              this.undo();
            }
            break;
        }
      }
      
      // 处理 Enter 键
      if (event.key === 'Enter' && !event.shiftKey) {
        // 让浏览器自然处理换行
      }
    },

    handlePaste(event) {
      // 简单的粘贴处理
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    },

    execCommand(command, value = null) {
      try {
        document.execCommand(command, false, value);
        this.updateFormatStates();
        this.handleInput();
      } catch (error) {
        console.warn('命令执行失败:', command, error);
      }
    },

    updateFormatStates() {
      try {
        this.formatStates.bold = document.queryCommandState('bold');
        this.formatStates.italic = document.queryCommandState('italic');
        this.formatStates.underline = document.queryCommandState('underline');
      } catch (error) {
        // 忽略查询状态错误
      }
    },

    updatePlaceholder() {
      const editor = this.$refs.editorRef;
      if (!editor) return;
      
      const isEmpty = !editor.textContent || editor.textContent.trim() === '';
      
      if (isEmpty) {
        editor.classList.add('empty');
      } else {
        editor.classList.remove('empty');
      }
    },

    undo() {
      this.execCommand('undo');
    },

    redo() {
      this.execCommand('redo');
    },

    clearContent() {
      const editor = this.$refs.editorRef;
      if (editor) {
        editor.innerHTML = '';
        this.handleInput();
      }
    },

    focus() {
      const editor = this.$refs.editorRef;
      if (editor) {
        editor.focus();
      }
    },

    blur() {
      const editor = this.$refs.editorRef;
      if (editor) {
        editor.blur();
      }
    }
  }
};
</script>

<style scoped>
.simple-lexical-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  gap: 4px;
  flex-wrap: wrap;
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
}

.format-btn:hover {
  background: #e9e9e9;
}

.format-btn.active {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.format-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.separator {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 8px;
}

.editor-content {
  padding: 12px;
  min-height: 100px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
  overflow-y: auto;
  background: white;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.editor-content:focus {
  box-shadow: inset 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.editor-content.empty::before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
  position: absolute;
}

.editor-content.empty:focus::before {
  opacity: 0.6;
}

/* 基础富文本样式 */
.editor-content strong,
.editor-content b {
  font-weight: bold;
}

.editor-content em,
.editor-content i {
  font-style: italic;
}

.editor-content u {
  text-decoration: underline;
}

.editor-content ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 8px 0;
}

.editor-content ol {
  list-style-type: decimal;
  padding-left: 20px;
  margin: 8px 0;
}

.editor-content li {
  margin: 2px 0;
}

.editor-content p {
  margin: 8px 0;
}

.editor-content p:first-child {
  margin-top: 0;
}

.editor-content p:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    padding: 6px 8px;
  }
  
  .format-btn {
    padding: 4px 8px;
    font-size: 11px;
    min-width: 32px;
  }
  
  .editor-content {
    padding: 10px;
    font-size: 13px;
  }
}
</style>
