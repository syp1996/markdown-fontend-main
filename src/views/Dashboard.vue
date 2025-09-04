<template>
  <div class="dashboard">
    <Topbar class="top-bar" @command="handleCommand" />
    <div class="dashboard-content">
      <LeftSideBar class="left-side" @menu-select="handleMenuSelect"/>
      <MainContent class="main-content"/>
    </div>
    <!-- 搜索弹窗 -->
    <SearchModal 
      :visible="showSearchModal" 
      @close="closeSearchModal"
      @select-result="handleSearchResult"
    />
  </div>
</template>

<script>
import { getDocuments } from '@/api/documents'
import { logout } from '@/api/user'
import LeftSideBar from './components/LeftSideBar.vue'
import MainContent from './components/MainContent.vue'
import Topbar from './components/Topbar.vue'
import SearchModal from '@/components/SearchModal.vue'

export default {
  name: 'DashboardPage',
  components: {
      LeftSideBar,
      Topbar,
      MainContent,
      SearchModal
  },
  data() {
      return {
      documents: [],
      activeMenu: 'home',
      userInfo: {},
      currentDate: '',
      showSearchModal: false, // 控制搜索弹窗显示
      stats: {
        totalFiles: 25,
        recentFiles: 8,
        totalSize: 156,
        lastLogin: '今天'
      },
      markdownContent: '',
      markdownPreview: ''
    }
  },
  created() {
    this.getCurrentDate()
      this.getUserInfoFromStorage()
    this.getDocuments()
    },
    methods: {
    getDocuments() {
            getDocuments().then(res => {
            this.documents = res.items
            console.log(res)
        })
    },
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
    handleMenuSelect(menuKey) {
      this.activeMenu = menuKey
      
      // 根据菜单选择导航到相应的路由
      switch (menuKey) {
        case 'search':
          // 打开搜索弹窗
          this.showSearchModal = true
          break

        case 'home':
          this.$router.push('/dashboard/home')
          break

        case 'file-list':
          // 文件列表处理
          this.$router.push('/dashboard/file-manager')
          break

        case 'project-templates':
          // 项目模板处理
          this.$message.info('项目模板功能开发中...')
          break
        default:
          // 处理文件列表项（如 file-list1, file-list2 等）
          if (menuKey.startsWith('file-list')) {
            this.$router.push('/dashboard/file-manager')
          } else {
            this.$router.push('/dashboard/home')
          }
          break
      }
    },
    createNewFile() {
      this.$message.info('新建文件功能开发中...')
    },
    uploadFile() {
      this.activeMenu = 'file-upload'
    },
    createFolder() {
      this.$message.info('新建文件夹功能开发中...')
    },
    handleFileChange(file, fileList) {
      console.log('文件变化：', file, fileList)
      this.$message.success(`文件 ${file.name} 已选择`)
    },
    updatePreview() {
      // 这里可以添加Markdown转HTML的逻辑
      this.markdownPreview = this.markdownContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    },

    // 关闭搜索弹窗
    closeSearchModal() {
      this.showSearchModal = false
    },

    // 处理搜索结果选择
    handleSearchResult(result) {
      console.log('选中搜索结果:', result)
      // 导航到文件管理页面并选中该文件
      this.$router.push('/dashboard/file-manager')
      // 如果结果有ID，可以进一步处理文件选择逻辑
    }
  }
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  flex-shrink: 0;
  z-index: 1000;
}

.left-side {
  flex-shrink: 0;
  margin-top: 2px;
  /* width: 250px; */
}

.main-content {
  flex: 1;
  overflow: hidden;
  margin: 8px 16px;
}

/* 创建水平布局容器 */
.dashboard-content {
  background-color: #F0F2F5;
  display: flex;
  flex: 1;
  height: calc(100vh - 64px); /* 减去top-bar的64px高度 */
  overflow: hidden;
}

/* 确保内容区域可以滚动 */
.main-content {
  padding: 0;
  background-color: #f0f2f5;
  overflow: hidden;
}
</style>
