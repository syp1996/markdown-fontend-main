# 文档管理系统

一个功能强大的在线文档编辑和管理平台，基于Vue.js构建。

## 🚀 功能特性

### 编辑器功能
- **Markdown编辑器**: 支持Markdown语法，实时预览，语法高亮
- **富文本编辑器**: 功能丰富的富文本编辑，支持多种格式和样式
- **代码编辑器**: 支持多种编程语言，语法高亮，智能提示

### 文件管理
- 文件列表查看
- 文件搜索
- 文件上传
- 文件编辑
- 文件删除

### 项目管理
- 项目列表
- 项目创建
- 项目模板
- 团队协作

### 用户系统
- 用户登录/注册
- 个人资料
- 系统设置
- 主题切换

## 🏗️ 项目结构

```
src/
├── views/
│   ├── components/          # 通用组件
│   │   ├── LeftSideBar.vue  # 左侧边栏
│   │   ├── MainContent.vue  # 主内容区域（路由容器）
│   │   └── Topbar.vue       # 顶部导航栏
│   ├── pages/               # 页面组件
│   │   ├── Home.vue         # 首页
│   │   ├── MarkdownEditor.vue # Markdown编辑器
│   │   ├── RichEditor.vue   # 富文本编辑器
│   │   ├── CodeEditor.vue   # 代码编辑器
│   │   ├── FileManager.vue  # 文件管理
│   │   ├── ProjectList.vue  # 项目列表
│   │   └── UserSettings.vue # 用户设置
│   ├── Dashboard.vue        # 主面板
│   └── Home.vue             # 登录页
├── router/
│   └── index.js             # 路由配置
├── store/
│   └── index.js             # 状态管理
├── api/                     # API接口
└── utils/                   # 工具函数
```

## 🛠️ 技术栈

- **前端框架**: Vue.js 3
- **路由管理**: Vue Router 4
- **状态管理**: Vuex 4
- **构建工具**: Vue CLI
- **样式**: CSS3 + 响应式设计

## 📱 路由系统

### 主要路由
- `/` - 登录页
- `/dashboard` - 主面板（需要登录）
- `/dashboard/home` - 首页
- `/dashboard/markdown-editor` - Markdown编辑器
- `/dashboard/rich-editor` - 富文本编辑器
- `/dashboard/code-editor` - 代码编辑器
- `/dashboard/file-manager` - 文件管理
- `/dashboard/project-list` - 项目列表
- `/dashboard/settings` - 用户设置

### 路由守卫
- 需要登录的页面会自动重定向到登录页
- 已登录用户访问登录页会自动重定向到主面板

## 🎯 使用方法

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run serve
```

### 3. 构建生产版本
```bash
npm run build
```

### 4. 代码检查
```bash
npm run lint
```

## 🔧 开发说明

### 菜单系统
左侧边栏包含以下主要菜单：
- **首页**: 系统概览和快速操作
- **文件管理**: 文档和文件的管理
- **文档编辑**: 各种编辑器
- **项目管理**: 项目相关功能
- **用户中心**: 个人设置和偏好

### 组件通信
- 侧边栏通过 `@menu-select` 事件向父组件发送菜单选择
- 父组件根据菜单选择导航到相应的路由
- 主内容区域使用 `<router-view>` 动态显示不同的页面

### 页面切换
点击侧边栏菜单时：
1. 触发 `handleMenuSelect` 方法
2. 根据菜单键值导航到对应路由
3. 主内容区域自动切换显示相应的页面组件

## 🎨 界面设计

- 采用现代化的扁平设计风格
- 响应式布局，支持各种屏幕尺寸
- 统一的色彩主题和交互效果
- 直观的图标和视觉反馈

## 📝 开发计划

- [x] 基础框架搭建
- [x] 路由系统实现
- [x] 侧边栏菜单
- [x] 主内容区域
- [x] 各种编辑器页面
- [x] 文件管理页面
- [x] 项目列表页面
- [x] 用户设置页面
- [ ] 文件上传功能
- [ ] 数据持久化
- [ ] 用户权限管理
- [ ] 实时协作功能
- [ ] 移动端适配

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 参与讨论

---

**注意**: 这是一个开发中的项目，部分功能可能还在开发中。如有问题，请查看开发计划或提交Issue。
