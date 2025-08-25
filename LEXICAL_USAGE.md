# 富文本编辑器组件使用说明

## 概述

本项目实现了一个基于原生contentEditable的简单富文本编辑器组件，提供基础但实用的文本编辑功能，具有良好的兼容性和稳定性。

## 技术特点

- **轻量级**: 不依赖外部富文本编辑器库，基于原生浏览器API
- **兼容性**: 支持现代浏览器，无需复杂的polyfill
- **Vue 3**: 完全兼容Vue 3的响应式系统
- **可定制**: 支持自定义样式和功能

## 组件位置

- **主组件**: `src/components/SimpleLexicalEditor.vue`
- **演示页面**: `src/views/pages/LexicalDemo.vue`

## 基本使用

### 1. 导入组件

```vue
<script>
import SimpleLexicalEditor from '@/components/SimpleLexicalEditor.vue'

export default {
  components: {
    SimpleLexicalEditor
  }
}
</script>
```

### 2. 基础用法

```vue
<template>
  <SimpleLexicalEditor
    v-model="content"
    placeholder="开始输入..."
    height="400px"
    format="html"
    @change="onContentChange"
  />
</template>

<script>
export default {
  data() {
    return {
      content: ''
    }
  },
  methods: {
    onContentChange(newContent) {
      console.log('内容变化:', newContent)
    }
  }
}
</script>
```

## 组件属性 (Props)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `modelValue` | String | `''` | 编辑器内容，支持 v-model |
| `placeholder` | String | `'开始输入...'` | 占位符文本 |
| `height` | String | `'400px'` | 编辑器高度 |
| `showToolbar` | Boolean | `true` | 是否显示工具栏 |
| `format` | String | `'html'` | 内容格式：`'html'`、`'text'` |

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
| `focus()` | - | 使编辑器获得焦点 |
| `blur()` | - | 使编辑器失去焦点 |
| `clear()` | - | 清空编辑器内容 |

## 工具栏功能

### 文本格式化
- **加粗** (Bold): Ctrl/Cmd + B
- **斜体** (Italic): Ctrl/Cmd + I  
- **下划线** (Underline): Ctrl/Cmd + U

### 列表
- **无序列表**: 创建项目符号列表
- **有序列表**: 创建编号列表

### 其他功能
- **撤销/重做**: Ctrl/Cmd + Z / Ctrl/Cmd + Shift + Z
- **清空内容**: 一键清空所有内容

## 不同格式模式

### 1. HTML 模式 (默认)
```vue
<SimpleLexicalEditor
  v-model="htmlContent"
  format="html"
/>
```
输出 HTML 格式内容，保留富文本格式，适合网页显示和存储。

### 2. 纯文本模式
```vue
<SimpleLexicalEditor
  v-model="textContent"
  format="text"
  :showToolbar="false"
/>
```
仅保留纯文本内容，去除所有格式，适合纯文本编辑。

## 高级配置示例

### 自定义样式
```vue
<SimpleLexicalEditor
  v-model="content"
  height="600px"
  class="custom-editor"
/>

<style>
.custom-editor {
  border: 2px solid #007acc;
  border-radius: 8px;
}
</style>
```

### 监听多种事件
```vue
<SimpleLexicalEditor
  v-model="content"
  @change="onContentChange"
  @focus="onFocus"
  @blur="onBlur"
/>

<script>
export default {
  methods: {
    onContentChange(content) {
      // 自动保存
      this.autoSave(content)
    },
    onFocus() {
      console.log('编辑器获得焦点')
    },
    onBlur() {
      console.log('编辑器失去焦点')
    }
  }
}
</script>
```

## 访问演示页面

启动项目后，访问 `/dashboard/lexical-demo` 可以查看完整的功能演示。

## 注意事项

1. **Vue 3 兼容性**: 组件基于 Vue 3 Options API 开发，完全兼容
2. **浏览器支持**: 支持所有现代浏览器 (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
3. **性能优化**: 轻量级实现，无需额外优化
4. **内容安全**: HTML模式下请注意XSS防护，建议对用户输入进行适当的清理

## 故障排除

### 常见问题

1. **编辑器不显示**
   - 检查是否正确导入组件
   - 确认容器元素有足够高度
   - 检查CSS样式是否冲突

2. **工具栏按钮无效**
   - 确保编辑器获得焦点
   - 检查浏览器是否支持document.execCommand
   - 在某些浏览器中，需要用户先与编辑器交互

3. **格式丢失**
   - HTML模式和文本模式之间切换会丢失格式
   - 确保使用正确的format属性

### 调试建议

开启开发者工具控制台，查看详细错误信息：

```javascript
// 在组件中添加调试信息
console.log('编辑器内容:', this.$refs.editorRef.innerHTML)
console.log('当前格式状态:', this.formatStates)
```

## 扩展功能

如需添加更多功能，可以：

1. **扩展工具栏**: 在组件中添加更多execCommand调用
2. **自定义快捷键**: 在handleKeydown方法中添加更多键盘事件处理
3. **添加插件**: 通过监听编辑器事件来实现自定义功能
4. **整合第三方库**: 如果需要更复杂的功能，可以考虑集成其他富文本编辑器
