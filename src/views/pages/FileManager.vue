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
        <button class="action-btn" @click="uploadFile">
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
              <button class="file-action-btn" @click.stop="editFile(file)" title="编辑">
                ✏️
              </button>
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
          <div class="file-content-header">
            <h3>{{ selectedFile.name }}</h3>
            <div class="file-content-meta">
              <span>大小: {{ formatFileSize(selectedFile.size) }}</span>
              <!-- <span>修改时间: {{ formatDate(selectedFile.modifiedAt) }}</span> -->
            </div>
          </div>
          
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在加载文件内容...</p>
          </div>
          
          <div v-else-if="fileContent" class="content-display">
            <div v-if="selectedFile.type === 'markdown'" class="markdown-content">
              <pre>{{ fileContent }}</pre>
            </div>
            <div v-else class="text-content">
              <pre>{{ fileContent }}</pre>
            </div>
          </div>
          
          <div v-else-if="error" class="error-message">
            <p>❌ 加载文件内容失败: {{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocumentById, getDocuments } from '@/api/documents';
export default {
  name: 'FileManager',
  data() {
    return {
      searchQuery: '',
      selectedFile: null,
      fileContent: null,
      loading: false,
      error: null,
      files: [
        
      ]
    }
    },
  created() {
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
    
    uploadFile() {
      this.$message.info('文件上传功能开发中...')
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
- [ ] 文件上传功能

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
</style>
