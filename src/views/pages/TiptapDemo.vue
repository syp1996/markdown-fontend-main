<template>
  <div class="tiptap-demo">
    <div class="demo-header">
      <h1>Tiptap 编辑器演示</h1>
      <p>这是一个基于 Tiptap 的富文本编辑器组件演示</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h3>基础 HTML 编辑器</h3>
        <TiptapEditor
          v-model="content1"
          placeholder="开始输入您的内容..."
          height="300px"
          format="html"
          @change="onContent1Change"
        />
        <div class="content-preview">
          <h4>HTML 预览:</h4>
          <pre>{{ content1 }}</pre>
        </div>
        <div class="html-preview">
          <h4>渲染效果:</h4>
          <div v-html="content1"></div>
        </div>
      </div>

      <div class="demo-section">
        <h3>纯文本模式编辑器</h3>
        <TiptapEditor
          v-model="content2"
          placeholder="这个编辑器输出纯文本..."
          height="250px"
          format="text"
          @change="onContent2Change"
        />
        <div class="content-preview">
          <h4>文本预览:</h4>
          <pre>{{ content2 }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h3>JSON 格式编辑器</h3>
        <TiptapEditor
          v-model="content3"
          placeholder="JSON 格式存储编辑器状态..."
          height="200px"
          format="json"
          @change="onContent3Change"
        />
        <div class="content-preview">
          <h4>JSON 预览:</h4>
          <pre>{{ content3 }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h3>无工具栏编辑器</h3>
        <TiptapEditor
          v-model="content4"
          placeholder="专注写作模式..."
          height="200px"
          :show-toolbar="false"
          @change="onContent4Change"
        />
        <div class="content-preview">
          <h4>内容预览:</h4>
          <pre>{{ content4 }}</pre>
        </div>
      </div>

      <div class="demo-controls">
        <h3>编辑器控制</h3>
        <div class="control-buttons">
          <button @click="clearAllEditors" class="btn btn-danger">
            清空所有编辑器
          </button>
          <button @click="loadSampleContent" class="btn btn-primary">
            加载示例内容
          </button>
          <button @click="exportContent" class="btn btn-success">
            导出内容
          </button>
          <button @click="copyHtml" class="btn btn-info">
            复制 HTML
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h3>功能说明</h3>
        <div class="feature-list">
          <h4>🎯 完整功能列表：</h4>
          <div class="feature-grid">
            <div class="feature-category">
              <h5>📝 文本格式</h5>
              <ul>
                <li>✅ 粗体、斜体、<u>下划线</u>、删除线</li>
                <li>✅ <span style="color: #e74c3c">文本颜色</span> 自定义</li>
                <li>✅ <mark style="background: #ffeb3b">背景高亮</mark></li>
                <li>✅ 上标<sup>2</sup> 和下标<sub>2</sub></li>
                <li>✅ <code>行内代码</code> 高亮</li>
              </ul>
            </div>
            
            <div class="feature-category">
              <h5>📐 布局与对齐</h5>
              <ul>
                <li>✅ ⬅️ 左对齐、↔️ 居中、➡️ 右对齐</li>
                <li>✅ ↕️ 两端对齐</li>
                <li>✅ H1-H6 多级标题</li>
                <li>✅ 有序/无序列表</li>
                <li>✅ ☑️ 任务列表（可勾选）</li>
              </ul>
            </div>
            
            <div class="feature-category">
              <h5>🖼️ 多媒体内容</h5>
              <ul>
                <li>✅ 🔗 超链接插入和编辑</li>
                <li>✅ 🖼️ 图片上传和显示</li>
                <li>✅ 📊 表格创建和编辑</li>
                <li>✅ 💻 代码块（语法高亮）</li>
                <li>✅ ➖ 水平分割线</li>
              </ul>
            </div>
            
            <div class="feature-category">
              <h5>⚡ 高级功能</h5>
              <ul>
                <li>✅ 🎈 气泡菜单（选中文本时）</li>
                <li>✅ 📋 浮动菜单（空行时）</li>
                <li>✅ 📊 实时字符/词数统计</li>
                <li>✅ 🔄 撤销/重做功能</li>
                <li>✅ ⌨️ 键盘快捷键支持</li>
              </ul>
            </div>
            
            <div class="feature-category">
              <h5>🔧 技术特性</h5>
              <ul>
                <li>✅ 📤 多种输出格式（HTML、Text、JSON）</li>
                <li>✅ 🎨 可自定义工具栏和样式</li>
                <li>✅ 📱 响应式设计</li>
                <li>✅ ⚛️ Vue 3 响应式集成</li>
                <li>✅ 🧩 模块化可扩展设计</li>
              </ul>
            </div>
            
            <div class="feature-category">
              <h5>✨ 排版优化</h5>
              <ul>
                <li>✅ 自动符号转换（→ © ™）</li>
                <li>✅ 智能引号处理</li>
                <li>✅ 引用块美化</li>
                <li>✅ 段落间距优化</li>
                <li>✅ 出色的性能表现</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="keyboard-shortcuts">
          <h4>键盘快捷键：</h4>
          <div class="shortcuts-grid">
            <div class="shortcut-item">
              <kbd>Ctrl/Cmd + B</kbd>
              <span>加粗</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl/Cmd + I</kbd>
              <span>斜体</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl/Cmd + U</kbd>
              <span>删除线</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl/Cmd + Z</kbd>
              <span>撤销</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl/Cmd + Shift + Z</kbd>
              <span>重做</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TiptapEditor from '@/components/TiptapEditor.vue';

export default {
  name: 'TiptapDemo',
  components: {
    TiptapEditor
  },
  data() {
    return {
      content1: '',
      content2: '',
      content3: '',
      content4: '',
      sampleHtml: `<h1 style="text-align: center">🎉 完整功能版 Tiptap 编辑器！</h1>
<p>这是一个功能强大的富文本编辑器，包含<strong>所有免费功能</strong>！</p>

<h2>📝 文本格式功能</h2>
<ul>
  <li><strong>粗体</strong> 和 <em>斜体</em> 文本</li>
  <li><u>下划线</u> 和 <s>删除线</s> 格式</li>
  <li><span style="color: #e74c3c">彩色文本</span> 和 <mark class="tiptap-highlight">背景高亮</mark></li>
  <li>化学公式：H<sub>2</sub>O 和数学公式：E=mc<sup>2</sup></li>
  <li><code>行内代码</code> 高亮</li>
</ul>

<h2>📊 结构化内容</h2>
<p>支持多种对齐方式：</p>
<p style="text-align: left">⬅️ 左对齐文本</p>
<p style="text-align: center">↔️ 居中对齐文本</p>
<p style="text-align: right">➡️ 右对齐文本</p>

<h3>任务列表示例</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">✅ 实现基础文本格式</li>
  <li data-type="taskItem" data-checked="true">✅ 添加表格功能</li>
  <li data-type="taskItem" data-checked="false">⬜ 持续优化用户体验</li>
</ul>

<h3>代码块演示</h3>
<pre class="tiptap-code-block"><code>function greetUser(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to Tiptap Editor!\`;
}</code></pre>

<hr>

<h3>功能对比表格</h3>
<table>
  <tr>
    <th>功能类别</th>
    <th>包含功能</th>
    <th>状态</th>
  </tr>
  <tr>
    <td>文本格式</td>
    <td>粗体、斜体、下划线、删除线、颜色、高亮</td>
    <td>✅ 完成</td>
  </tr>
  <tr>
    <td>结构元素</td>
    <td>标题、列表、任务列表、引用、代码块</td>
    <td>✅ 完成</td>
  </tr>
  <tr>
    <td>多媒体</td>
    <td>链接、图片、表格</td>
    <td>✅ 完成</td>
  </tr>
  <tr>
    <td>高级功能</td>
    <td>气泡菜单、浮动菜单、字符统计、对齐</td>
    <td>✅ 完成</td>
  </tr>
</table>

<blockquote>
  <p>🚀 现在您拥有了一个功能完整、专业级的富文本编辑器！</p>
</blockquote>

<p><a href="https://tiptap.dev" class="tiptap-link">了解更多 Tiptap 功能</a></p>`,
      sampleText: `欢迎使用 Tiptap 编辑器！

这是一个基于 ProseMirror 的现代富文本编辑器。

主要特性：
- 模块化设计 - 按需引入功能
- 丰富的扩展 - 支持各种文本格式
- 开发者友好 - 易于集成和定制
- 出色的性能 - 流畅的编辑体验

开始体验吧！`,
      sampleJson: '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"JSON 格式演示"}]},{"type":"paragraph","content":[{"type":"text","text":"Tiptap 支持以 JSON 格式存储编辑器状态。"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"结构化数据存储"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"版本控制友好"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"易于数据处理"}]}]}]}]}',
      focusContent: `专注写作模式

在这个模式下没有工具栏干扰，
让您专注于内容创作。

适合用于：
- 长文写作
- 思维整理
- 快速记录`
    }
  },
  methods: {
    onContent1Change(content) {
      console.log('HTML内容变化:', content);
    },
    onContent2Change(content) {
      console.log('文本内容变化:', content);
    },
    onContent3Change(content) {
      console.log('JSON内容变化:', content);
    },
    onContent4Change(content) {
      console.log('专注模式内容变化:', content);
    },
    clearAllEditors() {
      this.content1 = '';
      this.content2 = '';
      this.content3 = '';
      this.content4 = '';
      if (this.$message) {
        this.$message.success('所有编辑器已清空');
      } else {
        alert('所有编辑器已清空');
      }
    },
    loadSampleContent() {
      this.content1 = this.sampleHtml;
      this.content2 = this.sampleText;
      this.content3 = this.sampleJson;
      this.content4 = this.focusContent;
      if (this.$message) {
        this.$message.success('示例内容已加载');
      } else {
        alert('示例内容已加载');
      }
    },
    exportContent() {
      const exportData = {
        html: this.content1,
        text: this.content2,
        json: this.content3,
        focus: this.content4,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiptap-content-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (this.$message) {
        this.$message.success('内容已导出');
      } else {
        alert('内容已导出');
      }
    },
    async copyHtml() {
      try {
        await navigator.clipboard.writeText(this.content1);
        if (this.$message) {
          this.$message.success('HTML 内容已复制到剪贴板');
        } else {
          alert('HTML 内容已复制到剪贴板');
        }
      } catch (err) {
        console.error('复制失败:', err);
        if (this.$message) {
          this.$message.error('复制失败');
        } else {
          alert('复制失败');
        }
      }
    }
  }
}
</script>

<style scoped>
.tiptap-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 28px;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.demo-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section h3 {
  color: #34495e;
  margin-bottom: 15px;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 8px;
}

.content-preview {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.content-preview h4 {
  color: #495057;
  margin-bottom: 10px;
  font-size: 14px;
}

.content-preview pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.html-preview {
  margin-top: 15px;
  padding: 15px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.html-preview h4 {
  color: #495057;
  margin-bottom: 10px;
  font-size: 14px;
}

.html-preview div {
  min-height: 50px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.demo-controls {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.control-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.feature-list {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.feature-list h4 {
  color: #495057;
  margin-bottom: 15px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.feature-category {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
}

.feature-category h5 {
  color: #495057;
  margin-bottom: 10px;
  font-size: 16px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 5px;
}

.feature-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-category li {
  padding: 4px 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.4;
}

.feature-list ul {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 5px 0;
  color: #495057;
}

.keyboard-shortcuts {
  background: #e9ecef;
  padding: 20px;
  border-radius: 6px;
}

.keyboard-shortcuts h4 {
  color: #495057;
  margin-bottom: 15px;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shortcut-item kbd {
  background: #343a40;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  border: 1px solid #495057;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.shortcut-item span {
  color: #495057;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tiptap-demo {
    padding: 15px;
  }
  
  .demo-header h1 {
    font-size: 24px;
  }
  
  .demo-section {
    padding: 15px;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
