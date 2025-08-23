<template>
  <div class="file-manager-page">
    <div class="page-header">
      <h2>📁 文件管理</h2>
      <p>管理您的所有文档和文件</p>
    </div>
    
    <div class="toolbar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索文件..."
          class="search-input"
        >
        <button class="search-btn">🔍</button>
      </div>
      
      <div class="actions">
        <button class="action-btn primary" @click="createNewFile">
          <span class="btn-icon">➕</span>
          新建文件
        </button>
        <button class="action-btn" @click="showUploadModal">
          <span class="btn-icon">📤</span>
          上传文件
        </button>
      </div>
    </div>
    
    <div class="main-content">
      <!-- 左侧文件列表 -->
      <div class="file-list-container">
        <div class="file-list">
          <div class="file-item" 
               v-for="file in files" 
               :key="file.id" 
               @click="handleFileClick(file)"
               :class="{ 'active': selectedFile && selectedFile.id === file.id }">
            <div class="file-icon">
              <span v-if="file.type === 'folder'">📁</span>
              <span v-else-if="file.type === 'markdown'">📝</span>
              <span v-else>📄</span>
            </div>
            
            <div class="file-info">
              <div class="file-name">{{ file.title }}</div>
            </div>
            
            <div class="file-actions">
              <button class="file-action-btn" @click.stop="deleteFile(file)" title="删除">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧文件内容展示区域 -->
      <div class="file-content-container">
        <div v-if="!selectedFile" class="no-file-selected">
          <div class="no-file-icon">📄</div>
          <h3>请选择一个文件</h3>
          <p>点击左侧文件列表中的文件来查看内容</p>
        </div>
        
        <div v-else class="file-content">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在加载文件内容...</p>
          </div>
          
          <div v-else-if="fileContent" class="content-display">
            <div class="markdown-content">
              <div v-html="fileContent.html"></div>
            </div>
          </div>
          
          <div v-else-if="error" class="error-message">
            <p>❌ 加载文件内容失败: {{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件上传弹窗 -->
    <div v-if="showUpload" class="upload-modal-overlay" @click="closeUploadModal">
      <div class="upload-modal" @click.stop>
        <div class="upload-modal-header">
          <h3>📤 上传文件</h3>
          <button class="close-btn" @click="closeUploadModal">×</button>
        </div>
        
        <div class="upload-modal-body">
          <div class="upload-area" 
               :class="{ 'dragover': isDragOver, 'has-file': selectedFiles.length > 0 }"
               @drop="handleDrop"
               @dragover.prevent="handleDragOver"
               @dragleave.prevent="handleDragLeave"
               @click="triggerFileInput">
            
            <div v-if="selectedFiles.length === 0" class="upload-placeholder">
              <div class="upload-icon">📁</div>
              <p class="upload-text">点击选择文件或拖拽文件到此处</p>
              <p class="upload-hint">支持 Markdown (.md) 格式文件</p>
            </div>
            
            <div v-else class="selected-files">
              <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file">
                <div class="file-info">
                  <span class="file-icon">📝</span>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <button class="remove-file-btn" @click="removeFile(index)">×</button>
              </div>
            </div>
          </div>
          
          <input 
            ref="fileInput"
            type="file" 
            multiple 
            accept=".md,.markdown,text/markdown"
            @change="handleFileSelect"
            style="display: none"
          >
          
          <div class="upload-actions">
            <button class="upload-btn primary" 
                    @click="uploadFiles" 
                    :disabled="selectedFiles.length === 0 || uploading">
              <span v-if="uploading" class="loading-spinner-small"></span>
              {{ uploading ? '上传中...' : '开始上传' }}
            </button>
            <button class="upload-btn" @click="closeUploadModal">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocumentById, getDocuments, uploadDocument } from '@/api/documents';
export default {
  name: 'FileManager',
  data() {
    return {
      searchQuery: '',
      selectedFile: null,
      fileContent: null,
      loading: false,
      error: null,
      files: [],
      // 上传相关状态
      showUpload: false,
      selectedFiles: [],
      isDragOver: false,
      uploading: false
    }
  },
  created() {
    // 检查登录状态
    const token = localStorage.getItem('token')
    console.log('FileManager组件创建，当前token状态:', token ? '已登录' : '未登录')
    
    if (token) {
      console.log('Token内容:', token.substring(0, 20) + '...')
    }
    
    this.initData()
  },
  computed: {
    filteredFiles() {
      if (!this.searchQuery) return this.files
      return this.files.filter(file => 
        file.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  methods: {
    initData() {
      getDocuments().then(res => {
        this.files = res.items
      })
    },
    createNewFile() {
      this.$message.info('新建文件功能开发中...')
    },
    
    // 测试连接状态
    async testConnection() {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      
      console.log('=== 连接状态测试 ===')
      console.log('Token存在:', !!token)
      console.log('Token内容:', token ? token.substring(0, 20) + '...' : '无')
      console.log('UserInfo:', userInfo)
      console.log('当前URL:', window.location.href)
      
      if (!token) {
        this.$message.error('未检测到登录token，请先登录')
        return
      }
      
      try {
        // 测试获取文档列表API
        const response = await getDocuments()
        console.log('API测试成功:', response)
        this.$message.success('API连接正常，token有效')
      } catch (error) {
        console.error('API测试失败:', error)
        if (error.response?.status === 401) {
          this.$message.error('Token已过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          this.$router.push('/')
        } else {
          this.$message.error('API连接失败: ' + (error.message || '未知错误'))
        }
      }
    },
    
    // 显示上传弹窗
    showUploadModal() {
      this.showUpload = true
      this.selectedFiles = []
      this.isDragOver = false
    },
    
    // 关闭上传弹窗
    closeUploadModal() {
      this.showUpload = false
      this.selectedFiles = []
      this.isDragOver = false
    },
    
    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    // 处理文件选择
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.addFiles(files)
      // 清空input值，允许重复选择相同文件
      event.target.value = ''
    },
    
    // 处理拖拽进入
    handleDragOver(event) {
      event.preventDefault()
      this.isDragOver = true
    },
    
    // 处理拖拽离开
    handleDragLeave(event) {
      event.preventDefault()
      this.isDragOver = false
    },
    
    // 处理文件拖拽放置
    handleDrop(event) {
      event.preventDefault()
      this.isDragOver = false
      
      const files = Array.from(event.dataTransfer.files)
      this.addFiles(files)
    },
    
    // 添加文件到选择列表
    addFiles(files) {
      const validFiles = files.filter(file => {
        // 检查文件类型
        const isValidType = file.type === 'text/markdown' || 
                           file.name.endsWith('.md') || 
                           file.name.endsWith('.markdown')
        
        if (!isValidType) {
          this.$message.warning(`文件 ${file.name} 不是有效的 Markdown 格式`)
          return false
        }
        
        // 检查文件大小 (限制为 10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.$message.warning(`文件 ${file.name} 超过 10MB 大小限制`)
          return false
        }
        
        return true
      })
      
      // 检查是否重复
      const newFiles = validFiles.filter(newFile => 
        !this.selectedFiles.some(existingFile => 
          existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      )
      
      if (newFiles.length > 0) {
        this.selectedFiles.push(...newFiles)
        this.$message.success(`已添加 ${newFiles.length} 个文件`)
      }
    },
    
    // 移除选中的文件
    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },
    
    // 上传文件
    async uploadFiles() {
      if (this.selectedFiles.length === 0) {
        this.$message.warning('请先选择要上传的文件')
        return
      }
      
      // 检查登录状态
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.error('请先登录后再上传文件')
        this.$router.push('/')
        return
      }
      
      console.log('当前token:', token)
      console.log('准备上传文件:', this.selectedFiles)
      
      this.uploading = true
      
      try {
        const uploadPromises = this.selectedFiles.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('title', file.name.replace(/\.(md|markdown)$/i, ''))
          formData.append('type', 'markdown')
          
          console.log('上传文件信息:', {
            name: file.name,
            size: file.size,
            type: file.type,
            title: file.name.replace(/\.(md|markdown)$/i, '')
          })
          
          return await uploadDocument(formData)
        })
        
        const results = await Promise.all(uploadPromises)
        
        this.$message.success(`成功上传 ${results.length} 个文件`)
        
        // 刷新文件列表
        this.initData()
        
        // 关闭弹窗
        this.closeUploadModal()
        
      } catch (error) {
        console.error('上传失败:', error)
        
        // 根据错误类型显示不同的提示
        if (error.response) {
          const { status, data } = error.response
          if (status === 401) {
            this.$message.error('登录已过期，请重新登录')
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            this.$router.push('/')
          } else if (status === 413) {
            this.$message.error('文件过大，请选择小于10MB的文件')
          } else if (status === 400) {
            this.$message.error('文件格式不支持，请选择Markdown文件')
          } else {
            this.$message.error(`上传失败: ${data?.message || '服务器错误'}`)
          }
        } else if (error.request) {
          this.$message.error('网络连接失败，请检查网络设置')
        } else {
          this.$message.error('文件上传失败: ' + (error.message || '未知错误'))
        }
      } finally {
        this.uploading = false
      }
    },
    
    async handleFileClick(file) {
      // 设置选中的文件
      this.selectedFile = file
      this.fileContent = null
      this.error = null
      
      // 获取文件内容
      await this.loadFileContent(file.id)
    },
    
    async loadFileContent(documentId) {
      this.loading = true
      this.error = null
      
      try {
        // 模拟API调用延迟
         // 尝试调用真实API
          const response = await getDocumentById(documentId)
          this.fileContent = response.content
          console.log('文件内容加载成功:', this.fileContent)
      } catch (err) {
        console.error('加载文件内容失败:', err)
        this.error = err.message || '加载文件内容失败'
        this.$message.error('加载文件内容失败')
      } finally {
        this.loading = false
      }
    },
    
    getMockFileContent(documentId) {
      // 模拟文件内容，用于测试展示
      const mockContents = {
        2: `# README.md

这是一个示例的README文件内容。

## 项目简介
这是一个基于Vue.js的文件管理系统，支持多种文件格式的查看和编辑。

## 功能特性
- 📁 文件管理
- 📝 Markdown编辑
- 📄 富文本编辑
- 🔍 文件搜索
- 📤 文件上传

## 使用方法
1. 点击左侧文件列表中的文件
2. 在右侧查看文件内容
3. 使用编辑按钮进行编辑

## 技术栈
- Vue.js 3
- Vue Router
- Vuex
- Element Plus

---
*最后更新: 2024年1月14日*`,
        3: `开发计划文档

项目名称: 文件管理系统
版本: v1.0.0
状态: 开发中

## 第一阶段 (已完成)
- [x] 项目基础架构搭建
- [x] 路由配置
- [x] 基础组件开发

## 第二阶段 (进行中)
- [x] 文件列表展示
- [x] 文件内容查看
- [ ] 文件编辑功能
- [x] 文件上传功能

## 第三阶段 (计划中)
- [ ] 用户权限管理
- [ ] 文件版本控制
- [ ] 协作编辑功能
- [ ] 移动端适配

## 技术要点
1. 响应式设计
2. 组件化开发
3. 状态管理
4. API接口设计

预计完成时间: 2024年3月
负责人: 开发团队`
      }
      
      return mockContents[documentId] || null
    },
    
    editFile(file) {
      if (file.type === 'markdown') {
        this.$router.push('/dashboard/markdown-editor')
      } else {
        this.$router.push('/dashboard/rich-editor')
      }
    },
    
    deleteFile(file) {
      if (confirm(`确定要删除 ${file.name} 吗？`)) {
        const index = this.files.findIndex(f => f.id === file.id)
        if (index > -1) {
          this.files.splice(index, 1)
          // 如果删除的是当前选中的文件，清空选择
          if (this.selectedFile && this.selectedFile.id === file.id) {
            this.selectedFile = null
            this.fileContent = null
          }
          this.$message.success('文件已删除')
        }
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    formatDate(date) {
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.file-manager-page {
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px 0 0 6px;
  outline: none;
  font-size: 14px;
}

.search-input:focus {
  border-color: #409eff;
}

.search-btn {
  padding: 10px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.action-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.action-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.action-btn.primary:hover {
  background: #66b1ff;
}

.btn-icon {
  font-size: 16px;
}

/* 主内容区域布局 */
.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

/* 左侧文件列表容器 */
.file-list-container {
  flex: 0 0 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.file-list {
  height: 100%;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-item:hover {
  background-color: #f8f9fa;
}

.file-item.active {
  background-color: #e6f7ff;
  border-left: 3px solid #409eff;
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
  font-size: 24px;
  margin-right: 16px;
  width: 40px;
  text-align: center;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #17233d;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.file-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.file-action-btn {
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.file-action-btn:hover {
  background-color: #e8eaec;
}

/* 右侧文件内容展示区域 */
.file-content-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.no-file-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  text-align: center;
}

.no-file-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-file-selected h3 {
  margin: 0 0 10px 0;
  color: #606266;
}

.no-file-selected p {
  margin: 0;
  font-size: 14px;
}

.file-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.file-content-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.file-content-header h3 {
  margin: 0 0 10px 0;
  color: #17233d;
}

.file-content-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-display {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.markdown-content,
.text-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #17233d;
}

.markdown-content pre,
.text-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #f56c6c;
  font-size: 14px;
}

.error-message p {
  margin: 0;
}

/* 上传弹窗样式 */
.upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.upload-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.upload-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaec;
  background: #fafafa;
}

.upload-modal-header h3 {
  margin: 0;
  color: #17233d;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #606266;
}

.upload-modal-body {
  padding: 24px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f8f9fa;
}

.upload-area.dragover {
  border-color: #409eff;
  background: #e6f7ff;
  transform: scale(1.02);
}

.upload-area.has-file {
  border-color: #52c41a;
  background: #f6ffed;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.6;
}

.upload-text {
  margin: 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.upload-hint {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.selected-files {
  width: 100%;
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e8eaec;
  border-radius: 6px;
  margin-bottom: 8px;
}

.selected-file:last-child {
  margin-bottom: 0;
}

.selected-file .file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-file .file-icon {
  font-size: 20px;
  margin: 0;
  width: auto;
}

.selected-file .file-name {
  font-weight: 500;
  color: #17233d;
  margin: 0;
}

.selected-file .file-size {
  font-size: 12px;
  color: #909399;
}

.remove-file-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #f56c6c;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.remove-file-btn:hover {
  background: #fef0f0;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.upload-btn {
  padding: 10px 20px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.upload-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.upload-btn.primary:hover:not(:disabled) {
  background: #66b1ff;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
