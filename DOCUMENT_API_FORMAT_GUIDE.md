# 文档API数据格式规范

根据后端的 `DocumentUpdate` 模型，前端发送文档更新请求时需要遵循以下数据格式规范。

## 后端期望的字段格式

### DocumentUpdate 模型字段
- `title` (可选): string - 文档标题
- `excerpt` (可选): string - 文档摘要  
- `content` (可选): Dict[str, Any] - 文档内容JSON对象
- `slug` (可选): string - 文档slug
- `status` (可选): string - 文档状态
- `is_pinned` (可选): boolean - 是否置顶
- `category_id` (可选): integer - 分类ID

## ✅ 正确的数据格式

### 更新文档内容 (HTML格式)
```javascript
const updateData = {
  content: {
    html: "<p>文档内容的HTML代码</p>",
    type: "html"
  }
}

await updateDocument(documentId, updateData)
```

### 更新文档内容 (Markdown格式)
```javascript
const updateData = {
  content: {
    markdown: "# 标题\n\n文档的Markdown内容",
    type: "markdown"
  }
}

await updateDocument(documentId, updateData)
```

### 更新文档的多个字段
```javascript
const updateData = {
  title: "新的文档标题",
  excerpt: "文档摘要",
  content: {
    html: "<p>更新的内容</p>",
    type: "html"
  },
  status: "published",
  is_pinned: false
}

await updateDocument(documentId, updateData)
```

### 创建新文档 (将来实现时使用)
```javascript
const createData = {
  title: "新文档标题",
  excerpt: "文档摘要",
  content: {
    html: "<p>初始内容</p>",
    type: "html"
  },
  status: "draft",
  is_pinned: false,
  category_id: 1
}

await createDocument(createData)
```

## ❌ 错误的数据格式

### 错误1: 发送不存在的字段
```javascript
// ❌ 错误：updatedAt字段不存在于DocumentUpdate模型中
const wrongData = {
  content: "<p>内容</p>",
  updatedAt: new Date().toISOString()  // 此字段不被后端接受
}
```

### 错误2: content字段格式错误
```javascript
// ❌ 错误：content应该是JSON对象，不是字符串
const wrongData = {
  content: "<p>HTML字符串</p>"  // 应该是对象格式
}
```

## 修复记录

### 已修复的问题
1. **TiptapEditor.vue**: 修复了 `performAutoSave` 方法中的数据格式问题
   - 移除了 `updatedAt` 字段
   - 将 `content` 字段从字符串格式改为JSON对象格式

### 修复前的错误代码
```javascript
// 修复前 - 错误格式
const saveData = {
  content: content,  // 直接发送HTML字符串
  updatedAt: new Date().toISOString()  // 不存在的字段
}
```

### 修复后的正确代码
```javascript
// 修复后 - 正确格式
const saveData = {
  content: {
    html: content,
    type: "html"
  }
}
```

## 注意事项

1. **content字段**: 始终作为JSON对象发送，包含实际内容和类型信息
2. **字段验证**: 只发送后端模型中定义的字段
3. **可选字段**: 未修改的字段可以不包含在请求中
4. **类型安全**: 确保字段类型与后端模型匹配

## 推荐实践

1. 在发送请求前验证数据格式
2. 为不同类型的内容（HTML、Markdown等）提供统一的格式化函数
3. 记录API调用日志以便调试
4. 实现错误处理以应对后端验证失败
