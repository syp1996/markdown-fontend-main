<template>
  <div 
    v-if="visible" 
    class="search-modal-overlay" 
    @click="closeModal"
  >
    <div 
      class="search-modal" 
      @click.stop
    >
      <!-- 搜索输入框 -->
      <div class="search-input-container">
        <div class="search-input-wrapper">
          <img class="search-icon" src="@/icons/search.png" alt="搜索" />
          <input
            ref="searchInput"
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="搜索文档内容..."
            @input="handleSearch"
            @keydown="handleKeydown"
          />
          <div class="search-shortcut">⌘K</div>
        </div>
      </div>

      <!-- 搜索结果区域 -->
      <div class="search-results-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="search-loading">
          <div class="loading-spinner"></div>
          <span>搜索中...</span>
        </div>

        <!-- 搜索结果 -->
        <div v-else-if="searchResults.length > 0" class="search-results">
          <div class="search-results-header">
            找到 {{ searchResults.length }} 个结果
          </div>
          <div class="results-list">
            <div
              v-for="(result, index) in searchResults"
              :key="result.id"
              :class="[
                'result-item',
                { 'selected': selectedIndex === index }
              ]"
              @click="selectResult(result)"
              @mouseenter="selectedIndex = index"
            >
              <div class="result-content">
                <div class="result-title">
                  <img class="document-icon" src="@/icons/files.png" alt="文档" />
                  <span v-html="highlightText(result.title, searchKeyword)"></span>
                </div>
                <div 
                  v-if="result.snippet" 
                  class="result-snippet"
                  v-html="highlightText(result.snippet, searchKeyword)"
                ></div>
                <div class="result-meta">
                  <span class="result-date">{{ formatDate(result.updatedAt || result.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="searchKeyword && !loading" class="search-empty">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">未找到相关内容</div>
          <div class="empty-subtitle">尝试使用其他关键词</div>
        </div>

        <!-- 初始状态 -->
        <div v-else class="search-initial">
          <div class="initial-tips">
            <div class="tip-item">
              <span class="tip-icon">⌨️</span>
              <span>开始输入搜索文档</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">↑↓</span>
              <span>上下键选择</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">↵</span>
              <span>回车键打开</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { searchDocuments } from '@/api/documents'
import eventBus from '@/utils/eventBus'

export default {
  name: 'SearchModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'select-result'],
  data() {
    return {
      searchKeyword: '',
      searchResults: [],
      loading: false,
      selectedIndex: -1,
      searchTimeout: null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.resetSearch()
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            this.$refs.searchInput.focus()
          }
        })
      }
    }
  },
  mounted() {
    // 监听键盘快捷键
    document.addEventListener('keydown', this.handleGlobalKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeydown)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },
  methods: {
    // 处理全局键盘事件
    handleGlobalKeydown(event) {
      // Cmd/Ctrl + K 打开搜索
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        if (!this.visible) {
          this.$emit('open')
        }
      }
      
      // ESC 关闭搜索
      if (event.key === 'Escape' && this.visible) {
        this.closeModal()
      }
    },

    // 处理搜索输入
    handleSearch() {
      // 清除之前的定时器
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      // 如果搜索关键词为空，清空结果
      if (!this.searchKeyword.trim()) {
        this.searchResults = []
        this.selectedIndex = -1
        return
      }

      // 防抖处理，300ms后执行搜索
      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 300)
    },

    // 执行搜索
    async performSearch() {
      if (!this.searchKeyword.trim()) return

      try {
        this.loading = true
        const response = await searchDocuments(this.searchKeyword.trim())
        
        // 处理搜索结果
        this.searchResults = response?.results || response?.items || []
        this.selectedIndex = this.searchResults.length > 0 ? 0 : -1
        
      } catch (error) {
        console.error('搜索失败:', error)
        this.searchResults = []
        this.selectedIndex = -1
      } finally {
        this.loading = false
      }
    },

    // 处理键盘导航
    handleKeydown(event) {
      const resultsCount = this.searchResults.length

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (resultsCount > 0) {
            this.selectedIndex = (this.selectedIndex + 1) % resultsCount
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          if (resultsCount > 0) {
            this.selectedIndex = this.selectedIndex <= 0 
              ? resultsCount - 1 
              : this.selectedIndex - 1
          }
          break

        case 'Enter':
          event.preventDefault()
          if (this.selectedIndex >= 0 && this.searchResults[this.selectedIndex]) {
            this.selectResult(this.searchResults[this.selectedIndex])
          }
          break

        case 'Escape':
          this.closeModal()
          break
      }
    },

    // 选择搜索结果
    selectResult(result) {
      this.$emit('select-result', result)
      
      // 检查当前路由，确保在文件管理页面后再发送文件选择事件
      if (this.$route && this.$route.path !== '/dashboard/file-manager') {
        // 如果不在文件管理页面，先跳转
        this.$router.push('/dashboard/file-manager').then(() => {
          // 跳转完成后等待组件加载再发送事件
          setTimeout(() => {
            console.log('搜索结果：路由跳转完成，发送文件选择事件:', result)
            eventBus.emit('file-selected', { rawItem: result })
          }, 100)
        }).catch(err => {
          console.warn('搜索结果：路由跳转失败:', err)
          // 如果跳转失败，延迟后直接发送事件
          setTimeout(() => {
            eventBus.emit('file-selected', { rawItem: result })
          }, 50)
        })
      } else {
        // 如果已经在文件管理页面，直接发送事件
        console.log('搜索结果：已在文件管理页面，直接发送文件选择事件:', result)
        eventBus.emit('file-selected', { rawItem: result })
      }
      
      this.closeModal()
    },

    // 关闭弹窗
    closeModal() {
      this.$emit('close')
    },

    // 重置搜索状态
    resetSearch() {
      this.searchKeyword = ''
      this.searchResults = []
      this.selectedIndex = -1
      this.loading = false
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
    },

    // 高亮搜索关键词
    highlightText(text, keyword) {
      if (!text || !keyword) return text
      
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    }
  }
}
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 15vh;
}

.search-modal {
  width: 600px;
  max-width: 90vw;
  max-height: 70vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 搜索输入区域 */
.search-input-container {
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
}

.search-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #374151;
  outline: none;
  padding: 0;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-shortcut {
  background: #e5e7eb;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 12px;
}

/* 搜索结果区域 */
.search-results-container {
  flex: 1;
  overflow-y: auto;
  max-height: calc(70vh - 120px);
}

/* 加载状态 */
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 搜索结果 */
.search-results-header {
  padding: 12px 20px 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-list {
  padding: 0 12px 12px;
}

.result-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.result-item:hover,
.result-item.selected {
  background: #f3f4f6;
}

.result-content {
  width: 100%;
}

.result-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.document-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  opacity: 0.7;
}

.result-snippet {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #9ca3af;
}

.result-date {
  margin-right: 12px;
}

/* 高亮样式 */
:deep(mark) {
  background: #fef3c7;
  color: #92400e;
  padding: 1px 2px;
  border-radius: 2px;
}

/* 空状态 */
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.empty-subtitle {
  font-size: 14px;
  color: #6b7280;
}

/* 初始状态 */
.search-initial {
  padding: 40px 20px;
}

.initial-tips {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 22px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 12px;
  font-weight: 600;
}

/* 滚动条样式 */
.search-results-container::-webkit-scrollbar {
  width: 6px;
}

.search-results-container::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.search-results-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.search-results-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-modal {
    width: 95vw;
    max-height: 80vh;
  }
  
  .search-input-container {
    padding: 16px;
  }
  
  .search-input-wrapper {
    padding: 10px 12px;
  }
  
  .search-input {
    font-size: 14px;
  }
}
</style>