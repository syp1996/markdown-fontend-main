<template>
  <div class="file-manager">
    <el-card>
      <div slot="header" class="file-header">
        <span>文件管理</span>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-plus" @click="createNewFile">新建文件</el-button>
          <el-button type="success" icon="el-icon-upload" @click="uploadFile">上传文件</el-button>
        </div>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索文件名..."
              prefix-icon="el-icon-search"
              @input="handleSearch"
              clearable>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select v-model="fileType" placeholder="文件类型" @change="handleFilter">
              <el-option label="全部" value=""></el-option>
              <el-option label="Markdown" value="markdown"></el-option>
              <el-option label="文档" value="document"></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 文件列表 -->
      <div class="file-list">
        <el-table
          :data="filteredFiles"
          style="width: 100%"
          v-loading="loading">
          <el-table-column prop="name" label="文件名" min-width="200">
            <template slot-scope="scope">
              <div class="file-item">
                <i :class="getFileIcon(scope.row.type)" class="file-icon"></i>
                <span class="file-name">{{ scope.row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template slot-scope="scope">
              <el-tag :type="getTagType(scope.row.type)" size="mini">
                {{ getFileTypeName(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="100">
            <template slot-scope="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="modified" label="修改时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.modified) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button size="mini" @click="editFile(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="deleteFile(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getDocuments } from '@/api/documents'

export default {
  name: 'FileManager',
  data() {
    return {
      loading: false,
      files: [],
      filteredFiles: [],
      searchQuery: '',
      fileType: ''
    }
  },
  created() {
    this.fetchDocuments()
  },
  methods: {
    async fetchDocuments() {
      this.loading = true
      try {
        const response = await getDocuments()
        this.files = response.data || []
        this.filterFiles()
      } catch (error) {
        console.error('获取文档列表失败：', error)
        this.$message.error('获取文档列表失败：' + (error.message || '未知错误'))
        // // 使用模拟数据作为备选
        // this.files = this.getMockData()
        // this.filterFiles()
      } finally {
        this.loading = false
      }
    },
    getMockData() {
      return [
        {
          id: 1,
          name: '项目说明.md',
          type: 'markdown',
          size: 2048,
          modified: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          name: '开发文档.md',
          type: 'markdown',
          size: 15360,
          modified: '2024-01-14T16:45:00Z'
        },
        {
          id: 3,
          name: '会议记录.doc',
          type: 'document',
          size: 8192,
          modified: '2024-01-13T10:20:00Z'
        }
      ]
    },
    filterFiles() {
      let filtered = [...this.files]
      
      if (this.searchQuery) {
        filtered = filtered.filter(file => 
          file.name.toLowerCase().includes(this.searchQuery.toLowerCase())
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
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    formatDate(dateString) {
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
      this.$message.info(`编辑文件：${file.name}`)
    },
    deleteFile(file) {
      this.$confirm(`确定要删除文件 "${file.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        this.fetchDocuments()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style scoped>
.file-manager {
  padding: 20px;
}

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
</style>
