<template>
  <div class="dashboard">
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="dashboard-header">
        <div class="header-left">
          <h2>Markdown管理系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" icon="el-icon-user"></el-avatar>
              <span class="username">{{ userInfo.username || '用户' }}</span>
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px" class="dashboard-sidebar">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409EFF">
            <el-menu-item index="/dashboard">
              <i class="el-icon-s-home"></i>
              <span slot="title">首页</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/markdown">
              <i class="el-icon-document"></i>
              <span slot="title">Markdown编辑器</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/files">
              <i class="el-icon-folder"></i>
              <span slot="title">文件管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-main class="dashboard-main">
          <div class="welcome-section">
            <el-card>
              <div slot="header">
                <span>欢迎回来，{{ userInfo.username || '用户' }}！</span>
              </div>
              <div class="welcome-content">
                <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
                <el-row :gutter="20" class="stats-row">
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ stats.totalFiles }}</div>
                      <div class="stat-label">总文件数</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ stats.recentFiles }}</div>
                      <div class="stat-label">最近编辑</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ stats.totalSize }}</div>
                      <div class="stat-label">总大小(MB)</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-card">
                      <div class="stat-number">{{ stats.lastLogin }}</div>
                      <div class="stat-label">最后登录</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </div>

          <div class="quick-actions">
            <el-card>
              <div slot="header">
                <span>快速操作</span>
              </div>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-button type="primary" icon="el-icon-plus" @click="createNewFile" size="large" block>
                    创建新文件
                  </el-button>
                </el-col>
                <el-col :span="8">
                  <el-button type="success" icon="el-icon-upload" @click="uploadFile" size="large" block>
                    上传文件
                  </el-button>
                </el-col>
                <el-col :span="8">
                  <el-button type="warning" icon="el-icon-folder-add" @click="createFolder" size="large" block>
                    新建文件夹
                  </el-button>
                </el-col>
              </el-row>
            </el-card>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { logout } from '@/api/user'

export default {
  name: 'Dashboard',
  data() {
    return {
      activeMenu: '/dashboard',
      userInfo: {},
      currentDate: '',
      stats: {
        totalFiles: 25,
        recentFiles: 8,
        totalSize: 156,
        lastLogin: '今天'
      }
    }
  },
  created() {
    this.getCurrentDate()
    this.getUserInfoFromStorage()
  },
  methods: {
    getCurrentDate() {
      const now = new Date()
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      }
      this.currentDate = now.toLocaleDateString('zh-CN', options)
    },
    getUserInfoFromStorage() {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          this.userInfo = JSON.parse(userInfoStr)
        }
      } catch (error) {
        console.error('解析用户信息失败：', error)
        this.userInfo = {}
      }
    },
    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$message.info('个人信息功能开发中...')
          break
        case 'settings':
          this.$message.info('设置功能开发中...')
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },
    async handleLogout() {
      try {
        await logout()
        this.$message.success('退出登录成功')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        this.$router.push('/')
      } catch (error) {
        console.error('退出登录失败：', error)
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        this.$router.push('/')
      }
    },
    handleMenuSelect(index) {
      this.activeMenu = index
      this.$message.info(`选择了菜单：${index}`)
    },
    createNewFile() {
      this.$message.info('创建新文件功能开发中...')
    },
    uploadFile() {
      this.$message.info('上传文件功能开发中...')
    },
    createFolder() {
      this.$message.info('新建文件夹功能开发中...')
    }
  }
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
}

.dashboard-header {
  background-color: #409EFF;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: white;
}

.username {
  margin: 0 8px;
}

.dashboard-sidebar {
  background-color: #304156;
  height: calc(100vh - 60px);
}

.sidebar-menu {
  border-right: none;
}

.dashboard-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-content {
  line-height: 1.6;
}

.stats-row {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.quick-actions {
  margin-bottom: 20px;
}

.el-menu-item {
  border-left: 3px solid transparent;
}

.el-menu-item.is-active {
  border-left-color: #409EFF;
  background-color: #263445 !important;
}
</style>
