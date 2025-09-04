<template>
    <div class="file-manager">
      <el-card class="full-height-card">
        <!-- 文件内容展示区 -->
        <div v-if="!selectedFile" class="no-file-selected">
          <div class="empty-state">
            <i class="el-icon-document-copy empty-icon"></i>
            <p class="empty-text">请选择一个文件</p>
            <p class="empty-subtext">点击左侧文件列表中的文件来查看内容</p>
          </div>
        </div>
  
        <!-- 选中文件时显示编辑器 -->
        <div v-else class="file-editor-container">
          <div class="file-info">
            <h3 class="file-title">{{ selectedFile.title }}</h3>
            <div class="file-meta">
              <span class="file-type">{{ getFileTypeName(selectedFile.type || 'document') }}</span>
              <span class="file-modified">最后修改: {{ formatDate(selectedFile.updated_at || selectedFile.created_at) }}</span>
            </div>
          </div>
          
          <!-- 富文本编辑器 -->
          <div class="editor-wrapper">
            <TiptapEditor
              :model-value="fileContent"
              :document-id="selectedFile.id"
              :auto-save="true"
              :auto-save-delay="3000"
              :enable-user-input-auto-save="true"
              :user-inactivity-delay="3000"
              height="100%"
              placeholder="开始编辑文档..."
              @update:model-value="handleContentChange"
              @save-success="handleSaveSuccess"
              @save-error="handleSaveError"
            />
          </div>
        </div>
      </el-card>
    </div>
</template>
  
<script>
import { deleteDocument, getDocuments } from '@/api/documents'
import TiptapEditor from '@/components/TiptapEditor.vue'
import eventBus from '@/utils/eventBus'
  
export default {
  name: 'FileManager',
  components: {
    TiptapEditor
  },
  data() {
    return {
      loading: false,
      files: [],
      filteredFiles: [],
      searchQuery: '',
      fileType: '',
      // 新增：文件选择相关状态
      selectedFile: null,
      fileContent: '',
      saveStatus: '已保存'
    }
  },
  created() {
    this.fetchDocuments()
    // 监听文件选择事件
    this.setupEventListeners()
  },
  beforeUnmount() {
    // 清理事件监听器
    this.cleanupEventListeners()
  },
  methods: {
    async fetchDocuments() {
      this.loading = true
      try {
        const response = await getDocuments()
        this.files = response.data || response.items || []
        console.log('获取到的文档数据:', this.files) // 添加调试信息
        this.filterFiles()
      } catch (error) {
        console.error('获取文档列表失败：', error)
        this.$message.error('获取文档列表失败：' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    // 新增：设置事件监听器
    setupEventListeners() {
      eventBus.on('file-selected', this.handleFileSelected)
      eventBus.on('file-title-updated', this.handleFileTitleUpdated)
      eventBus.on('file-deleted', this.handleFileDeleted)
      eventBus.on('document-created', this.handleDocumentCreated)
    },

    // 新增：清理事件监听器
    cleanupEventListeners() {
      eventBus.off('file-selected', this.handleFileSelected)
      eventBus.off('file-title-updated', this.handleFileTitleUpdated)
      eventBus.off('file-deleted', this.handleFileDeleted)
      eventBus.off('document-created', this.handleDocumentCreated)
    },

    // 新增：处理文件选择事件
    handleFileSelected(data) {
      console.log('FileManager: 接收到文件选择事件', data)
      if (data && data.rawItem) {
        this.selectedFile = data.rawItem
        this.loadFileContent(data.rawItem)
      }
    },

    // 新增：处理文件标题更新事件
    handleFileTitleUpdated(data) {
      if (data && data.item && this.selectedFile && this.selectedFile.id === data.item.id) {
        this.selectedFile.title = data.newTitle
      }
    },

    // 新增：处理文件删除事件
    handleFileDeleted(data) {
      if (data && data.deletedItem && this.selectedFile && this.selectedFile.id === data.deletedItem.id) {
        this.selectedFile = null
        this.fileContent = ''
      }
    },

    // 新增：处理文档创建事件
    handleDocumentCreated(data) {
      if (data && data.newDoc) {
        // 刷新文档列表
        this.fetchDocuments()
      }
    },

    // 新增：加载文件内容
    async loadFileContent(file) {
      try {
        // 如果文件有content属性，直接使用
        if (file.content) {
          if (typeof file.content === 'object' && file.content.html) {
            this.fileContent = file.content.html
          } else if (typeof file.content === 'string') {
            this.fileContent = file.content
          } else {
            this.fileContent = ''
          }
        } else {
          // 如果没有content，设置空内容
          this.fileContent = ''
        }
        console.log('FileManager: 文件内容加载完成', file.title)
      } catch (error) {
        console.error('加载文件内容失败：', error)
        this.fileContent = ''
        this.$message.error('加载文件内容失败')
      }
    },

    // 新增：处理内容变化
    handleContentChange(content) {
      this.fileContent = content
      this.saveStatus = '正在保存...'
    },

    // 新增：处理保存成功
    handleSaveSuccess(data) {
      this.saveStatus = '已保存'
      console.log('文件保存成功:', data)
      this.$message.success('文件保存成功')
    },

    // 新增：处理保存失败
    handleSaveError(data) {
      this.saveStatus = '保存失败'
      console.error('文件保存失败:', data.error)
      this.$message.error('文件保存失败，请重试')
    },

    // 新增：返回文件列表
    backToFileList() {
      this.selectedFile = null
      this.fileContent = ''
    },

    filterFiles() {
      let filtered = [...this.files]
      
      if (this.searchQuery) {
        filtered = filtered.filter(file => 
          (file.name || file.title || '').toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      if (this.fileType) {
        filtered = filtered.filter(file => file.type === this.fileType)
      }
      
      this.filteredFiles = filtered
    },

    handleSearch() {
      this.filterFiles()
    },

    handleFilter() {
      this.filterFiles()
    },

    getFileIcon(type) {
      if (type === 'markdown') return 'el-icon-document'
      if (type === 'document') return 'el-icon-document-copy'
      return 'el-icon-document'
    },

    getTagType(type) {
      if (type === 'markdown') return 'primary'
      if (type === 'document') return 'success'
      return 'info'
    },

    getFileTypeName(type) {
      if (type === 'markdown') return 'Markdown'
      if (type === 'document') return '文档'
      return '其他'
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    formatDate(dateString) {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },

    createNewFile() {
      this.$message.info('新建文件功能开发中...')
    },

    uploadFile() {
      this.$message.info('上传文件功能开发中...')
    },

    editFile(file) {
      // 直接选中文件进行编辑
      this.selectedFile = file
      this.loadFileContent(file)
    },

    async deleteFile(file) {
      try {
        await this.$confirm(`确定要删除文件 "${file.title || file.name}" 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 调用删除接口
        await deleteDocument(file.id)
        
        this.$message.success('删除成功')
        // 重新获取文档列表
        this.fetchDocuments()

        // 如果删除的是当前选中的文件，清除选中状态
        if (this.selectedFile && this.selectedFile.id === file.id) {
          this.selectedFile = null
          this.fileContent = ''
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消删除')
        } else {
          console.error('删除文件失败：', error)
          this.$message.error('删除失败：' + (error.message || '未知错误'))
        }
      }
    }
  }
}
</script>
  
<style scoped>
.file-manager {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

/* 让 el-card 占满整个容器 */
.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
}

/* 重写 el-card 的默认样式，让 body 占满剩余空间 */
.full-height-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px); /* 减去卡片的padding和可能的边距 */
  padding: 20px;
  overflow: hidden;
}

/* 新增样式 */
.no-file-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.empty-subtext {
  font-size: 14px;
  margin: 0;
}

.file-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.file-info {
  flex-shrink: 0;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.file-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.file-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 14px;
  color: #909399;
}

.file-type {
  background-color: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* 确保编辑器能够占满剩余空间 */
.editor-wrapper :deep(.tiptap-editor-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-wrapper :deep(.editor-content) {
  flex: 1;
  overflow-y: auto;
}

/* 其他辅助样式 */
.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.file-list {
  margin-bottom: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 18px;
  color: #409EFF;
}

.file-name {
  flex: 1;
}

.back-btn {
  margin-bottom: 16px;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .file-manager {
    height: 100vh;
    padding: 0;
  }
  
  .full-height-card :deep(.el-card__body) {
    height: calc(100vh - 20px);
    padding: 10px;
  }
  
  .file-title {
    font-size: 20px;
  }
  
  .file-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>