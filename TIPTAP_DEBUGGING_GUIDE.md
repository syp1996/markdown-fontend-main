# TiptapEditor 自动保存功能调试指南

## 问题诊断

如果自动保存功能没有触发，请按照以下步骤进行排查：

### 1. 检查浏览器控制台

打开浏览器开发者工具的控制台，查看是否有以下日志：

#### 正常工作的日志：
```
TiptapEditor: 用户输入检测到，将在3000ms后检查自动保存
TiptapEditor: 用户停止操作，检查是否需要自动保存
TiptapEditor: 检测到内容变化，开始自动保存文档 (ID: 123)
文档自动保存成功
```

#### 常见错误日志：

**1. 未启用自动保存功能**
```
TiptapEditor: 用户输入监听自动保存未启用 (enableUserInputAutoSave = false)
```
**解决方案**: 确保传递了 `:enable-user-input-auto-save="true"`

**2. 缺少文档ID**
```
TiptapEditor: 未提供documentId，自动保存功能不可用
TiptapEditor: 无法自动保存 - 缺少documentId
```
**解决方案**: 确保传递了有效的 `:document-id="yourDocumentId"`

**3. 内容无变化**
```
TiptapEditor: 内容无变化，跳过自动保存
```
**说明**: 这是正常行为，只有在内容真正发生变化时才会保存

**4. 正在保存中**
```
TiptapEditor: 正在保存中，跳过本次自动保存
```
**说明**: 防止重复保存的保护机制

### 2. 检查组件配置

确保TiptapEditor组件的配置正确：

```vue
<TiptapEditor
  v-model="content"
  :document-id="documentId"                    <!-- 必须：文档ID -->
  :enable-user-input-auto-save="true"         <!-- 必须：启用自动保存 -->
  :user-inactivity-delay="3000"               <!-- 可选：延迟时间 -->
  @save-success="onSaveSuccess"               <!-- 可选：成功回调 -->
  @save-error="onSaveError"                   <!-- 可选：错误回调 -->
/>
```

### 3. 检查必要条件

自动保存需要满足以下所有条件：

1. ✅ `enableUserInputAutoSave` 为 `true`
2. ✅ `documentId` 存在且不为 `null`
3. ✅ 编辑器内容发生了实际变化
4. ✅ 当前没有正在进行的保存操作
5. ✅ 用户停止操作达到指定延迟时间（默认3秒）

### 4. 测试自动保存

#### 在 FileManager 页面测试：
1. 选择一个文件
2. 在编辑器中输入一些内容
3. 停止输入并等待3秒
4. 查看控制台日志和消息提示

#### 在 TiptapDemo 页面测试：
1. 点击"启用自动保存"按钮
2. 在第一个编辑器中输入内容
3. 停止输入并等待3秒
4. 查看控制台日志和消息提示

### 5. 网络和API检查

如果看到保存开始的日志但保存失败：

1. 检查网络连接
2. 确保 `updateDocument` API 端点可用
3. 检查认证token是否有效
4. 查看网络请求的响应状态

### 6. 手动触发保存

如果需要手动触发保存，可以调用：

```javascript
// 获取编辑器组件引用
this.$refs.editor.forceSave()
```

## 常见问题解答

### Q: 为什么我在TiptapDemo中看不到自动保存？
A: TiptapDemo默认关闭了自动保存功能。请点击"启用自动保存"按钮来开启演示。

### Q: 自动保存的延迟时间可以修改吗？
A: 可以，通过 `:user-inactivity-delay` 属性设置，单位为毫秒。

### Q: 如何知道自动保存是否成功？
A: 监听 `@save-success` 和 `@save-error` 事件，或查看浏览器控制台的日志。

### Q: 能否禁用某个编辑器的自动保存？
A: 可以，设置 `:enable-user-input-auto-save="false"` 或不提供 `document-id`。

### Q: 自动保存会影响性能吗？
A: 不会。自动保存使用防抖动机制，只在用户停止操作后触发，且会检查内容是否真正变化。

## 开发者注意事项

1. **调试模式**: 开发时建议开启浏览器控制台查看详细日志
2. **API兼容性**: 确保后端API支持 `updateDocument(id, data)` 格式
3. **错误处理**: 建议实现 `@save-error` 事件处理，给用户适当的错误提示
4. **用户体验**: 可以添加保存状态指示器，让用户知道何时正在保存

## 版本信息

- 自动保存功能添加日期：2024年
- 兼容的TiptapEditor版本：最新版本
- 依赖的API：`@/api/documents.js` 中的 `updateDocument` 方法
