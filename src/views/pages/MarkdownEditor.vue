<template>
  <div class="markdown-editor-page">
    <div class="page-header">
      <h2>📝 Markdown编辑器</h2>
      <p>支持Markdown语法的文本编辑器</p>
    </div>
    
    <div class="editor-container">
      <div class="toolbar">
        <button class="tool-btn" @click="addBold">粗体</button>
        <button class="tool-btn" @click="addItalic">斜体</button>
        <button class="tool-btn" @click="addCode">代码</button>
        <button class="tool-btn" @click="addLink">链接</button>
        <button class="tool-btn" @click="addImage">图片</button>
        <button class="tool-btn" @click="addList">列表</button>
        <button class="tool-btn primary" @click="saveContent">保存</button>
      </div>
      
      <div class="editor-content">
        <div class="input-area">
          <textarea 
            v-model="markdownContent" 
            placeholder="在这里输入Markdown内容..."
            @input="updatePreview"
          ></textarea>
        </div>
        <div class="preview-area">
          <div class="preview-header">
            <h4>预览效果</h4>
          </div>
          <div class="preview-content" v-html="markdownPreview"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarkdownEditor',
  data() {
    return {
      markdownContent: '',
      markdownPreview: ''
    }
  },
  methods: {
    addBold() {
      this.insertText('**', '**')
    },
    addItalic() {
      this.insertText('*', '*')
    },
    addCode() {
      this.insertText('`', '`')
    },
    addLink() {
      this.insertText('[', '](url)')
    },
    addImage() {
      this.insertText('![', '](image-url)')
    },
    addList() {
      this.insertText('- ', '')
    },
    insertText(before, after) {
      const textarea = document.querySelector('textarea')
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = this.markdownContent.substring(start, end)
      
      this.markdownContent = 
        this.markdownContent.substring(0, start) +
        before + selectedText + after +
        this.markdownContent.substring(end)
      
      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
      })
    },
    updatePreview() {
      // 简单的Markdown转HTML预览
      this.markdownPreview = this.markdownContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/\n/g, '<br>')
    },
    saveContent() {
      // 这里可以添加保存逻辑
      this.$message.success('内容已保存')
    }
  }
}
</script>

<style scoped>
.markdown-editor-page {
  padding: 20px;
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8eaec;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #17233d;
}

.page-header p {
  margin: 0;
  color: #808695;
}

.editor-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toolbar {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.tool-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.tool-btn.primary:hover {
  background: #66b1ff;
}

.editor-content {
  display: flex;
  height: 500px;
}

.input-area, .preview-area {
  flex: 1;
  border-right: 1px solid #e8eaec;
}

.input-area:last-child {
  border-right: none;
}

.input-area textarea {
  width: 100%;
  height: 100%;
  border: none;
  padding: 20px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.preview-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaec;
}

.preview-header h4 {
  margin: 0;
  color: #17233d;
}

.preview-content {
  padding: 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
  line-height: 1.6;
}

.preview-content :deep(code) {
  background: #f1f2f3;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.preview-content :deep(strong) {
  font-weight: bold;
}

.preview-content :deep(em) {
  font-style: italic;
}

.preview-content :deep(li) {
  margin: 5px 0;
}
</style>
