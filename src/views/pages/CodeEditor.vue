<template>
  <div class="code-editor-page">
    <div class="page-header">
      <h2>💻 代码编辑器</h2>
      <p>支持多种编程语言的代码编辑器</p>
    </div>
    
    <div class="editor-container">
      <div class="toolbar">
        <div class="tool-group">
          <label>语言选择：</label>
          <select v-model="selectedLanguage" @change="changeLanguage">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>
        
        <div class="tool-group">
          <label>主题：</label>
          <select v-model="selectedTheme" @change="changeTheme">
            <option value="vs">浅色</option>
            <option value="vs-dark">深色</option>
          </select>
        </div>
        
        <button class="tool-btn primary" @click="runCode">运行代码</button>
        <button class="tool-btn" @click="saveCode">保存</button>
      </div>
      
      <div class="editor-content">
        <div class="code-area">
          <textarea 
            ref="codeEditor"
            v-model="codeContent" 
            class="code-textarea"
            @input="onCodeChange"
            spellcheck="false"
          ></textarea>
        </div>
        
        <div class="output-area">
          <div class="output-header">
            <h4>输出结果</h4>
            <button class="clear-btn" @click="clearOutput">清空</button>
          </div>
          <div class="output-content" ref="outputContent">
            <div class="output-item" v-for="(item, index) in outputLogs" :key="index" :class="item.type">
              <span class="output-time">{{ item.time }}</span>
              <span class="output-text">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CodeEditor',
  data() {
    return {
      selectedLanguage: 'javascript',
      selectedTheme: 'vs',
      codeContent: '// JavaScript 示例代码\nfunction helloWorld() {\n    console.log("Hello, World!");\n}\n\nhelloWorld();',
      outputLogs: []
    }
  },
  mounted() {
    this.addOutputLog('info', '代码编辑器已就绪，选择语言开始编码吧！')
  },
  methods: {
    changeLanguage() {
      this.addOutputLog('info', `已切换到 ${this.selectedLanguage} 语言`)
    },
    
    changeTheme() {
      this.addOutputLog('info', `已切换到 ${this.selectedTheme} 主题`)
    },
    
    onCodeChange() {
      // 代码内容变化处理
    },
    
    runCode() {
      this.addOutputLog('info', `正在运行 ${this.selectedLanguage} 代码...`)
      
      setTimeout(() => {
        this.addOutputLog('success', '代码执行完成！')
        this.addOutputLog('output', 'Hello, World!')
      }, 1000)
    },
    
    saveCode() {
      this.addOutputLog('success', '代码已保存')
    },
    
    clearOutput() {
      this.outputLogs = []
      this.addOutputLog('info', '输出已清空')
    },
    
    addOutputLog(type, text) {
      const now = new Date()
      const time = now.toLocaleTimeString()
      
      this.outputLogs.push({
        type,
        text,
        time
      })
      
      this.$nextTick(() => {
        const outputContent = this.$refs.outputContent
        outputContent.scrollTop = outputContent.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.code-editor-page {
  padding: 20px;
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8eaec;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #17233d;
}

.page-header p {
  margin: 0;
  color: #808695;
}

.editor-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toolbar {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-group label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

select {
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.tool-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.tool-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.tool-btn.primary:hover {
  background: #66b1ff;
}

.editor-content {
  display: flex;
  height: 500px;
}

.code-area {
  flex: 2;
  border-right: 1px solid #e8eaec;
}

.code-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 20px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  background: #1e1e1e;
  color: #d4d4d4;
}

.output-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.output-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.output-header h4 {
  margin: 0;
  color: #17233d;
}

.clear-btn {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  border-color: #f56c6c;
  color: #f56c6c;
}

.output-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
}

.output-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.output-item.info {
  background: #e1f3d8;
  color: #67c23a;
  border-left: 3px solid #67c23a;
}

.output-item.success {
  background: #d1ecf1;
  color: #17a2b8;
  border-left: 3px solid #17a2b8;
}

.output-item.output {
  background: #fff3cd;
  color: #856404;
  border-left: 3px solid #ffc107;
}

.output-time {
  color: #999;
  margin-right: 10px;
  font-size: 12px;
}

.output-text {
  font-weight: 500;
}
</style>
