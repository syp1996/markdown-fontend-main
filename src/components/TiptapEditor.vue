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
      <button 
        @click="editor && editor.chain().focus().toggleUnderline().run()"
        :class="{ active: editor && editor.isActive('underline') }"
        class="format-btn"
        title="下划线"
      >
        <u>U</u>
      </button>
      <!-- 高亮背景 -->
      <button 
        @click="editor && editor.chain().focus().toggleHighlight().run()"
        :class="{ active: editor && editor.isActive('highlight') }"
        class="format-btn"
        title="背景高亮"
      >
        🖍️ 高亮
      </button>
      <!-- 上标下标 -->
      <button 
        @click="editor && editor.chain().focus().toggleSuperscript().run()"
        :class="{ active: editor && editor.isActive('superscript') }"
        class="format-btn"
        title="上标"
      >
        X²
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleSubscript().run()"
        :class="{ active: editor && editor.isActive('subscript') }"
        class="format-btn"
        title="下标"
      >
        X₂
      </button>
      <div class="separator"></div>
      <!-- 文本颜色 -->
      <div class="color-picker-wrapper">
        <label class="format-btn color-btn" title="文字颜色">
          🎨
          <input 
            type="color" 
            @change="setTextColor"
            class="color-input"
            value="#000000"
          />
        </label>
      </div>
      <div class="separator"></div>
      <!-- 链接功能 -->
      <button 
        @click="setLink"
        :class="{ active: editor && editor.isActive('link') }"
        class="format-btn"
        title="插入链接"
      >
        🔗 链接
      </button>
      <button 
        @click="unsetLink"
        :disabled="!editor || !editor.isActive('link')"
        class="format-btn"
        title="移除链接"
      >
        🚫 取消链接
      </button>
      <div class="separator"></div>
      <!-- 图片功能 -->
      <button 
        @click="addImage"
        class="format-btn"
        title="插入图片"
      >
        🖼️ 图片
      </button>
      <label class="format-btn" title="上传图片">
        📁 上传
        <input 
          type="file" 
          @change="uploadImage"
          accept="image/*"
          class="file-input"
          style="display: none;"
        />
      </label>
      <div class="separator"></div>
      <!-- 表格功能 -->
      <button 
        @click="insertTable"
        class="format-btn"
        title="插入表格"
      >
        📊 表格
      </button>
      <button 
        @click="addColumnBefore"
        :disabled="!editor || !editor.isActive('table')"
        class="format-btn"
        title="插入列"
      >
        ➕列
      </button>
      <button 
        @click="addRowBefore"
        :disabled="!editor || !editor.isActive('table')"
        class="format-btn"
        title="插入行"
      >
        ➕行
      </button>
      <button 
        @click="deleteTable"
        :disabled="!editor || !editor.isActive('table')"
        class="format-btn"
        title="删除表格"
      >
        🗑️表格
      </button>
      <div class="separator"></div>
      <!-- 文本对齐 -->
      <button 
        @click="editor && editor.chain().focus().setTextAlign('left').run()"
        :class="{ active: editor && editor.isActive({ textAlign: 'left' }) }"
        class="format-btn"
        title="左对齐"
      >
        ⬅️
      </button>
      <button 
        @click="editor && editor.chain().focus().setTextAlign('center').run()"
        :class="{ active: editor && editor.isActive({ textAlign: 'center' }) }"
        class="format-btn"
        title="居中对齐"
      >
        ↔️
      </button>
      <button 
        @click="editor && editor.chain().focus().setTextAlign('right').run()"
        :class="{ active: editor && editor.isActive({ textAlign: 'right' }) }"
        class="format-btn"
        title="右对齐"
      >
        ➡️
      </button>
      <button 
        @click="editor && editor.chain().focus().setTextAlign('justify').run()"
        :class="{ active: editor && editor.isActive({ textAlign: 'justify' }) }"
        class="format-btn"
        title="两端对齐"
      >
        ↕️
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
      <!-- 任务列表 -->
      <button 
        @click="editor && editor.chain().focus().toggleTaskList().run()"
        :class="{ active: editor && editor.isActive('taskList') }"
        class="format-btn"
        title="任务列表"
      >
        ☑️ 任务
      </button>
      <button 
        @click="editor && editor.chain().focus().toggleBlockquote().run()"
        :class="{ active: editor && editor.isActive('blockquote') }"
        class="format-btn"
        title="引用"
      >
        " 引用
      </button>
      <!-- 代码块 -->
      <button 
        @click="editor && editor.chain().focus().toggleCodeBlock().run()"
        :class="{ active: editor && editor.isActive('codeBlock') }"
        class="format-btn"
        title="代码块"
      >
        💻 代码块
      </button>
      <!-- 水平分割线 -->
      <button 
        @click="editor && editor.chain().focus().setHorizontalRule().run()"
        class="format-btn"
        title="水平分割线"
      >
        ➖ 分割线
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
    <!-- 状态栏 -->
    <div class="status-bar" v-if="showStatusBar && editor">
      <div class="status-item">
        字符: {{ editor.storage.characterCount?.characters() || 0 }}
      </div>
      <div class="status-item">
        词数: {{ editor.storage.characterCount?.words() || 0 }}
      </div>
      <div class="status-item">
        段落: {{ countParagraphs }}
      </div>
    </div>

    <!-- 气泡菜单 -->
    <div
      v-if="editor && bubbleMenuEditor"
      ref="bubbleMenu"
      class="bubble-menu"
      v-show="bubbleMenuVisible"
    >
      <button 
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ active: editor.isActive('bold') }"
        class="bubble-btn"
      >
        <strong>B</strong>
      </button>
      <button 
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ active: editor.isActive('italic') }"
        class="bubble-btn"
      >
        <em>I</em>
      </button>
      <button 
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ active: editor.isActive('underline') }"
        class="bubble-btn"
      >
        <u>U</u>
      </button>
      <button 
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ active: editor.isActive('highlight') }"
        class="bubble-btn"
      >
        🖍️
      </button>
    </div>

    <!-- 浮动菜单 -->
    <div
      v-if="editor && floatingMenuEditor"
      ref="floatingMenu"
      class="floating-menu"
      v-show="floatingMenuVisible"
    >
      <button 
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        class="floating-btn"
      >
        H1
      </button>
      <button 
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        class="floating-btn"
      >
        H2
      </button>
      <button 
        @click="editor.chain().focus().toggleBulletList().run()"
        class="floating-btn"
      >
        • 列表
      </button>
      <button 
        @click="editor.chain().focus().toggleCodeBlock().run()"
        class="floating-btn"
      >
        💻 代码
      </button>
    </div>
  </div>
</template>

<script>
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

// 基础文本格式
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'

// 表格
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

// 第二优先级扩展
import CharacterCount from '@tiptap/extension-character-count'
import CodeBlock from '@tiptap/extension-code-block'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'

// 第三优先级扩展
import Highlight from '@tiptap/extension-highlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Typography from '@tiptap/extension-typography'

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
    showStatusBar: {
      type: Boolean,
      default: true
    },
    enableBubbleMenu: {
      type: Boolean,
      default: true
    },
    enableFloatingMenu: {
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
      bubbleMenuEditor: null,
      floatingMenuEditor: null,
      bubbleMenuVisible: false,
      floatingMenuVisible: false,
    }
  },
  computed: {
    countParagraphs() {
      if (!this.editor) return 0
      const doc = this.editor.getJSON()
      return this.countNodesByType(doc, 'paragraph')
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
          StarterKit,
          Placeholder.configure({
            placeholder: this.placeholder,
            emptyEditorClass: 'is-editor-empty',
          }),
          // 基础文本样式
          TextStyle,
          Underline,
          Color.configure({
            types: ['textStyle'],
          }),
          // 链接和图片
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: 'tiptap-link',
            },
          }),
          Image,
          // 表格扩展
          Table,
          TableRow,
          TableHeader,
          TableCell,
          // 第二优先级扩展
          TaskList,
          TaskItem,
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          CodeBlock.configure({
            HTMLAttributes: {
              class: 'tiptap-code-block',
            },
          }),
          CharacterCount,
          // 第三优先级扩展
          Highlight.configure({
            HTMLAttributes: {
              class: 'tiptap-highlight',
            },
          }),
          Superscript,
          Subscript,
          HorizontalRule,
          Typography,
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
    },

    // 新增功能方法

    // 下划线
    toggleUnderline() {
      if (this.editor) {
        this.editor.chain().focus().toggleUnderline().run()
      }
    },

    // 文本颜色
    setTextColor(event) {
      const color = event.target.value
      if (this.editor) {
        this.editor.chain().focus().setColor(color).run()
      }
    },

    // 链接功能
    setLink() {
      const url = window.prompt('请输入链接地址:')
      if (url && this.editor) {
        this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    },

    unsetLink() {
      if (this.editor) {
        this.editor.chain().focus().unsetLink().run()
      }
    },

    // 图片功能
    addImage() {
      const url = window.prompt('请输入图片地址:')
      if (url && this.editor) {
        this.editor.chain().focus().setImage({ src: url }).run()
      }
    },

    uploadImage(event) {
      const file = event.target.files[0]
      if (file && this.editor) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.editor.chain().focus().setImage({ src: e.target.result }).run()
        }
        reader.readAsDataURL(file)
        // 清空input，允许重复选择同一文件
        event.target.value = ''
      }
    },

    // 表格功能
    insertTable() {
      if (this.editor) {
        this.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      }
    },

    addColumnBefore() {
      if (this.editor) {
        this.editor.chain().focus().addColumnBefore().run()
      }
    },

    addRowBefore() {
      if (this.editor) {
        this.editor.chain().focus().addRowBefore().run()
      }
    },

    deleteTable() {
      if (this.editor) {
        this.editor.chain().focus().deleteTable().run()
      }
    },

    // 新增功能方法

    // 工具函数
    countNodesByType(node, type) {
      let count = 0
      if (node.type === type) {
        count++
      }
      if (node.content) {
        node.content.forEach(child => {
          count += this.countNodesByType(child, type)
        })
      }
      return count
    },

    // 文本对齐
    setTextAlign(alignment) {
      if (this.editor) {
        this.editor.chain().focus().setTextAlign(alignment).run()
      }
    },

    // 高亮功能
    toggleHighlight() {
      if (this.editor) {
        this.editor.chain().focus().toggleHighlight().run()
      }
    },

    // 上标下标
    toggleSuperscript() {
      if (this.editor) {
        this.editor.chain().focus().toggleSuperscript().run()
      }
    },

    toggleSubscript() {
      if (this.editor) {
        this.editor.chain().focus().toggleSubscript().run()
      }
    },

    // 任务列表
    toggleTaskList() {
      if (this.editor) {
        this.editor.chain().focus().toggleTaskList().run()
      }
    },

    // 代码块
    toggleCodeBlock() {
      if (this.editor) {
        this.editor.chain().focus().toggleCodeBlock().run()
      }
    },

    // 水平分割线
    setHorizontalRule() {
      if (this.editor) {
        this.editor.chain().focus().setHorizontalRule().run()
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

/* 颜色选择器样式 */
.color-picker-wrapper {
  position: relative;
}

.color-btn {
  position: relative;
  overflow: hidden;
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* 文件上传隐藏样式 */
.file-input {
  display: none;
}

/* 状态栏样式 */
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

/* 气泡菜单样式 */
.bubble-menu {
  display: flex;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  gap: 2px;
  position: absolute;
  z-index: 1000;
}

.bubble-btn {
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  color: #333;
}

.bubble-btn:hover {
  background: #f0f0f0;
}

.bubble-btn.active {
  background: #007acc;
  color: white;
}

/* 浮动菜单样式 */
.floating-menu {
  display: flex;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  gap: 2px;
  position: absolute;
  z-index: 1000;
}

.floating-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  color: #333;
  white-space: nowrap;
}

.floating-btn:hover {
  background: #f0f0f0;
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

/* 下划线样式 */
:deep(.tiptap-editor-instance u) {
  text-decoration: underline;
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

/* 图片样式 */
:deep(.tiptap-image) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
  display: block;
}

/* 表格样式 */
:deep(.tiptap-editor-instance table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 16px 0;
  overflow: hidden;
  border: 1px solid #ddd;
}

:deep(.tiptap-editor-instance table td),
:deep(.tiptap-editor-instance table th) {
  min-width: 1em;
  border: 1px solid #ddd;
  padding: 8px 12px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
  background-color: white;
}

:deep(.tiptap-editor-instance table th) {
  font-weight: bold;
  background-color: #f5f5f5;
  text-align: left;
}

:deep(.tiptap-editor-instance table .selectedCell:after) {
  z-index: 2;
  position: absolute;
  content: "";
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}

:deep(.tiptap-editor-instance table .column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background-color: #adf;
  pointer-events: none;
}

:deep(.tiptap-editor-instance table p) {
  margin: 0;
}

/* 新增样式 */

/* 高亮背景样式 */
:deep(.tiptap-highlight) {
  background-color: #ffeb3b;
  padding: 2px 4px;
  border-radius: 2px;
}

/* 上标下标样式 */
:deep(.tiptap-editor-instance sup) {
  vertical-align: super;
  font-size: 0.8em;
}

:deep(.tiptap-editor-instance sub) {
  vertical-align: sub;
  font-size: 0.8em;
}

/* 任务列表样式 */
:deep(.tiptap-editor-instance ul[data-type="taskList"]) {
  list-style: none;
  padding-left: 0;
}

:deep(.tiptap-editor-instance li[data-type="taskItem"]) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

:deep(.tiptap-editor-instance li[data-type="taskItem"] > label) {
  flex-shrink: 0;
  margin-top: 2px;
}

:deep(.tiptap-editor-instance li[data-type="taskItem"] > div) {
  flex: 1;
}

/* 代码块样式 */
:deep(.tiptap-code-block) {
  background: #2d3748;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  overflow-x: auto;
  line-height: 1.5;
  font-size: 14px;
}

:deep(.tiptap-code-block pre) {
  margin: 0;
  padding: 0;
  background: none;
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}

/* 水平分割线样式 */
:deep(.tiptap-editor-instance hr) {
  border: none;
  border-top: 2px solid #ddd;
  margin: 24px 0;
}

/* 文本对齐样式 */
:deep(.tiptap-editor-instance [style*="text-align: left"]) {
  text-align: left;
}

:deep(.tiptap-editor-instance [style*="text-align: center"]) {
  text-align: center;
}

:deep(.tiptap-editor-instance [style*="text-align: right"]) {
  text-align: right;
}

:deep(.tiptap-editor-instance [style*="text-align: justify"]) {
  text-align: justify;
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
