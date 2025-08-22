<template>
  <div class="project-list-page">
    <div class="page-header">
      <h2>📋 项目列表</h2>
      <p>管理您的所有项目</p>
    </div>
    
    <div class="toolbar">
      <button class="action-btn primary" @click="createProject">
        <span class="btn-icon">➕</span>
        新建项目
      </button>
    </div>
    
    <div class="projects-grid">
      <div class="project-card" v-for="project in projects" :key="project.id">
        <div class="project-header">
          <h3>{{ project.name }}</h3>
          <span class="project-status" :class="project.status">{{ project.statusText }}</span>
        </div>
        <p class="project-description">{{ project.description }}</p>
        <div class="project-meta">
          <span>创建时间：{{ formatDate(project.createdAt) }}</span>
          <span>成员：{{ project.members.length }}人</span>
        </div>
        <div class="project-actions">
          <button class="project-btn" @click="openProject(project)">打开</button>
          <button class="project-btn" @click="editProject(project)">编辑</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectList',
  data() {
    return {
      projects: [
        {
          id: 1,
          name: '文档管理系统',
          description: '一个功能强大的在线文档编辑和管理平台',
          status: 'active',
          statusText: '进行中',
          createdAt: new Date('2024-01-01'),
          members: ['张三', '李四', '王五']
        },
        {
          id: 2,
          name: '个人博客',
          description: '使用Vue.js构建的个人博客系统',
          status: 'completed',
          statusText: '已完成',
          createdAt: new Date('2023-12-01'),
          members: ['张三']
        }
      ]
    }
  },
  methods: {
    createProject() {
      this.$message.info('创建项目功能开发中...')
    },
    openProject(project) {
      this.$message.info(`打开项目：${project.name}`)
    },
    editProject(project) {
      this.$message.info(`编辑项目：${project.name}`)
    },
    formatDate(date) {
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.project-list-page {
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
  margin-bottom: 20px;
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

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-header h3 {
  margin: 0;
  color: #17233d;
}

.project-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.project-status.active {
  background: #e1f3d8;
  color: #67c23a;
}

.project-status.completed {
  background: #d1ecf1;
  color: #17a2b8;
}

.project-description {
  color: #606266;
  margin-bottom: 16px;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 12px;
  color: #909399;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.project-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.project-btn:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
