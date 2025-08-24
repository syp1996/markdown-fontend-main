<template>
  <div class="chat-page">
    <!-- 聊天标题栏 -->
    <div class="chat-header">
      <div class="header-left">
        <div class="ai-avatar">🤖</div>
        <div class="ai-info">
          <h3>DeepSeek AI助手</h3>
          <span class="status" :class="{ online: isConnected }">
            {{ isConnected ? '在线' : '离线' }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <button class="clear-btn" @click="clearMessages" :disabled="messages.length === 0">
          <span class="btn-icon">🗑️</span>
          清空对话
        </button>
      </div>
    </div>

    <!-- 聊天消息区 -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-content">
          <div class="welcome-icon">🎯</div>
          <h2>欢迎使用AI智能助手</h2>
          <p>我是DeepSeek AI助手，可以帮您解答各种问题、协助编程、文档编写等任务。</p>
          <div class="suggestion-chips">
            <div class="chip" @click="sendSuggestion('帮我写一个Python函数')">
              💻 编程帮助
            </div>
            <div class="chip" @click="sendSuggestion('解释一下什么是机器学习')">
              🧠 知识问答
            </div>
            <div class="chip" @click="sendSuggestion('帮我写一份项目文档')">
              📝 文档协助
            </div>
            <div class="chip" @click="sendSuggestion('今天天气如何？')">
              🌤️ 日常对话
            </div>
          </div>
        </div>
      </div>

      <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.role">
        <div class="message-avatar">
          <div v-if="message.role === 'user'" class="user-avatar">👤</div>
          <div v-else class="ai-avatar">🤖</div>
        </div>
        <div class="message-content">
          <div class="message-text">
            <span v-html="formatMessage(message.content)"></span>
            <span v-if="message.isStreaming" class="streaming-cursor">|</span>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading && !isStreaming" class="message-item assistant">
        <div class="message-avatar">
          <div class="ai-avatar">🤖</div>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-container">
      <div class="input-wrapper">
        <textarea
          v-model="currentMessage"
          placeholder="输入您的问题，按Enter发送..."
          class="message-input"
          rows="1"
          @keydown="handleKeydown"
          @input="handleInput"
          ref="messageInput"
        ></textarea>
        <button 
          class="send-btn" 
          @click="sendMessage" 
          :disabled="!currentMessage.trim() || isLoading"
        >
          <span v-if="isLoading" class="loading-icon">⏳</span>
          <span v-else class="send-icon">🚀</span>
        </button>
      </div>
      <div class="input-tips">
        <span class="tip">💡 提示：按Shift+Enter换行，Enter发送</span>
      </div>
    </div>
  </div>
</template>

<script>
import { chatWithDeepSeekStream } from '@/api/deepseek'

export default {
  name: 'HomePage',
  data() {
    return {
      messages: [],
      currentMessage: '',
      isLoading: false,
      isConnected: true,
      maxHeight: 100,
      isStreaming: false,
      currentStreamingMessageIndex: -1
    }
  },
  mounted() {
    this.focusInput()
  },
  methods: {
    // 发送消息
    async sendMessage() {
      if (!this.currentMessage.trim() || this.isLoading) return
      
      const userMessage = {
        role: 'user',
        content: this.currentMessage.trim(),
        timestamp: new Date()
      }
      
      this.messages.push(userMessage)
      const messageToSend = this.currentMessage.trim()
      this.currentMessage = ''
      this.resetTextarea()
      
      this.isLoading = true
      this.scrollToBottom()
      
      // 创建一个空的助手消息用于流式更新
      const assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      }
      
      this.messages.push(assistantMessage)
      this.currentStreamingMessageIndex = this.messages.length - 1
      this.isStreaming = true
      
      try {
        const response = await chatWithDeepSeekStream(
          messageToSend, 
          this.messages.slice(0, -1),
          (chunk) => {
            // 流式更新回调
            if (this.currentStreamingMessageIndex >= 0) {
              this.messages[this.currentStreamingMessageIndex].content += chunk
              this.scrollToBottom()
            }
          }
        )
        
        // 流式传输完成，更新最终状态
        if (this.currentStreamingMessageIndex >= 0) {
          this.messages[this.currentStreamingMessageIndex].content = response
          this.messages[this.currentStreamingMessageIndex].isStreaming = false
        }
        
      } catch (error) {
        console.error('发送消息失败:', error)
        
        // 如果有正在流式传输的消息，替换为错误消息
        if (this.currentStreamingMessageIndex >= 0) {
          this.messages[this.currentStreamingMessageIndex].content = '抱歉，我现在无法回复您的消息。请稍后再试。'
          this.messages[this.currentStreamingMessageIndex].isStreaming = false
        } else {
          // 否则添加新的错误消息
          const errorMessage = {
            role: 'assistant',
            content: '抱歉，我现在无法回复您的消息。请稍后再试。',
            timestamp: new Date()
          }
          this.messages.push(errorMessage)
        }
        
        this.$message.error('发送消息失败: ' + (error.message || '未知错误'))
      } finally {
        this.isLoading = false
        this.isStreaming = false
        this.currentStreamingMessageIndex = -1
        this.scrollToBottom()
        this.focusInput()
      }
    },
    
    // 发送建议消息
    sendSuggestion(text) {
      this.currentMessage = text
      this.sendMessage()
    },
    
    // 清空消息
    clearMessages() {
      this.messages = []
      this.$message.success('对话已清空')
    },
    
    // 处理键盘事件
    handleKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendMessage()
      }
    },
    
    // 处理输入变化
    handleInput() {
      this.adjustTextareaHeight()
    },
    
    // 调整文本框高度
    adjustTextareaHeight() {
      this.$nextTick(() => {
        const textarea = this.$refs.messageInput
        if (textarea) {
          textarea.style.height = 'auto'
          const scrollHeight = textarea.scrollHeight
          const maxHeight = 120 // 最大高度
          
          if (scrollHeight > maxHeight) {
            textarea.style.height = maxHeight + 'px'
            textarea.style.overflowY = 'scroll'
          } else {
            textarea.style.height = scrollHeight + 'px'
            textarea.style.overflowY = 'hidden'
          }
        }
      })
    },
    
    // 重置文本框
    resetTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.messageInput
        if (textarea) {
          textarea.style.height = 'auto'
          textarea.style.overflowY = 'hidden'
        }
      })
    },
    
    // 聚焦输入框
    focusInput() {
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.focus()
        }
      })
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
    
    // 格式化消息内容
    formatMessage(content) {
      if (!content) return ''
      
      // 基本的Markdown格式化
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\n/g, '<br>')
    },
    
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const now = new Date()
      const diff = now - timestamp
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString().slice(0, 5)
      }
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
}

/* 聊天标题栏 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8eaec;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.ai-info h3 {
  margin: 0;
  color: #17233d;
  font-size: 16px;
  font-weight: 600;
}

.status {
  font-size: 12px;
  color: #808695;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f0f0f0;
}

.status.online {
  color: #67c23a;
  background: #f0f9e8;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.clear-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 聊天消息区 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 自定义滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.welcome-content {
  max-width: 600px;
  padding: 40px;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.welcome-content h2 {
  color: #17233d;
  margin: 0 0 16px 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.welcome-content p {
  color: #808695;
  margin: 0 0 32px 0;
  font-size: 16px;
  line-height: 1.6;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.chip {
  padding: 10px 16px;
  background: white;
  border: 1px solid #e8eaec;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #606266;
}

.chip:hover {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 消息项 */
.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
  animation: fadeInUp 0.3s ease;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-item.assistant {
  align-self: flex-start;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
  margin-top: 4px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.message-item.assistant .ai-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  word-wrap: break-word;
  line-height: 1.6;
}

.message-item.user .message-text {
  background: #409eff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
  text-align: right;
}

.message-item.user .message-time {
  text-align: left;
}

/* 代码块样式 */
.message-text code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
}

.message-item.user .message-text code {
  background: rgba(255, 255, 255, 0.2);
}

.message-text pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-text pre code {
  background: none;
  padding: 0;
}

/* 加载指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* 流式打字光标 */
.streaming-cursor {
  display: inline-block;
  animation: blink 1s infinite;
  font-weight: bold;
  color: #409eff;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 输入区域 */
.chat-input-container {
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e8eaec;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 100%;
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.4;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  border-color: #409eff;
}

.message-input::placeholder {
  color: #c0c4cc;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #409eff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #66b1ff;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
  transform: none;
}

.input-tips {
  margin-top: 8px;
  text-align: center;
}

.tip {
  font-size: 12px;
  color: #c0c4cc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-page {
    height: 100vh;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .message-item {
    max-width: 90%;
  }
  
  .chat-input-container {
    padding: 16px;
  }
  
  .welcome-content {
    padding: 20px;
  }
  
  .suggestion-chips {
    gap: 8px;
  }
  
  .chip {
    font-size: 12px;
    padding: 8px 12px;
  }
}
</style>
