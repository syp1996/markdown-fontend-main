# TiptapEditor 组件使用说明

TiptapEditor 是一个基于 Tiptap 的富文本编辑器 Vue 3 组件，提供了丰富的文本编辑功能和良好的用户体验。

## 功能特性

- 🚀 **丰富的文本格式**: 支持粗体、斜体、删除线、行内代码
- 📝 **标题支持**: H1-H3 多级标题
- 📋 **列表功能**: 有序列表和无序列表
- 💬 **引用块**: 支持引用文本格式
- ↩️ **撤销/重做**: 完整的历史记录管理
- 📱 **响应式设计**: 适配移动端和桌面端
- 🎨 **可自定义**: 工具栏、高度、占位符等
- 📤 **多种输出格式**: HTML、纯文本、JSON

## 快速开始

### 基础用法

```vue
<template>
  <TiptapEditor
    v-model="content"
    placeholder="开始输入..."
    height="400px"
    @change="handleChange"
  />
</template>

<script>
import TiptapEditor from '@/components/TiptapEditor.vue'

export default {
  components: {
    TiptapEditor
  },
  data() {
    return {
      content: ''
    }
  },
  methods: {
    handleChange(newContent) {
      console.log('内容变化:', newContent)
    }
  }
}
</script>
```

## 组件属性 (Props)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `modelValue` | String | `''` | 编辑器内容（支持 v-model） |
| `placeholder` | String | `'开始输入...'` | 占位符文本 |
| `height` | String | `'400px'` | 编辑器高度 |
| `showToolbar` | Boolean | `true` | 是否显示工具栏 |
| `format` | String | `'html'` | 输出格式：`'html'`、`'text'`、`'json'` |

## 事件 (Events)

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `(content: string)` | 内容更新时触发 |
| `change` | `(content: string)` | 内容变化时触发 |
| `focus` | - | 编辑器获得焦点时触发 |
| `blur` | - | 编辑器失去焦点时触发 |

## 方法 (Methods)

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `focus()` | - | 让编辑器获得焦点 |
| `blur()` | - | 让编辑器失去焦点 |
| `clearContent()` | - | 清空编辑器内容 |

## 使用示例

### 1. 纯文本模式

```vue
<TiptapEditor
  v-model="textContent"
  format="text"
  placeholder="输入纯文本..."
/>
```

### 2. 无工具栏模式

```vue
<TiptapEditor
  v-model="content"
  :show-toolbar="false"
  placeholder="专注写作模式..."
/>
```

### 3. JSON 格式输出

```vue
<TiptapEditor
  v-model="jsonContent"
  format="json"
  placeholder="结构化数据存储..."
/>
```

### 4. 自定义高度

```vue
<TiptapEditor
  v-model="content"
  height="600px"
  placeholder="更大的编辑区域..."
/>
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + B` | 切换粗体 |
| `Ctrl/Cmd + I` | 切换斜体 |
| `Ctrl/Cmd + U` | 切换删除线 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |

## 工具栏功能

| 按钮 | 功能 | 描述 |
|------|------|------|
| **B** | 粗体 | 将选中文本设为粗体 |
| *I* | 斜体 | 将选中文本设为斜体 |
| ~~S~~ | 删除线 | 将选中文本添加删除线 |
| `</>` | 行内代码 | 将选中文本标记为代码 |
| H1/H2/H3 | 标题 | 设置不同级别的标题 |
| • 列表 | 无序列表 | 创建项目符号列表 |
| 1. 列表 | 有序列表 | 创建编号列表 |
| " 引用 | 引用块 | 创建引用文本块 |
| ↶ 撤销 | 撤销 | 撤销上一个操作 |
| ↷ 重做 | 重做 | 重做上一个撤销的操作 |
| 🗑️ 清空 | 清空 | 清空所有内容 |

## 样式自定义

组件使用 CSS 变量，您可以通过覆盖以下样式来自定义外观：

```css
/* 自定义工具栏背景色 */
.tiptap-editor-container .toolbar {
  background: #f0f0f0;
}

/* 自定义编辑器边框 */
.tiptap-editor-container {
  border: 2px solid #007acc;
}

/* 自定义按钮样式 */
.tiptap-editor-container .format-btn.active {
  background: #28a745;
  border-color: #28a745;
}
```

## 注意事项

1. **依赖要求**: 需要安装 `@tiptap/core`、`@tiptap/vue-3`、`@tiptap/starter-kit`、`@tiptap/extension-placeholder`
2. **Vue 版本**: 仅支持 Vue 3
3. **浏览器兼容性**: 支持现代浏览器，IE 不支持
4. **性能**: 适合中等规模的文档编辑，大型文档建议考虑分页或虚拟化

## 扩展功能

如需添加更多功能（如表格、图片、链接等），可以安装相应的 Tiptap 扩展：

```bash
npm install @tiptap/extension-table @tiptap/extension-image @tiptap/extension-link
```

然后在组件中添加相应的扩展配置。

## 更新日志

- **v1.0.0**: 初始版本，包含基础富文本编辑功能
