<template>
    <div class="chat-page">

      <!-- 聊天消息区 -->
      <div v-if="messages.length > 0" class="chat-messages" ref="messagesContainer">
  
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

      <!-- 欢迎界面 -->
      <div v-else class="welcome-container">
        <!-- 问候语 -->
        <div class="greeting-section">
          <div class="greeting-icon">🌟</div>
          <h1 class="greeting-text">Good morning, Kyrie</h1>
        </div>
      </div>
  
      <!-- 输入区域 -->
      <div class="chat-input-container">
        <div class="input-wrapper">
          <div class="input-controls">
            <button class="attach-btn" title="附件">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button class="format-btn" title="格式">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
          </div>
          <div
            ref="messageInput"
            class="message-input"
            contenteditable="true"
            @input="handleInput"
            @keydown="handleKeydown"
            @paste="handlePaste"
            @focus="handleFocus"
            @blur="handleBlur"
            :data-placeholder="currentMessage ? '' : 'How can I help you today?'"
          ></div>
          <div class="input-right">
            <div class="model-indicator">
              <span class="model-name">Claude Sonnet 4</span>
            </div>
            <button 
              class="send-btn" 
              @click="sendMessage" 
              :disabled="!currentMessage.trim() || isLoading"
              title="发送消息"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m22 2-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
        <!-- 升级提示 -->
        <div class="upgrade-notice">
          <span class="upgrade-text">Upgrade to connect your tools to Claude</span>
          <div class="tool-icons">
            <div class="tool-icon google"></div>
            <div class="tool-icon docs"></div>
            <div class="tool-icon github"></div>
            <div class="arrow-right">→</div>
          </div>
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
        
        // 清空输入框
        this.currentMessage = ''
        this.clearInput()
        this.resetInputHeight()
        
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
        // 设置 div 内容
        this.$nextTick(() => {
          const input = this.$refs.messageInput
          if (input) {
            input.innerText = text
            this.adjustInputHeight()
          }
        })
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
      handleInput(event) {
        this.currentMessage = event.target.innerText || ''
        this.adjustInputHeight()
      },
      
      // 处理粘贴事件
      handlePaste(event) {
        event.preventDefault()
        const text = event.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, text)
      },
      
      // 处理焦点事件
      handleFocus() {
        // 可以添加焦点时的处理逻辑
      },
      
      // 处理失焦事件
      handleBlur() {
        // 可以添加失焦时的处理逻辑
      },
      
      // 调整输入框高度
      adjustInputHeight() {
        this.$nextTick(() => {
          const input = this.$refs.messageInput
          if (input) {
            input.style.height = 'auto'
            const scrollHeight = input.scrollHeight
            const maxHeight = 120 // 最大高度
            
            if (scrollHeight > maxHeight) {
              input.style.height = maxHeight + 'px'
              input.style.overflowY = 'scroll'
            } else {
              input.style.height = Math.max(40, scrollHeight) + 'px'
              input.style.overflowY = 'hidden'
            }
          }
        })
      },
      
      // 重置输入框高度
      resetInputHeight() {
        this.$nextTick(() => {
          const input = this.$refs.messageInput
          if (input) {
            input.style.height = '40px'
            input.style.overflowY = 'hidden'
          }
        })
      },
      
      // 清空输入框
      clearInput() {
        this.$nextTick(() => {
          const input = this.$refs.messageInput
          if (input) {
            input.innerHTML = ''
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
    height: 100vh;
    background: #f8f9fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* 顶部计划信息 */
  .plan-info {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }

  .plan-text {
    color: #6b7280;
  }

  .plan-separator {
    margin: 0 8px;
    color: #d1d5db;
  }

  .upgrade-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }

  .upgrade-link:hover {
    text-decoration: underline;
  }

  /* 欢迎界面 */
  .welcome-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .greeting-section {
    text-align: center;
    margin-bottom: 60px;
  }

  .greeting-icon {
    font-size: 2rem;
    margin-bottom: 20px;
  }

  .greeting-text {
    font-size: 2.5rem;
    font-weight: 400;
    color: #1f2937;
    margin: 0;
    letter-spacing: -0.02em;
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
    background: #3b82f6;
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
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .message-content {
    flex: 1;
    min-width: 0;
  }
  
  .message-text {
    background: white;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    word-wrap: break-word;
    line-height: 1.6;
  }
  
  .message-item.user .message-text {
    background: #3b82f6;
    color: white;
  }
  
  .message-time {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    text-align: right;
  }
  
  .message-item.user .message-time {
    text-align: left;
  }
  
  /* 代码块样式 */
  .message-text code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 14px;
  }
  
  .message-item.user .message-text code {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .message-text pre {
    background: #f3f4f6;
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
    background: #9ca3af;
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
    color: #3b82f6;
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
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 20px;
  }
  
  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .input-controls {
    display: flex;
    gap: 4px;
    margin-left: 8px;
  }

  .attach-btn,
  .format-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #6b7280;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .attach-btn:hover,
  .format-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .message-input {
    flex: 1;
    min-height: 40px;
    max-height: 120px;
    padding: 8px 12px;
    border: none;
    outline: none;
    font-size: 16px;
    line-height: 1.5;
    font-family: inherit;
    overflow-y: auto;
    word-wrap: break-word;
    white-space: pre-wrap;
    background: transparent;
    resize: none;
  }
  
  /* 占位符样式 */
  .message-input:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }

  .input-right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 4px;
  }

  .model-indicator {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    background: #f9fafb;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
  }

  .model-name {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }
  
  .send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: #d97706;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .send-btn:hover:not(:disabled) {
    background: #b45309;
    transform: scale(1.05);
  }
  
  .send-btn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }

  /* 升级提示 */
  .upgrade-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;
    padding: 8px 16px;
    background: #f8fafc;
    border-radius: 12px;
    font-size: 14px;
  }

  .upgrade-text {
    color: #64748b;
  }

  .tool-icons {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tool-icon {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background-size: contain;
  }

  .tool-icon.google {
    background: linear-gradient(45deg, #4285f4, #34a853, #fbbc05, #ea4335);
  }

  .tool-icon.docs {
    background: #4285f4;
  }

  .tool-icon.github {
    background: #24292e;
  }

  .arrow-right {
    color: #9ca3af;
    font-size: 16px;
    margin-left: 4px;
  }
  
  /* 输入框滚动条 */
  .message-input::-webkit-scrollbar {
    width: 4px;
  }
  
  .message-input::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .message-input::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 2px;
  }
  
  .message-input::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .chat-page {
      height: 100vh;
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

    .input-wrapper {
      max-width: 100%;
    }

    .greeting-text {
      font-size: 2rem;
    }

    .input-controls {
      display: none;
    }

    .model-indicator {
      display: none;
    }
  }
  </style>