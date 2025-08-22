<template>
  <div class="rich-editor-page">
    <div class="page-header">
      <h2>✒️ 富文本编辑器</h2>
      <p>功能丰富的文本编辑器，支持多种格式</p>
    </div>
    
    <div class="editor-container">
      <div class="toolbar">
        <div class="tool-group">
          <button class="tool-btn" @click="execCommand('bold')" :class="{ active: isActive('bold') }">
            <strong>B</strong>
          </button>
          <button class="tool-btn" @click="execCommand('italic')" :class="{ active: isActive('italic') }">
            <em>I</em>
          </button>
          <button class="tool-btn" @click="execCommand('underline')" :class="{ active: isActive('underline') }">
            <u>U</u>
          </button>
        </div>
        
        <div class="tool-group">
          <button class="tool-btn" @click="execCommand('insertUnorderedList')">
            📋
          </button>
          <button class="tool-btn" @click="execCommand('insertOrderedList')">
            1️⃣
          </button>
        </div>
        
        <div class="tool-group">
          <button class="tool-btn" @click="execCommand('justifyLeft')">
            ⬅️
          </button>
          <button class="tool-btn" @click="execCommand('justifyCenter')">
            ↔️
          </button>
          <button class="tool-btn" @click="execCommand('justifyRight')">
            ➡️
          </button>
        </div>
        
        <div class="tool-group">
          <select v-model="fontSize" @change="changeFontSize">
            <option value="1">小</option>
            <option value="3" selected>中</option>
            <option value="5">大</option>
            <option value="7">特大</option>
          </select>
          
          <input 
            type="color" 
            v-model="textColor" 
            @change="changeTextColor"
            class="color-picker"
            title="文字颜色"
          >
        </div>
        
        <button class="tool-btn primary" @click="saveContent">保存</button>
      </div>
      
      <div class="editor-content">
        <div 
          ref="editor" 
          class="rich-text-area"
          contenteditable="true"
          @input="onContentChange"
          @focus="onFocus"
          @blur="onBlur"
        ></div>
      </div>
      
      <div class="editor-footer">
        <div class="word-count">字数：{{ wordCount }}</div>
        <div class="html-output">
          <details>
            <summary>HTML源码</summary>
            <pre>{{ htmlContent }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RichEditor',
  data() {
    return {
      fontSize: '3',
      textColor: '#000000',
      wordCount: 0,
      htmlContent: '',
      isEditorFocused: false
    }
  },
  mounted() {
    this.initEditor()
  },
  methods: {
    initEditor() {
      const editor = this.$refs.editor
      editor.innerHTML = '<p>开始编辑您的内容...</p>'
      this.updateWordCount()
    },
    
    execCommand(command, value = null) {
      document.execCommand(command, false, value)
      this.$refs.editor.focus()
      this.updateWordCount()
    },
    
    isActive(command) {
      return document.queryCommandState(command)
    },
    
    changeFontSize() {
      this.execCommand('fontSize', this.fontSize)
    },
    
    changeTextColor() {
      this.execCommand('foreColor', this.textColor)
    },
    
    onContentChange() {
      this.updateWordCount()
      this.htmlContent = this.$refs.editor.innerHTML
    },
    
    onFocus() {
      this.isEditorFocused = true
    },
    
    onBlur() {
      this.isEditorFocused = false
    },
    
    updateWordCount() {
      const text = this.$refs.editor.innerText || this.$refs.editor.textContent
      this.wordCount = text.trim().length
    },
    
    saveContent() {
      const content = this.$refs.editor.innerHTML
      // 这里可以添加保存逻辑
      this.$message.success('内容已保存')
      console.log('保存的内容：', content)
    }
  }
}
</script>

<style scoped>
.rich-editor-page {
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
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  gap: 5px;
  align-items: center;
}

.tool-btn {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.tool-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.tool-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.tool-btn.primary:hover {
  background: #66b1ff;
}

select {
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
}

.color-picker {
  width: 40px;
  height: 36px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.editor-content {
  min-height: 400px;
}

.rich-text-area {
  min-height: 400px;
  padding: 20px;
  border: none;
  outline: none;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  overflow-y: auto;
}

.rich-text-area:focus {
  background-color: #fafafa;
}

.editor-footer {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e8eaec;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-count {
  color: #808695;
  font-size: 14px;
}

.html-output details {
  cursor: pointer;
}

.html-output summary {
  color: #409eff;
  font-size: 14px;
}

.html-output pre {
  margin-top: 10px;
  padding: 10px;
  background: #f1f2f3;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}
</style>
