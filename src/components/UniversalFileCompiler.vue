<template>
  <div class="universal-file-compiler">
    <!-- 文件信息头部 -->
    <div class="file-header">
      <div class="file-info">
        <span class="file-icon">{{ getFileIcon() }}</span>
        <span class="file-name">{{ fileName }}</span>
        <span class="file-format-badge" :class="getFormatClass()">
          {{ getFormatText() }}
        </span>
      </div>
      
      <div class="file-actions">
        <button 
          class="action-btn edit-btn" 
          @click="toggleEditMode"
          :class="{ 'active': isEditMode }"
        >
          {{ isEditMode ? '👁️ 预览' : '✏️ 编辑' }}
        </button>
        
        <button 
          v-if="isEditMode" 
          class="action-btn save-btn" 
          @click="saveFile"
          :disabled="!hasChanges"
        >
          💾 保存
        </button>
        
        <button 
          v-if="isEditMode" 
          class="action-btn cancel-btn" 
          @click="cancelEdit"
        >
          ❌ 取消
        </button>
        
        <button 
          class="action-btn export-btn" 
          @click="exportFile"
        >
          📤 导出
        </button>
        
        <button 
          class="action-btn format-btn" 
          @click="toggleFormatPanel"
          :class="{ 'active': showFormatPanel }"
        >
          🔄 转换格式
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 编辑模式 -->
      <div v-if="isEditMode" class="edit-mode">
        <!-- Markdown 编辑器 -->
        <div v-if="fileFormat === 'markdown'" class="markdown-editor">
          <textarea
            v-model="editContent"
            class="markdown-textarea"
            placeholder="在这里编写 Markdown 内容..."
            @input="onContentChange"
          ></textarea>
          
          <!-- 实时预览 -->
          <div class="markdown-preview">
            <h4>实时预览</h4>
            <div v-html="markdownPreview" class="preview-content"></div>
          </div>
        </div>
        
        <!-- 富文本编辑器 -->
        <div v-else-if="fileFormat === 'richtext'" class="richtext-editor">
          <BlockNoteEditor 
            v-model="editContent"
            @update:modelValue="onContentChange"
          />
        </div>
        
        <!-- 纯文本编辑器 -->
        <div v-else class="text-editor">
          <textarea
            v-model="editContent"
            class="text-textarea"
            placeholder="在这里编写文本内容..."
            @input="onContentChange"
          ></textarea>
        </div>
      </div>
      
      <!-- 预览模式 -->
      <div v-else class="preview-mode">
        <!-- Markdown 渲染 -->
        <div v-if="fileFormat === 'markdown'" class="markdown-render">
          <div v-html="markdownPreview" class="rendered-content"></div>
        </div>
        
        <!-- 富文本渲染 -->
        <div v-else-if="fileFormat === 'richtext'" class="richtext-render">
          <div v-html="richtextPreview" class="rendered-content"></div>
        </div>
        
        <!-- 纯文本渲染 -->
        <div v-else class="text-render">
          <pre class="text-content">{{ originalContent }}</pre>
        </div>
      </div>
    </div>

    <!-- 格式转换面板 -->
    <!-- <div class="format-panel">
      <h4>格式转换</h4>
      <div class="format-options">
        <button 
          v-for="format in availableFormats" 
          :key="format.value"
          class="format-option"
          @click="convertFormat(format.value)"
          :disabled="format.value === fileFormat"
        >
          {{ format.label }}
        </button>
      </div>
    </div> -->
  </div>
</template>

<script>
import { FormatConverter } from '@/utils/formatConverter.js'
import { marked } from 'marked'
import BlockNoteEditor from './BlockNoteEditor.vue'

export default {
  name: 'UniversalFileCompiler',
  components: {
    BlockNoteEditor
  },
  props: {
    // 文件内容
    content: {
      type: [String, Object],
      required: true
    },
    // 文件名
    fileName: {
      type: String,
      required: true
    },
    // 文件格式
    fileFormat: {
      type: String,
      default: 'markdown'
    },
    // 是否只读
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isEditMode: false,
      editContent: '',
      originalContent: '',
      hasChanges: false,
      showFormatPanel: false
    }
  },
  computed: {
    // Markdown 预览
    markdownPreview() {
      if (this.fileFormat === 'markdown') {
        try {
          return marked.parse(this.editContent || this.originalContent)
        } catch (error) {
          console.error('Markdown 解析失败:', error)
          return `<pre>${this.editContent || this.originalContent}</pre>`
        }
      }
      return ''
    },
    
    // 富文本预览
    richtextPreview() {
      if (this.fileFormat === 'richtext') {
        return this.editContent || this.originalContent
      }
      return ''
    },
    
    // 可用的格式选项
    availableFormats() {
      return [
        { label: 'Markdown', value: 'markdown' },
        { label: '富文本', value: 'richtext' },
        { label: '纯文本', value: 'text' },
        { label: 'HTML', value: 'html' }
      ]
    }
  },
  watch: {
    content: {
      immediate: true,
      handler(newContent) {
        this.initializeContent(newContent)
      }
    }
  },
  methods: {
    // 初始化内容
    initializeContent(content) {
      if (typeof content === 'string') {
        this.originalContent = content
        this.editContent = content
      } else if (content && typeof content === 'object') {
        // 处理复杂内容对象
        if (content.markdown) {
          this.originalContent = content.markdown
          this.editContent = content.markdown
        } else if (content.html) {
          this.originalContent = content.html
          this.editContent = content.html
        } else {
          this.originalContent = JSON.stringify(content, null, 2)
          this.editContent = this.originalContent
        }
      }
      this.hasChanges = false
    },
    
    // 获取文件图标
    getFileIcon() {
      const icons = {
        markdown: '📝',
        richtext: '📄',
        text: '📃',
        html: '🌐',
        word: '📘',
        pdf: '📕'
      }
      return icons[this.fileFormat] || '📄'
    },
    
    // 获取格式样式类
    getFormatClass() {
      return `format-${this.fileFormat}`
    },
    
    // 获取格式文本
    getFormatText() {
      const formatNames = {
        markdown: 'Markdown',
        richtext: '富文本',
        text: '纯文本',
        html: 'HTML',
        word: 'Word',
        pdf: 'PDF'
      }
      return formatNames[this.fileFormat] || '未知格式'
    },
    
    // 切换编辑模式
    toggleEditMode() {
      if (this.readOnly) return
      
      this.isEditMode = !this.isEditMode
      if (this.isEditMode) {
        // 进入编辑模式，复制原始内容
        this.editContent = this.originalContent
      }
    },
    
    // 内容变化处理
    onContentChange() {
      this.hasChanges = this.editContent !== this.originalContent
    },
    
    // 保存文件
    async saveFile() {
      try {
        // 发送保存事件
        this.$emit('save', {
          content: this.editContent,
          format: this.fileFormat,
          fileName: this.fileName
        })
        
        // 更新原始内容
        this.originalContent = this.editContent
        this.hasChanges = false
        
        this.$message.success('文件保存成功！')
      } catch (error) {
        this.$message.error('保存失败：' + error.message)
      }
    },
    
    // 取消编辑
    cancelEdit() {
      this.editContent = this.originalContent
      this.hasChanges = false
      this.isEditMode = false
    },
    
    // 导出文件
    exportFile() {
      const blob = new Blob([this.editContent || this.originalContent], {
        type: this.getMimeType()
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = this.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      this.$message.success('文件导出成功！')
    },
    
    // 获取MIME类型
    getMimeType() {
      const mimeTypes = {
        markdown: 'text/markdown',
        richtext: 'text/html',
        text: 'text/plain',
        html: 'text/html'
      }
      return mimeTypes[this.fileFormat] || 'text/plain'
    },
    
    // 转换格式
    async convertFormat(newFormat) {
      if (newFormat === this.fileFormat) return
      
      try {
        const currentContent = this.editContent || this.originalContent
        const convertedContent = FormatConverter.convert(currentContent, this.fileFormat, newFormat)
        
        // 更新内容
        this.editContent = convertedContent
        this.originalContent = convertedContent
        
        // 更新文件格式
        this.fileFormat = newFormat
        
        // 发送格式转换事件
        this.$emit('format-change', {
          from: this.fileFormat,
          to: newFormat,
          content: convertedContent
        })
        
        this.$message.success(`格式转换成功：${this.getFormatText()} → ${FormatConverter.getSupportedFormats().find(f => f.value === newFormat)?.label}`)
        
      } catch (error) {
        console.error('格式转换失败:', error)
        this.$message.error('格式转换失败：' + error.message)
      }
    },
    
    // 显示格式转换面板
    toggleFormatPanel() {
      this.showFormatPanel = !this.showFormatPanel
    }
  }
}
</script>

<style scoped>
.universal-file-compiler {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
}

.file-name {
  font-weight: 600;
  color: #17233d;
  font-size: 16px;
}

.file-format-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.format-markdown { background: #67c23a; }
.format-richtext { background: #409eff; }
.format-text { background: #909399; }
.format-html { background: #e6a23c; }

.file-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.action-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.action-btn.save-btn {
  background: #67c23a;
  color: white;
  border-color: #67c23a;
}

.action-btn.save-btn:hover:not(:disabled) {
  background: #85ce61;
}

.action-btn.cancel-btn {
  background: #f56c6c;
  color: white;
  border-color: #f56c6c;
}

.action-btn.cancel-btn:hover:not(:disabled) {
  background: #f78989;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-area {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.edit-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-editor {
  display: flex;
  height: 100%;
}

.markdown-textarea {
  flex: 1;
  padding: 20px;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: #f8f9fa;
}

.markdown-preview {
  flex: 1;
  padding: 20px;
  border-left: 1px solid #e9ecef;
  background: white;
  overflow-y: auto;
}

.markdown-preview h4 {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 8px;
}

.preview-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #17233d;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin: 16px 0 8px 0;
  color: #17233d;
}

.preview-content p {
  margin: 8px 0;
}

.preview-content code {
  background: #f1f2f3;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.preview-content pre {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-content blockquote {
  border-left: 4px solid #409eff;
  margin: 16px 0;
  padding: 8px 16px;
  background: #f8f9fa;
  color: #606266;
}

.richtext-editor {
  flex: 1;
  padding: 20px;
}

.text-editor {
  flex: 1;
}

.text-textarea {
  width: 100%;
  height: 100%;
  padding: 20px;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: #f8f9fa;
}

.preview-mode {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.markdown-render,
.richtext-render,
.text-render {
  height: 100%;
}

.rendered-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #17233d;
}

.text-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #17233d;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.format-panel {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.format-panel h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.format-options {
  display: flex;
  gap: 8px;
}

.format-option {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.format-option:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.format-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
