<template>
  <div class="lexical-demo">
    <div class="demo-header">
      <h1>Lexical 编辑器演示</h1>
      <p>这是一个基于 Lexical 的富文本编辑器组件演示</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h3>基础编辑器</h3>
        <LexicalEditor
          v-model="content1"
          placeholder="开始输入您的内容..."
          height="300px"
          @change="onContent1Change"
        />
        <div class="content-preview">
          <h4>内容预览:</h4>
          <pre>{{ content1 }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h3>自定义高度编辑器</h3>
        <LexicalEditor
          v-model="content2"
          placeholder="这个编辑器有不同的高度..."
          height="250px"
          format="text"
          @change="onContent2Change"
        />
        <div class="content-preview">
          <h4>内容预览:</h4>
          <pre>{{ content2 }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h3>纯文本编辑器 (无工具栏)</h3>
        <LexicalEditor
          v-model="content3"
          placeholder="纯文本输入..."
          height="200px"
          format="text"
          :show-toolbar="false"
          @change="onContent3Change"
        />
        <div class="content-preview">
          <h4>内容预览:</h4>
          <pre>{{ content3 }}</pre>
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
        </div>
      </div>

      <div class="demo-section">
        <h3>功能说明</h3>
        <div class="feature-list">
          <h4>支持的功能：</h4>
          <ul>
            <li>✅ 基础文本格式化（加粗、斜体）</li>
            <li>✅ 撤销/重做功能</li>
            <li>✅ 纯文本模式</li>
            <li>✅ 可自定义工具栏</li>
            <li>✅ 自定义高度和样式</li>
            <li>✅ Vue 3 响应式集成</li>
            <li>✅ 轻量级设计</li>
            <li>✅ 良好的性能表现</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LexicalEditor from '@/components/LexicalEditor.vue';

export default {
  name: 'LexicalDemo',
  components: {
    LexicalEditor
  },
  data() {
    return {
      content1: '',
      content2: '',
      content3: '',
      sampleText1: `欢迎使用 Lexical 编辑器！

这是一个基于 Meta 开发的现代富文本编辑器。

主要特性：
- 简洁易用的界面
- 支持基本文本格式化
- 良好的性能表现
- Vue 3 兼容

开始体验吧！`,
      sampleText2: `这是第二个编辑器的示例内容。

您可以在这里输入任何文本内容，
编辑器会自动保存您的更改。

支持的功能：
- 加粗和斜体文本
- 撤销和重做操作
- 自定义高度和样式`,
      sampleText3: `纯文本模式演示

在这个模式下没有工具栏，
专注于纯文本编辑体验。

适合用于：
- 快速笔记
- 文本草稿
- 简单记录`
    }
  },
  methods: {
    onContent1Change(content) {
      console.log('Markdown内容变化:', content);
    },
    onContent2Change(content) {
      console.log('HTML内容变化:', content);
    },
    onContent3Change(content) {
      console.log('纯文本内容变化:', content);
    },
    clearAllEditors() {
      this.content1 = '';
      this.content2 = '';
      this.content3 = '';
      if (this.$message) {
        this.$message.success('所有编辑器已清空');
      } else {
        alert('所有编辑器已清空');
      }
    },
    loadSampleContent() {
      this.content1 = this.sampleText1;
      this.content2 = this.sampleText2;
      this.content3 = this.sampleText3;
      if (this.$message) {
        this.$message.success('示例内容已加载');
      } else {
        alert('示例内容已加载');
      }
    },
    exportContent() {
      const exportData = {
        markdown: this.content1,
        html: this.content2,
        text: this.content3,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lexical-content-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (this.$message) {
        this.$message.success('内容已导出');
      } else {
        alert('内容已导出');
      }
    }
  }
}
</script>

<style scoped>
.lexical-demo {
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
  border-bottom: 2px solid #3498db;
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
}

.html-preview {
  border: 1px solid #dee2e6;
  padding: 12px;
  border-radius: 4px;
  min-height: 50px;
  background: white;
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

.feature-list {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
}

.feature-list h4 {
  color: #495057;
  margin-bottom: 15px;
}

.feature-list ul {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 5px 0;
  color: #495057;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lexical-demo {
    padding: 15px;
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
}
</style>
