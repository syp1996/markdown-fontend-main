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
    
    <div class="file-list">
      <div class="file-item" v-for="file in filteredFiles" :key="file.id" @click="handleFileClick(file)">
        <div class="file-icon">
          <span v-if="file.type === 'folder'">📁</span>
          <span v-else-if="file.type === 'markdown'">📝</span>
          <span v-else>📄</span>
        </div>
        
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-date">{{ formatDate(file.modifiedAt) }}</span>
          </div>
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
</template>

<script>
export default {
  name: 'FileManager',
  data() {
    return {
      searchQuery: '',
      files: [
        {
          id: 1,
          name: '项目文档',
          type: 'folder',
          size: 0,
          modifiedAt: new Date('2024-01-15')
        },
        {
          id: 2,
          name: 'README.md',
          type: 'markdown',
          size: 2048,
          modifiedAt: new Date('2024-01-14')
        },
        {
          id: 3,
          name: '开发计划',
          type: 'document',
          size: 1536,
          modifiedAt: new Date('2024-01-13')
        }
      ]
    }
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
    createNewFile() {
      this.$message.info('新建文件功能开发中...')
    },
    
    uploadFile() {
      this.$message.info('文件上传功能开发中...')
    },
    
    handleFileClick(file) {
      if (file.type === 'folder') {
        this.$message.info('文件夹功能开发中...')
      } else {
        this.editFile(file)
      }
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

.file-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
</style>
