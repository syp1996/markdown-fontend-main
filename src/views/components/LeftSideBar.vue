<template>
  <div class="left-side">
    <!-- <div class="sidebar-header">
      <h3>导航菜单</h3>
    </div> -->
    
    <nav class="sidebar-menu">
      <!-- 首页 -->
      <div class="menu-item" :class="{ active: activeMenu === 'home' }" @click="handleMenuSelect('home')">
        <i class="menu-icon">🏠</i>
        <span class="menu-title">首页</span>
      </div>
      
      <!-- 文件管理 -->
      <div class="menu-group">
        <div class="menu-header" @click="toggleSubmenu('files')">
          <i class="menu-icon">📁</i>
          <span class="menu-title">文件管理</span>
          <i class="submenu-arrow" :class="{ 'expanded': openSubmenus.includes('files') }">▶</i>
        </div>
        <div class="submenu" :class="{ 'expanded': openSubmenus.includes('files') }">
          <div 
            class="submenu-item" 
            :class="{ active: activeMenu === 'file-list'}" 
            @click="handleMenuSelect('file-list')"
          >
            <i class="submenu-icon">📄</i>
            <span>文件管理</span>
          </div>
        </div>
      </div>
      
      <!-- 文档编辑 -->
      <div class="menu-group">
        <div class="menu-header" @click="toggleSubmenu('editor')">
          <i class="menu-icon">✏️</i>
          <span class="menu-title">文档编辑</span>
          <i class="submenu-arrow" :class="{ 'expanded': openSubmenus.includes('editor') }">▶</i>
        </div>
        <div class="submenu" :class="{ 'expanded': openSubmenus.includes('editor') }">
          <div class="submenu-item" :class="{ active: activeMenu === 'markdown-editor' }" @click="handleMenuSelect('markdown-editor')">
            <i class="submenu-icon">📝</i>
            <span>Markdown编辑器</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'rich-editor' }" @click="handleMenuSelect('rich-editor')">
            <i class="submenu-icon">✒️</i>
            <span>富文本编辑器</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'code-editor' }" @click="handleMenuSelect('code-editor')">
            <i class="submenu-icon">💻</i>
            <span>代码编辑器</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'universal-compiler' }" @click="handleMenuSelect('universal-compiler')">
            <i class="submenu-icon">🚀</i>
            <span>统一编译器</span>
          </div>
        </div>
      </div>
      
      <!-- 项目管理 -->
      <div class="menu-group">
        <div class="menu-header" @click="toggleSubmenu('projects')">
          <i class="menu-icon">👥</i>
          <span class="menu-title">项目管理</span>
          <i class="submenu-arrow" :class="{ 'expanded': openSubmenus.includes('projects') }">▶</i>
        </div>
        <div class="submenu" :class="{ 'expanded': openSubmenus.includes('projects') }">
          <div class="submenu-item" :class="{ active: activeMenu === 'project-list' }" @click="handleMenuSelect('project-list')">
            <i class="submenu-icon">📋</i>
            <span>项目列表</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'project-create' }" @click="handleMenuSelect('project-create')">
            <i class="submenu-icon">➕</i>
            <span>创建项目</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'project-templates' }" @click="handleMenuSelect('project-templates')">
            <i class="submenu-icon">📋</i>
            <span>项目模板</span>
          </div>
        </div>
      </div>
      
      <!-- 用户中心 -->
      <div class="menu-group">
        <div class="menu-header" @click="toggleSubmenu('user')">
          <i class="menu-icon">👤</i>
          <span class="menu-title">用户中心</span>
          <i class="submenu-arrow" :class="{ 'expanded': openSubmenus.includes('user') }">▶</i>
        </div>
        <div class="submenu" :class="{ 'expanded': openSubmenus.includes('user') }">
          <div class="submenu-item" :class="{ active: activeMenu === 'profile' }" @click="handleMenuSelect('profile')">
            <i class="submenu-icon">👤</i>
            <span>个人资料</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'settings' }" @click="handleMenuSelect('settings')">
            <i class="submenu-icon">⚙️</i>
            <span>系统设置</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'preferences' }" @click="handleMenuSelect('preferences')">
            <i class="submenu-icon">🔧</i>
            <span>偏好设置</span>
          </div>
        </div>
      </div>
      
      <!-- 帮助支持 -->
      <div class="menu-group">
        <div class="menu-header" @click="toggleSubmenu('help')">
          <i class="menu-icon">❓</i>
          <span class="menu-title">帮助支持</span>
          <i class="submenu-arrow" :class="{ 'expanded': openSubmenus.includes('help') }">▶</i>
        </div>
        <div class="submenu" :class="{ 'expanded': openSubmenus.includes('help') }">
          <div class="submenu-item" :class="{ active: activeMenu === 'documentation' }" @click="handleMenuSelect('documentation')">
            <i class="submenu-icon">📚</i>
            <span>使用文档</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'faq' }" @click="handleMenuSelect('faq')">
            <i class="submenu-icon">💬</i>
            <span>常见问题</span>
          </div>
          <div class="submenu-item" :class="{ active: activeMenu === 'contact' }" @click="handleMenuSelect('contact')">
            <i class="submenu-icon">📧</i>
            <span>联系我们</span>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { getDocuments } from '@/api/documents';

export default {
  name: 'LeftSideBar',
  data() {
    return {
      activeMenu: 'home',
      documents: [],
      openSubmenus: ['files'] // 默认展开文件管理菜单
    }
  },
  created() {
    getDocuments().then(res => {
      console.log(res)
      this.documents = res.items || []
    })
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index
      // 向父组件发送菜单选择事件
      this.$emit('menu-select', index)
      console.log('选择了菜单:', index)
    },
    toggleSubmenu(menuKey) {
      const index = this.openSubmenus.indexOf(menuKey)
      if (index > -1) {
        this.openSubmenus.splice(index, 1)
      } else {
        this.openSubmenus.push(menuKey)
        // 确保展开的菜单能够正确显示
        this.$nextTick(() => {
          // 如果展开的是文件管理菜单，确保滚动条正常工作
          if (menuKey === 'files' && this.documents.length > 8) {
            // 当文档数量较多时，确保菜单可以滚动
            const submenu = document.querySelector('.submenu.expanded')
            if (submenu) {
              submenu.style.maxHeight = '60vh'
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.left-side {
  width: 250px;
  height: 100%;
  background-color: #304156;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-menu {
  width: 100%;
  flex: 1;
  overflow-y: auto; /* 添加垂直滚动 */
  overflow-x: hidden; /* 隐藏水平滚动 */
}

/* 自定义侧边栏滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #304156;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #435266;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #5a6c7d;
}

/* 一级菜单项样式 */
.menu-item {
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  color: #bfcbd9;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background-color: #263445;
  border-left-color: #409EFF;
}

.menu-item.active {
  background-color: #263445;
  border-left-color: #409EFF;
  color: #409EFF;
}

/* 菜单组样式 */
.menu-group {
  border-bottom: 1px solid #435266;
}

.menu-header {
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  color: #bfcbd9;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-header:hover {
  background-color: #263445;
  border-left-color: #409EFF;
}

.submenu-arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.submenu-arrow.expanded {
  transform: rotate(90deg);
}

/* 二级菜单样式 */
.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: #1f2d3d;
}

.submenu.expanded {
  max-height: 60vh; /* 使用视口高度的60%作为最大高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
}

/* 自定义滚动条样式 */
.submenu.expanded::-webkit-scrollbar {
  width: 6px;
}

.submenu.expanded::-webkit-scrollbar-track {
  background: #1f2d3d;
}

.submenu.expanded::-webkit-scrollbar-thumb {
  background: #435266;
  border-radius: 3px;
}

.submenu.expanded::-webkit-scrollbar-thumb:hover {
  background: #5a6c7d;
}

.submenu-item {
  height: 45px;
  line-height: 45px;
  padding: 0 20px 0 50px;
  color: #bfcbd9;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.submenu-item:hover {
  background-color: #263445;
  color: #409EFF;
}

.submenu-item.active {
  background-color: #263445;
  color: #409EFF;
}

.submenu-item span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 图标样式 */
.menu-icon, .submenu-icon {
  margin-right: 10px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-title {
  flex: 1;
}
</style>

  