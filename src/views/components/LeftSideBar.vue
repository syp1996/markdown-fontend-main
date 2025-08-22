<template>
  <div class="left-side">
    <!-- <div class="sidebar-header">
      <h3>导航菜单</h3>
    </div> -->
    
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      @select="handleMenuSelect"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF">
      
      <!-- 首页 -->
      <el-menu-item index="home">
        <i class="el-icon-s-home"></i>
        <span slot="title">首页</span>
      </el-menu-item>
      
      <!-- 文件管理 -->
      <el-submenu index="files">
        <template slot="title">
          <i class="el-icon-folder"></i>
          <span>文件管理</span>
        </template>
        <el-menu-item :index="'file-list'+item.id" v-for="item in documents" :key="item.id">
          <i class="el-icon-document"></i>
          <span>{{ item.title }}</span>
        </el-menu-item>
        <!-- <el-menu-item index="file-upload">
          <i class="el-icon-upload"></i>
          <span>上传文件</span>
        </el-menu-item>
        <el-menu-item index="file-category">
          <i class="el-icon-collection"></i>
          <span>文件分类</span>
        </el-menu-item> -->
      </el-submenu>
      
      <!-- 文档编辑 -->
      <el-submenu index="editor">
        <template slot="title">
          <i class="el-icon-edit"></i>
          <span>文档编辑</span>
        </template>
        <el-menu-item index="markdown-editor">
          <i class="el-icon-edit-outline"></i>
          <span>Markdown编辑器</span>
        </el-menu-item>
        <el-menu-item index="rich-editor">
          <i class="el-icon-edit-pen"></i>
          <span>富文本编辑器</span>
        </el-menu-item>
        <el-menu-item index="code-editor">
          <i class="el-icon-cpu"></i>
          <span>代码编辑器</span>
        </el-menu-item>
      </el-submenu>
      
      <!-- 项目管理 -->
      <el-submenu index="projects">
        <template slot="title">
          <i class="el-icon-s-cooperation"></i>
          <span>项目管理</span>
        </template>
        <el-menu-item index="project-list">
          <i class="el-icon-s-order"></i>
          <span>项目列表</span>
        </el-menu-item>
        <el-menu-item index="project-create">
          <i class="el-icon-plus"></i>
          <span>创建项目</span>
        </el-menu-item>
        <el-menu-item index="project-templates">
          <i class="el-icon-document-copy"></i>
          <span>项目模板</span>
        </el-menu-item>
      </el-submenu>
      
      <!-- 用户中心 -->
      <el-submenu index="user">
        <template slot="title">
          <i class="el-icon-user"></i>
          <span>用户中心</span>
        </template>
        <el-menu-item index="profile">
          <i class="el-icon-s-custom"></i>
          <span>个人资料</span>
        </el-menu-item>
        <el-menu-item index="settings">
          <i class="el-icon-setting"></i>
          <span>系统设置</span>
        </el-menu-item>
        <el-menu-item index="preferences">
          <i class="el-icon-s-tools"></i>
          <span>偏好设置</span>
        </el-menu-item>
      </el-submenu>
      
      <!-- 帮助支持 -->
      <el-submenu index="help">
        <template slot="title">
          <i class="el-icon-question"></i>
          <span>帮助支持</span>
        </template>
        <el-menu-item index="documentation">
          <i class="el-icon-document"></i>
          <span>使用文档</span>
        </el-menu-item>
        <el-menu-item index="faq">
          <i class="el-icon-chat-line-round"></i>
          <span>常见问题</span>
        </el-menu-item>
        <el-menu-item index="contact">
          <i class="el-icon-message"></i>
          <span>联系我们</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import { getDocuments } from '@/api/documents';

export default {
  name: 'LeftSideBar',
  data() {
    return {
      activeMenu: 'home',
      documents: []
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
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #435266;
}

.sidebar-header h3 {
  color: #bfcbd9;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.sidebar-menu {
  border: none;
  width: 100%;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  border-left: 3px solid transparent;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445 !important;
  border-left-color: #409EFF;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #263445 !important;
  border-left-color: #409EFF;
  color: #409EFF !important;
}

.sidebar-menu .el-submenu__title {
  height: 50px;
  line-height: 50px;
  border-left: 3px solid transparent;
}

.sidebar-menu .el-submenu__title:hover {
  background-color: #263445 !important;
  border-left-color: #409EFF;
}

.sidebar-menu .el-submenu.is-active .el-submenu__title {
  color: #409EFF !important;
}

.sidebar-menu .el-menu-item i,
.sidebar-menu .el-submenu__title i {
  margin-right: 10px;
  font-size: 16px;
}

/* 二级菜单样式 */
.sidebar-menu .el-menu--inline .el-menu-item {
  padding-left: 50px !important;
  height: 45px;
  line-height: 45px;
  font-size: 13px;
}

.sidebar-menu .el-menu--inline .el-menu-item:hover {
  background-color: #1f2d3d !important;
}

.sidebar-menu .el-menu--inline .el-menu-item.is-active {
  background-color: #1f2d3d !important;
  color: #409EFF !important;
}
</style>

  