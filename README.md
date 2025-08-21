# Markdown Frontend

基于Vue2 + Vue CLI的前端项目模板

## 技术栈

- Vue 2.6.14
- Vue Router 3.5.1
- Vuex 3.6.2
- Element UI 2.15.13
- Axios 0.27.2

## 项目结构

```
src/
├── api/          # API接口
├── router/       # 路由配置
├── store/        # Vuex状态管理
├── utils/        # 工具函数
├── views/        # 页面组件
├── App.vue       # 根组件
└── main.js       # 入口文件
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 功能特性

- 完整的路由系统
- 状态管理
- HTTP请求封装
- 请求/响应拦截器
- 错误处理
- UI组件库
