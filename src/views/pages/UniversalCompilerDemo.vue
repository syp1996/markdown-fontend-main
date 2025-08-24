<template>
  <div class="universal-compiler-demo">
    <div class="demo-header">
      <h1>🚀 统一文件编译器演示</h1>
      <p>体验多格式文件的统一编辑和转换功能</p>
    </div>
    
    <div class="demo-content">
      <!-- 文件选择区域 -->
      <div class="file-selection">
        <h3>📁 选择示例文件</h3>
        <div class="sample-files">
          <button 
            v-for="sample in sampleFiles" 
            :key="sample.id"
            class="sample-file-btn"
            :class="{ 'active': selectedSample === sample.id }"
            @click="selectSample(sample)"
          >
            <span class="file-icon">{{ sample.icon }}</span>
            <span class="file-name">{{ sample.name }}</span>
            <span class="file-format">{{ sample.format }}</span>
          </button>
        </div>
      </div>
      
      <!-- 编译器展示区域 -->
      <div class="compiler-showcase">
        <h3>✏️ 文件编译器</h3>
        <div class="compiler-container">
          <UniversalFileCompiler
            v-if="selectedSample"
            :content="currentContent"
            :fileName="selectedSample?.name || '示例文件'"
            :fileFormat="selectedSample?.format || 'text'"
            :readOnly="false"
            @save="handleDemoSave"
            @format-change="handleDemoFormatChange"
          />
          <div v-else class="no-file-selected">
            <div class="placeholder-icon">📄</div>
            <p>请选择一个示例文件来体验编译器功能</p>
          </div>
        </div>
      </div>
      
      <!-- 功能说明区域 -->
      <div class="feature-description">
        <h3>✨ 主要功能</h3>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h4>智能格式检测</h4>
            <p>自动识别文件格式，支持 Markdown、HTML、纯文本等</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✏️</div>
            <h4>统一编辑体验</h4>
            <p>不同格式文件使用一致的编辑界面，降低学习成本</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h4>格式转换</h4>
            <p>支持多种格式间的相互转换，满足不同需求</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <h4>实时保存</h4>
            <p>编辑过程中自动检测变化，支持一键保存</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📤</div>
            <h4>多格式导出</h4>
            <p>支持导出为不同格式，方便分享和分发</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👁️</div>
            <h4>实时预览</h4>
            <p>Markdown 编辑时提供实时预览，所见即所得</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UniversalFileCompiler from '@/components/UniversalFileCompiler.vue'

export default {
  name: 'UniversalCompilerDemo',
  components: {
    UniversalFileCompiler
  },
  data() {
    return {
      selectedSample: null,
      sampleFiles: [
        {
          id: 1,
          name: 'README.md',
          format: 'markdown',
          icon: '📝',
          content: `# 项目介绍

这是一个基于 Vue.js 的统一文件编译器演示项目。

## 主要特性

- 🚀 **智能格式检测** - 自动识别文件格式
- ✏️ **统一编辑体验** - 一致的编辑界面
- 🔄 **格式转换** - 支持多种格式转换
- 💾 **实时保存** - 自动检测变化
- 📤 **多格式导出** - 灵活的输出选项

## 使用方法

1. 选择示例文件
2. 体验编辑功能
3. 尝试格式转换
4. 导出不同格式

## 技术栈

- Vue.js 3
- Marked.js (Markdown 解析)
- 自定义格式转换工具

---

*最后更新: 2024年1月*`
        },
        {
          id: 2,
          name: '项目计划.html',
          format: 'html',
          icon: '🌐',
          content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目开发计划</title>
</head>
<body>
    <h1>项目开发计划</h1>
    
    <h2>第一阶段：基础架构</h2>
    <ul>
        <li>项目初始化</li>
        <li>基础组件开发</li>
        <li>路由配置</li>
    </ul>
    
    <h2>第二阶段：核心功能</h2>
    <ul>
        <li>文件编译器开发</li>
        <li>格式转换工具</li>
        <li>编辑功能实现</li>
    </ul>
    
    <h2>第三阶段：优化完善</h2>
    <ul>
        <li>性能优化</li>
        <li>用户体验改进</li>
        <li>测试和文档</li>
    </ul>
    
    <p><strong>预计完成时间：</strong> 2024年3月</p>
</body>
</html>`
        },
        {
          id: 3,
          name: '会议记录.txt',
          format: 'text',
          icon: '📃',
          content: `项目开发会议记录

会议时间：2024年1月15日 14:00-16:00
会议地点：线上会议室
主持人：项目经理
参会人员：开发团队全体成员

会议议题：
1. 统一文件编译器设计方案讨论
2. 技术选型和架构确定
3. 开发计划制定
4. 任务分配

讨论要点：
- 支持的文件格式：Markdown、HTML、纯文本
- 编辑功能：实时预览、格式转换、多格式导出
- 技术实现：Vue.js + 自定义转换工具
- 用户体验：统一的编辑界面、智能格式检测

决议事项：
1. 采用统一编译器方案
2. 优先实现核心编辑功能
3. 逐步完善格式转换能力
4. 注重用户体验和界面一致性

下一步行动：
- 开发团队开始技术调研
- 设计团队完善界面设计
- 产品团队细化功能需求

会议结束时间：16:00`
        },
        {
          id: 4,
          name: '技术文档.md',
          format: 'markdown',
          icon: '📚',
          content: `# 技术文档

## 架构设计

### 前端架构
- **框架**: Vue.js 3 + Composition API
- **路由**: Vue Router 4
- **状态管理**: Vuex 4
- **UI组件**: 自定义组件库

### 核心模块

#### 1. 文件编译器 (UniversalFileCompiler)
\`\`\`vue
<template>
  <div class="universal-file-compiler">
    <!-- 文件头部 -->
    <!-- 内容区域 -->
    <!-- 格式转换面板 -->
  </div>
</template>
\`\`\`

#### 2. 格式转换工具 (FormatConverter)
\`\`\`javascript
export class FormatConverter {
  static markdownToHtml(markdown) { ... }
  static htmlToText(html) { ... }
  static convert(content, from, to) { ... }
}
\`\`\`

## API 接口

### 文件操作
- \`GET /api/documents\` - 获取文件列表
- \`GET /api/documents/:id\` - 获取文件内容
- \`POST /api/documents\` - 创建新文件
- \`PUT /api/documents/:id\` - 更新文件内容
- \`DELETE /api/documents/:id\` - 删除文件

### 格式转换
- \`POST /api/convert\` - 文件格式转换

## 部署说明

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装步骤
\`\`\`bash
npm install
npm run serve
\`\`\`

### 构建部署
\`\`\`bash
npm run build
\`\`\`

## 开发规范

### 代码风格
- 使用 ESLint + Prettier
- 遵循 Vue.js 官方风格指南
- 组件命名采用 PascalCase
- 方法命名采用 camelCase

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动`
        }
      ]
    }
  },
  computed: {
    currentContent() {
      if (!this.selectedSample) return ''
      return this.selectedSample.content
    }
  },
  methods: {
    selectSample(sample) {
      this.selectedSample = sample
      console.log('选择示例文件:', sample)
    },
    
    handleDemoSave(saveData) {
      console.log('演示保存:', saveData)
      this.$message.success(`演示文件保存成功！格式：${saveData.format}`)
    },
    
    handleDemoFormatChange(changeData) {
      console.log('演示格式转换:', changeData)
      this.$message.info(`格式转换演示：${changeData.from} → ${changeData.to}`)
    }
  }
}
</script>

<style scoped>
.universal-compiler-demo {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.demo-header h1 {
  margin: 0 0 16px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.demo-header p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.demo-content {
  display: grid;
  gap: 30px;
}

.file-selection {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-selection h3 {
  margin: 0 0 20px 0;
  color: #17233d;
  font-size: 1.3rem;
}

.sample-files {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.sample-file-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px solid #e8eaec;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.sample-file-btn:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.sample-file-btn.active {
  border-color: #409eff;
  background: #e6f7ff;
}

.sample-file-btn .file-icon {
  font-size: 24px;
}

.sample-file-btn .file-name {
  font-weight: 600;
  color: #17233d;
  flex: 1;
}

.sample-file-btn .file-format {
  font-size: 12px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 12px;
  color: #606266;
}

.compiler-showcase {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.compiler-showcase h3 {
  margin: 0 0 20px 0;
  color: #17233d;
  font-size: 1.3rem;
}

.compiler-container {
  min-height: 600px;
  border: 2px solid #e8eaec;
  border-radius: 8px;
  overflow: hidden;
}

.no-file-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.feature-description {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-description h3 {
  margin: 0 0 24px 0;
  color: #17233d;
  font-size: 1.3rem;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 24px;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h4 {
  margin: 0 0 12px 0;
  color: #17233d;
  font-size: 1.1rem;
}

.feature-card p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .sample-files {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
