<template>
    <div class="chat-page">
      <div v-if="messages.length === 0" class="welcome-container">
        <div class="welcome-header">
          <span>Free plan</span>
          <a href="#" class="upgrade-link">Upgrade</a>
        </div>
  
        <h1 class="greeting-title">
          <span class="asterisk">*</span> Good morning, Kyrie
        </h1>
  
        <div class="main-input-card">
          <div
            ref="messageInput"
            class="message-input welcome-input"
            contenteditable="true"
            @input="handleInput"
            @keydown="handleKeydown"
            @paste="handlePaste"
            @focus="handleFocus"
            @blur="handleBlur"
            :data-placeholder="currentMessage ? '' : 'How can I help you today?'"
          ></div>
          <div class="card-footer">
            <div class="footer-left">
              <button class="icon-btn">+</button>
              <button class="icon-btn">⫯</button>
            </div>
            <div class="footer-right">
              <button class="model-selector">
                Claude Sonnet 4 <span class="arrow">↑</span>
              </button>
              <button class="send-btn-welcome" @click="sendMessage" :disabled="!currentMessage.trim() || isLoading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.0001 12L3.00006 12M21.0001 12L15.0001 6M21.0001 12L15.0001 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="upgrade-prompt">
          <span>Upgrade to connect your tools to Claude</span>
          <div class="tool-icons">
            <span>C</span>
            <span>❐</span>
            <span>></span>
          </div>
        </div>
      </div>
  
      <template v-else>
        <div class="chat-messages" ref="messagesContainer">
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
  
          <div v-if="isLoading && !isStreaming" class="message-item assistant">
            <div class="message-avatar">
              <div class="ai-avatar">🤖</div>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
  
        <div class="chat-input-container">
          <div class="input-wrapper">
            <div
              ref="messageInput"
              class="message-input"
              contenteditable="true"
              @input="handleInput"
              @keydown="handleKeydown"
              @paste="handlePaste"
              @focus="handleFocus"
              @blur="handleBlur"
              :data-placeholder="currentMessage ? '' : '输入您的问题，按Enter发送...'"
            ></div>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  import { chatSimple } from '@/api/ai'
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
        const originalQuestion = this.currentMessage.trim()
        
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
          // 第一步：调用知识库API获取增强提示词
          let enhancedPrompt = originalQuestion
          
          try {
            console.log('调用知识库API，原始问题:', originalQuestion)
            const knowledgeResponse = await chatSimple(originalQuestion, {
              use_knowledge_base: true,
              similarity_threshold: 0.3,
              top_k: 5
            })
            console.log('知识库API完整响应:', knowledgeResponse)
            
          enhancedPrompt = knowledgeResponse.prompt
            
            console.log('提取的增强提示词:', enhancedPrompt)
            console.log('增强提示词长度:', enhancedPrompt.length)
          } catch (knowledgeError) {
            console.error('知识库API调用失败详情:', knowledgeError)
            console.error('错误响应数据:', knowledgeError.response?.data)
            console.error('错误状态码:', knowledgeError.response?.status)
            console.warn('使用原始问题继续对话')
            // 如果知识库API失败，继续使用原始问题
          }
          
          // 第二步：使用增强提示词调用DeepSeek API
          const response = await chatWithDeepSeekStream(
            enhancedPrompt, 
            this.messages.slice(0, -1),
            (chunk) => {
              if (this.currentStreamingMessageIndex >= 0) {
                this.messages[this.currentStreamingMessageIndex].content += chunk
                this.scrollToBottom()
              }
            }
          )
          
          if (this.currentStreamingMessageIndex >= 0) {
            this.messages[this.currentStreamingMessageIndex].content = response
            this.messages[this.currentStreamingMessageIndex].isStreaming = false
          }
          
        } catch (error) {
          console.error('发送消息失败:', error)
          if (this.currentStreamingMessageIndex >= 0) {
            this.messages[this.currentStreamingMessageIndex].content = '抱歉，我现在无法回复您的消息。请稍后再试。'
            this.messages[this.currentStreamingMessageIndex].isStreaming = false
          } else {
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
        // Welcome input does not need auto-height adjustment
        if (this.messages.length > 0) {
          this.adjustInputHeight()
        }
      },
      
      // 处理粘贴事件
      handlePaste(event) {
        event.preventDefault()
        const text = event.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, text)
      },
      
      handleFocus() {},
      handleBlur() {},
      
      // 调整输入框高度
      adjustInputHeight() {
        this.$nextTick(() => {
          const input = this.$refs.messageInput
          if (input && this.messages.length > 0) { // Only for chat view
            input.style.height = 'auto'
            const scrollHeight = input.scrollHeight
            const maxHeight = 120
            
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
            input.style.height = this.messages.length > 0 ? '40px' : 'auto';
            input.style.overflowY = 'hidden'
          }
        })
      },
      
      clearInput() {
        this.$nextTick(() => {
          const input = this.$refs.messageInput
          if (input) input.innerHTML = ''
        })
      },
      
      focusInput() {
        this.$nextTick(() => {
          this.$refs.messageInput?.focus()
        })
      },
      
      scrollToBottom() {
        this.$nextTick(() => {
          const container = this.$refs.messagesContainer
          if (container) container.scrollTop = container.scrollHeight
        })
      },
      
      formatMessage(content) {
        if (!content) return ''
        return content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
          .replace(/\n/g, '<br>')
      },
      
      formatTime(timestamp) {
        if (!timestamp) return ''
        const now = new Date()
        const diff = now - timestamp
        if (diff < 60000) return '刚刚'
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
        return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString().slice(0, 5)
      }
    }
  }
  </script>
  
  <style scoped>
  /* General Page Styles */
  .chat-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #FBFBFA;
    border-radius: 4px;
  }
  
  /* --- Welcome Screen Styles --- */
  .welcome-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    max-width: 720px;
    margin: auto;
    padding: 20px;
  }
  
  .welcome-header {
    font-size: 14px;
    color: #555;
    margin-bottom: 40px;
  }
  
  .welcome-header .upgrade-link {
    margin-left: 12px;
    padding: 4px 10px;
    background-color: #F0F0F0;
    border-radius: 6px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
  }
  
  .greeting-title {
    font-size: 48px;
    font-weight: 400;
    color: #333;
    margin: 0 0 24px 0;
  }
  
  .greeting-title .asterisk {
    color: #E68A4D;
    margin-right: 8px;
  }
  
  .main-input-card {
    width: 100%;
    background: white;
    border-radius: 16px;
    border: 1px solid #EAEAEA;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    padding: 16px 20px;
  }
  
  .welcome-input {
    min-height: 50px;
    max-height: 200px; /* You can adjust this */
    width: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    line-height: 1.5;
    text-align: left;
    overflow-y: auto;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  
  .welcome-input:empty:before {
    content: attr(data-placeholder);
    color: #999;
    pointer-events: none;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }
  
  .footer-left, .footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .icon-btn, .model-selector {
    background: transparent;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 14px;
    color: #555;
  }
  
  .icon-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
    line-height: 1;
  }
  
  .model-selector .arrow {
    display: inline-block;
    transform: rotate(180deg);
    margin-left: 6px;
  }
  
  .send-btn-welcome {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: #F28C82;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  
  .send-btn-welcome:hover {
    background: #E87A70;
  }
  .send-btn-welcome:disabled {
    background: #D1D1D1;
    cursor: not-allowed;
  }
  .send-btn-welcome svg {
    transform: rotate(180deg);
  }
  
  .upgrade-prompt {
    margin-top: 16px;
    font-size: 13px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .tool-icons {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .tool-icons span {
    display: inline-block;
    border: 1px solid #CCC;
    border-radius: 4px;
    padding: 2px 5px;
    font-size: 12px;
    background: #FAFAFA;
  }
  
  /* --- Chat View Styles (Original styles adapted) --- */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .chat-messages::-webkit-scrollbar { width: 6px; }
  .chat-messages::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
  .chat-messages::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
  .chat-messages::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
  
  .message-item { display: flex; gap: 12px; max-width: 80%; animation: fadeInUp 0.3s ease; }
  .message-item.user { align-self: flex-end; flex-direction: row-reverse; }
  .message-item.assistant { align-self: flex-start; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  .message-avatar { flex-shrink: 0; margin-top: 4px; }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #409eff; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; }
  .message-item.assistant .ai-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 16px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
  
  .message-content { flex: 1; min-width: 0; }
  .message-text { background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); word-wrap: break-word; line-height: 1.6; }
  .message-item.user .message-text { background: #409eff; color: white; }
  
  .message-time { font-size: 12px; color: #c0c4cc; margin-top: 4px; text-align: right; }
  .message-item.user .message-time { text-align: left; }
  
  /* Code Block Styles */
  .message-text :deep(code) { background: #f5f7fa; padding: 2px 6px; border-radius: 4px; font-family: 'Consolas', 'Monaco', monospace; font-size: 14px; }
  .message-item.user .message-text :deep(code) { background: rgba(255, 255, 255, 0.2); }
  .message-text :deep(pre) { background: #f5f7fa; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; }
  .message-text :deep(pre code) { background: none; padding: 0; }
  
  
  .typing-indicator { display: flex; gap: 4px; padding: 12px 16px; }
  .typing-indicator span { width: 8px; height: 8px; border-radius: 50%; background: #c0c4cc; animation: typing 1.4s infinite; }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-10px); opacity: 1; } }
  
  .streaming-cursor { display: inline-block; animation: blink 1s infinite; font-weight: bold; color: #409eff; margin-left: 2px; }
  @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
  
  /* Chat View Input Area */
  .chat-input-container { padding: 10px 24px 20px 24px; background: #FBFBFA; border-top: 1px solid #e8eaec; }
  .input-wrapper { display: flex; gap: 12px; align-items: flex-end; max-width: 800px; margin: 0 auto; }
  .message-input { flex: 1; min-height: 40px; padding: 10px 16px; border: 1px solid #dcdfe6; border-radius: 20px; outline: none; font-size: 14px; line-height: 1.4; font-family: inherit; transition: border-color 0.3s ease; word-wrap: break-word; white-space: pre-wrap; background: #fff; }
  .message-input:focus { border-color: #409eff; }
  .message-input:empty:before { content: attr(data-placeholder); color: #c0c4cc; pointer-events: none; }
  
  /* Responsive */
  @media (max-width: 768px) {
    .greeting-title { font-size: 32px; }
    .chat-page { height: 100vh; }
    .chat-messages { padding: 16px; }
    .message-item { max-width: 90%; }
    .chat-input-container { padding: 16px; width: 100%; height: auto; min-height: 80px; }
  }
  </style>