<template>
  <div class="toolbar" v-if="show && editor">
    <template v-for="group in toolbarGroups" :key="group.name">
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
      <div class="separator" v-if="group !== toolbarGroups[toolbarGroups.length - 1]"></div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'EditorToolbar',
  props: {
    editor: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      default: true
    },
    groups: {
      type: Array,
      default: () => ['format', 'heading', 'list', 'media', 'table', 'utility']
    }
  },
  computed: {
    toolbarGroups() {
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
      ].filter(group => 
        this.groups.includes(group.name) && group.buttons.length > 0
      )
    }
  },
  methods: {
    getFormatButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      if (this.editor.can().toggleBold()) {
        buttons.push({
          name: 'bold',
          label: 'B',
          title: '粗体 (Ctrl+B)',
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive('bold')
        })
      }
      
      if (this.editor.can().toggleItalic()) {
        buttons.push({
          name: 'italic',
          label: 'I',
          title: '斜体 (Ctrl+I)',
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
      
      if (this.editor.can().toggleStrike()) {
        buttons.push({
          name: 'strike',
          label: 'S',
          title: '删除线',
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive('strike')
        })
      }
      
      if (this.editor.can().toggleCode()) {
        buttons.push({
          name: 'code',
          label: '</&gt;',
          title: '行内代码',
          action: () => this.editor.chain().focus().toggleCode().run(),
          isActive: () => this.editor.isActive('code')
        })
      }
      
      if (this.editor.can().toggleHighlight()) {
        buttons.push({
          name: 'highlight',
          label: '🖍️',
          title: '高亮背景',
          action: () => this.editor.chain().focus().toggleHighlight().run(),
          isActive: () => this.editor.isActive('highlight')
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
      
      if (this.editor.can().toggleTaskList()) {
        buttons.push({
          name: 'task-list',
          label: '☑️ 任务',
          title: '任务列表',
          action: () => this.editor.chain().focus().toggleTaskList().run(),
          isActive: () => this.editor.isActive('taskList')
        })
      }
      
      if (this.editor.can().toggleBlockquote()) {
        buttons.push({
          name: 'blockquote',
          label: '" 引用',
          title: '引用块',
          action: () => this.editor.chain().focus().toggleBlockquote().run(),
          isActive: () => this.editor.isActive('blockquote')
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
          label: '🔗 链接',
          title: '插入链接',
          action: this.setLink,
          isActive: () => this.editor.isActive('link')
        })
      }
      
      if (this.editor.isActive('link')) {
        buttons.push({
          name: 'unlink',
          label: '🚫 取消',
          title: '移除链接',
          action: () => this.editor.chain().focus().unsetLink().run()
        })
      }
      
      buttons.push({
        name: 'image',
        label: '🖼️ 图片',
        title: '插入图片',
        action: this.addImage
      })
      
      return buttons
    },

    getTableButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      if (this.editor.can().insertTable()) {
        buttons.push({
          name: 'table',
          label: '📊 表格',
          title: '插入表格',
          action: () => this.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        })
      }
      
      if (this.editor.isActive('table')) {
        buttons.push(
          {
            name: 'add-column',
            label: '➕列',
            title: '添加列',
            action: () => this.editor.chain().focus().addColumnBefore().run()
          },
          {
            name: 'add-row',
            label: '➕行',
            title: '添加行',
            action: () => this.editor.chain().focus().addRowBefore().run()
          },
          {
            name: 'delete-table',
            label: '🗑️表格',
            title: '删除表格',
            action: () => this.editor.chain().focus().deleteTable().run()
          }
        )
      }
      
      return buttons
    },

    getUtilityButtons() {
      if (!this.editor) return []
      
      const buttons = []
      
      if (this.editor.can().toggleCodeBlock()) {
        buttons.push({
          name: 'code-block',
          label: '💻 代码块',
          title: '代码块',
          action: () => this.editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => this.editor.isActive('codeBlock')
        })
      }
      
      if (this.editor.can().setHorizontalRule()) {
        buttons.push({
          name: 'hr',
          label: '➖ 分割线',
          title: '水平分割线',
          action: () => this.editor.chain().focus().setHorizontalRule().run()
        })
      }
      
      if (this.editor.can().undo()) {
        buttons.push({
          name: 'undo',
          label: '↶ 撤销',
          title: '撤销 (Ctrl+Z)',
          action: () => this.editor.chain().focus().undo().run(),
          isDisabled: () => !this.editor.can().undo()
        })
      }
      
      if (this.editor.can().redo()) {
        buttons.push({
          name: 'redo',
          label: '↷ 重做',
          title: '重做 (Ctrl+Y)',
          action: () => this.editor.chain().focus().redo().run(),
          isDisabled: () => !this.editor.can().redo()
        })
      }
      
      buttons.push({
        name: 'clear',
        label: '🗑️ 清空',
        title: '清空内容',
        action: this.clearContent
      })
      
      return buttons
    },

    // 媒体相关操作
    setLink() {
      const url = window.prompt('请输入链接地址:')
      if (url && this.editor) {
        this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    },

    addImage() {
      const url = window.prompt('请输入图片地址:')
      if (url && this.editor) {
        this.editor.chain().focus().setImage({ src: url }).run()
      }
    },

    clearContent() {
      if (this.editor && confirm('确定要清空所有内容吗？')) {
        this.editor.commands.clearContent()
        this.editor.commands.focus()
      }
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  gap: 4px;
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
}
</style>