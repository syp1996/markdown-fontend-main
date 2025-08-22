<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1>🎉 欢迎使用文档管理系统</h1>
      <p class="subtitle">一个功能强大的在线文档编辑和管理平台</p>
    </div>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📝</div>
        <h3>Markdown编辑器</h3>
        <p>支持Markdown语法的专业文本编辑器，实时预览，语法高亮</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">✒️</div>
        <h3>富文本编辑器</h3>
        <p>功能丰富的富文本编辑器，支持多种格式和样式</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">💻</div>
        <h3>代码编辑器</h3>
        <p>支持多种编程语言的代码编辑器，语法高亮，智能提示</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📁</div>
        <h3>文件管理</h3>
        <p>高效的文件管理系统，支持分类、搜索、版本控制</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">👥</div>
        <h3>项目管理</h3>
        <p>完整的项目管理功能，团队协作，进度跟踪</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">⚙️</div>
        <h3>系统设置</h3>
        <p>个性化设置，主题切换，偏好配置</p>
      </div>
    </div>
    
    <div class="quick-start">
      <h2>🚀 快速开始</h2>
      <div class="quick-actions">
        <button class="action-btn primary" @click="createNewDoc">
          <span class="btn-icon">➕</span>
          创建新文档
        </button>
        <button class="action-btn" @click="openRecent">
          <span class="btn-icon">📄</span>
          最近文档
        </button>
        <button class="action-btn" @click="viewTemplates">
          <span class="btn-icon">📋</span>
          查看模板
        </button>
      </div>
    </div>
    
    <div class="stats-section">
      <h2>📊 使用统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalDocs }}</div>
          <div class="stat-label">总文档数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalProjects }}</div>
          <div class="stat-label">项目数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalSize }}</div>
          <div class="stat-label">存储空间(MB)</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.lastLogin }}</div>
          <div class="stat-label">最后登录</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      stats: {
        totalDocs: 25,
        totalProjects: 8,
        totalSize: 156,
        lastLogin: '今天'
      }
    }
  },
  methods: {
    createNewDoc() {
      this.$emit('menu-select', 'markdown-editor')
    },
    openRecent() {
      this.$emit('menu-select', 'file-list')
    },
    viewTemplates() {
      this.$emit('menu-select', 'project-templates')
    }
  }
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.welcome-section h1 {
  margin: 0 0 16px 0;
  font-size: 2.5em;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 1.2em;
  opacity: 0.9;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3em;
  margin-bottom: 16px;
}

.feature-card h3 {
  margin: 0 0 12px 0;
  color: #17233d;
  font-size: 1.3em;
}

.feature-card p {
  margin: 0;
  color: #808695;
  line-height: 1.6;
}

.quick-start {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  text-align: center;
}

.quick-start h2 {
  margin: 0 0 24px 0;
  color: #17233d;
}

.quick-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid #e8eaec;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
}

.action-btn:hover {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
}

.action-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.action-btn.primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.btn-icon {
  font-size: 18px;
}

.stats-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-section h2 {
  margin: 0 0 24px 0;
  color: #17233d;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2.5em;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #808695;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .welcome-section h1 {
    font-size: 2em;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
