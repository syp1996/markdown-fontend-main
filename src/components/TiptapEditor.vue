<template>
  <div class="tiptap-editor-container">
    <div class="toolbar" v-if="showToolbar">
      <button 
        @click="editor && editor.chain().focus().toggleBold().run()"
        :class="{ active: editor && editor.isActive('bold') }"
        class="format-btn"
        title="加粗"
      >
        <strong>B</strong>
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleItalic().run()"
        :class="{ active: editor && editor.isActive('italic') }"
        class="format-btn"
        title="斜体"
      >
        <em>I</em>
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleStrike().run()"
        :class="{ active: editor && editor.isActive('strike') }"
        class="format-btn"
        title="删除线"
      >
        <s>S</s>
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleCode().run()"
        :class="{ active: editor && editor.isActive('code') }"
        class="format-btn"
        title="行内代码"
      >
        &lt;/&gt;
      </button>
      <div class="separator"></div>
      <button 
        @click="editor && editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ active: editor && editor.isActive('heading', { level: 1 }) }"
        class="format-btn"
        title="标题1"
      >
        H1
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ active: editor && editor.isActive('heading', { level: 2 }) }"
        class="format-btn"
        title="标题2"
      >
        H2
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ active: editor && editor.isActive('heading', { level: 3 }) }"
        class="format-btn"
        title="标题3"
      >
        H3
      </button>
      <div class="separator"></div>
      <button 
        @click="editor && editor.chain().focus().toggleBulletList().run()"
        :class="{ active: editor && editor.isActive('bulletList') }"
        class="format-btn"
        title="无序列表"
      >
        • 列表
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleOrderedList().run()"
        :class="{ active: editor && editor.isActive('orderedList') }"
        class="format-btn"
        title="有序列表"
      >
        1. 列表
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleBlockquote().run()"
        :class="{ active: editor && editor.isActive('blockquote') }"
        class="format-btn"
        title="引用"
      >
        " 引用
      </button>
      <div class="separator"></div>
      <button 
        @click="editor && editor.chain().focus().undo().run()"
        :disabled="!editor || !editor.can().undo()"
        class="format-btn"
        title="撤销"
      >
        ↶ 撤销
      </button>
      <button 
        @click="editor && editor.chain().focus().redo().run()"
        :disabled="!editor || !editor.can().redo()"
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
    <editor-content 
      :editor="editor" 
      class="editor-content"
      :style="{ height: height }"
    />
  </div>
</template>

<script>
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  name: 'TiptapEditor',
  components: {
    EditorContent,
  },
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
      validator: value => ['html', 'text', 'json'].includes(value)
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  data() {
    return {
      editor: null,
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  watch: {
    modelValue(newValue) {
      if (this.editor && newValue !== this.getCurrentValue()) {
        this.setContent(newValue)
      }
    }
  },
  methods: {
    initEditor() {
      this.editor = new Editor({
        content: this.modelValue,
        extensions: [
          StarterKit.configure({
            // 配置 StarterKit 扩展
            heading: {
              levels: [1, 2, 3, 4, 5, 6],
            },
            bulletList: {
              keepMarks: true,
              keepAttributes: false,
            },
            orderedList: {
              keepMarks: true,
              keepAttributes: false,
            },
          }),
          Placeholder.configure({
            placeholder: this.placeholder,
            emptyEditorClass: 'is-editor-empty',
          }),
        ],
        onUpdate: () => {
          const content = this.getCurrentValue()
          this.$emit('update:modelValue', content)
          this.$emit('change', content)
        },
        onFocus: () => {
          this.$emit('focus')
        },
        onBlur: () => {
          this.$emit('blur')
        },
        editorProps: {
          attributes: {
            class: 'tiptap-editor-instance',
          },
          handleKeyDown: (view, event) => {
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
                case 'u':
                  event.preventDefault()
                  this.editor.chain().focus().toggleStrike().run()
                  return true
                case 'z':
                  if (event.shiftKey) {
                    event.preventDefault()
                    this.editor.chain().focus().redo().run()
                  } else {
                    event.preventDefault()
                    this.editor.chain().focus().undo().run()
                  }
                  return true
              }
            }
            return false
          },
        },
      })
    },

    getCurrentValue() {
      if (!this.editor) return ''
      
      try {
        switch (this.format) {
          case 'text':
            return this.editor.getText()
          case 'json':
            return JSON.stringify(this.editor.getJSON())
          case 'html':
          default:
            return this.editor.getHTML()
        }
      } catch (error) {
        console.warn('获取内容失败:', error)
        return ''
      }
    },

    setContent(content) {
      if (!this.editor) return
      
      try {
        switch (this.format) {
          case 'json':
            this.editor.commands.setContent(JSON.parse(content || '{}'))
            break
          case 'text':
          case 'html':
          default:
            this.editor.commands.setContent(content || '')
            break
        }
      } catch (error) {
        console.warn('设置内容失败:', error)
        this.editor.commands.setContent('')
      }
    },

    clearContent() {
      if (this.editor) {
        this.editor.commands.clearContent()
        this.editor.commands.focus()
      }
    },

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

    // 工具栏方法
    toggleBold() {
      if (this.editor) {
        this.editor.chain().focus().toggleBold().run()
      }
    },

    toggleItalic() {
      if (this.editor) {
        this.editor.chain().focus().toggleItalic().run()
      }
    },

    toggleStrike() {
      if (this.editor) {
        this.editor.chain().focus().toggleStrike().run()
      }
    },

    toggleCode() {
      if (this.editor) {
        this.editor.chain().focus().toggleCode().run()
      }
    },

    toggleHeading(level) {
      if (this.editor) {
        this.editor.chain().focus().toggleHeading({ level }).run()
      }
    },

    toggleBulletList() {
      if (this.editor) {
        this.editor.chain().focus().toggleBulletList().run()
      }
    },

    toggleOrderedList() {
      if (this.editor) {
        this.editor.chain().focus().toggleOrderedList().run()
      }
    },

    toggleBlockquote() {
      if (this.editor) {
        this.editor.chain().focus().toggleBlockquote().run()
      }
    },

    undo() {
      if (this.editor) {
        this.editor.chain().focus().undo().run()
      }
    },

    redo() {
      if (this.editor) {
        this.editor.chain().focus().redo().run()
      }
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
  white-space: nowrap;
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
  overflow-y: auto;
  background: white;
}

/* Tiptap 编辑器样式 */
:deep(.tiptap-editor-instance) {
  padding: 12px;
  min-height: 100px;
  outline: none;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

:deep(.tiptap-editor-instance:focus) {
  box-shadow: inset 0 0 0 2px rgba(0, 122, 204, 0.2);
}

/* 占位符样式 */
:deep(.is-editor-empty:before) {
  content: attr(data-placeholder);
  float: left;
  color: #999;
  pointer-events: none;
  height: 0;
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

:deep(.tiptap-editor-instance h4) {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0 4px 0;
  line-height: 1.3;
}

:deep(.tiptap-editor-instance h5) {
  font-size: 14px;
  font-weight: bold;
  margin: 8px 0 2px 0;
  line-height: 1.3;
}

:deep(.tiptap-editor-instance h6) {
  font-size: 12px;
  font-weight: bold;
  margin: 6px 0 2px 0;
  line-height: 1.3;
}

:deep(.tiptap-editor-instance p) {
  margin: 8px 0;
}

:deep(.tiptap-editor-instance p:first-child) {
  margin-top: 0;
}

:deep(.tiptap-editor-instance p:last-child) {
  margin-bottom: 0;
}

:deep(.tiptap-editor-instance strong) {
  font-weight: bold;
}

:deep(.tiptap-editor-instance em) {
  font-style: italic;
}

:deep(.tiptap-editor-instance s) {
  text-decoration: line-through;
}

:deep(.tiptap-editor-instance code) {
  background-color: #f1f3f4;
  color: #c7254e;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
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

:deep(.tiptap-editor-instance li p) {
  margin: 0;
}

:deep(.tiptap-editor-instance blockquote) {
  border-left: 4px solid #007acc;
  margin: 16px 0;
  padding-left: 16px;
  color: #666;
  font-style: italic;
}

:deep(.tiptap-editor-instance blockquote p) {
  margin: 4px 0;
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
  
  :deep(.tiptap-editor-instance) {
    padding: 10px;
    font-size: 13px;
  }
  
  :deep(.tiptap-editor-instance h1) {
    font-size: 20px;
  }
  
  :deep(.tiptap-editor-instance h2) {
    font-size: 18px;
  }
  
  :deep(.tiptap-editor-instance h3) {
    font-size: 16px;
  }
}
</style>
