<template>
    <div class="chat-page">
      <div v-if="messages.length === 0" class="welcome-container">
        <h1 class="greeting-title">
          <span class="asterisk">*</span> Good morning, Kyrie
        </h1>
  
        <div class="main-input-card">
          <div class="chat-input-bar">
            <button type="button" class="pill-icon-btn add-btn" aria-label="Add attachment">
              <span>+</span>
            </button>
            <div
              ref="messageInput"
              class="message-input"
              contenteditable="true"
              @input="handleInput"
              @keydown="handleKeydown"
              @paste="handlePaste"
              @focus="handleFocus"
              @blur="handleBlur"
              :data-placeholder="currentMessage ? '' : 'Ask anything'"
            ></div>
            <button
              type="button"
              class="pill-icon-btn send-btn"
              :disabled="!currentMessage.trim() || isLoading"
              @click="sendMessage"
              aria-label="Send"
            >
              <span class="send-square"></span>
            </button>
          </div>
          <p class="input-caption">ChatGPT can make mistakes. Check important info.</p>
        </div>
      </div>
  
      <template v-else>
        <div class="chat-messages" ref="messagesContainer">
          <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.role">
            <div class="message-avatar">
            </div>
            <div class="message-content">
              <div class="message-text">
                <div v-if="message.isStreaming && !message.content" class="thinking">
                  <div class="thinking-header">
                    <div class="thinking-spinner" aria-hidden="true"></div>
                    <div class="thinking-text">正在思考…</div>
                  </div>
                  <div class="thinking-skeleton">
                    <div class="skeleton-line w80"></div>
                    <div class="skeleton-line w60"></div>
                    <div class="skeleton-line w70"></div>
                  </div>
                </div>
                <span v-else-if="message.isStreaming" class="streaming-raw" v-text="message.content"></span>
                <span v-else v-html="formatMessage(message.content)"></span>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
  
          <div v-if="isLoading && !isStreaming" class="message-item assistant">
            <div class="message-avatar">
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
            <div class="chat-input-bar">
              <button type="button" class="pill-icon-btn add-btn" aria-label="Add attachment">
                <span>+</span>
              </button>
              <div
                ref="messageInput"
                class="message-input"
                contenteditable="true"
                @input="handleInput"
                @keydown="handleKeydown"
                @paste="handlePaste"
                @focus="handleFocus"
                @blur="handleBlur"
                :data-placeholder="currentMessage ? '' : 'Ask anything'"
              ></div>
              <button
                type="button"
                class="pill-icon-btn send-btn"
                :disabled="!currentMessage.trim() || isLoading"
                @click="sendMessage"
                aria-label="Send"
              >
                <span class="send-square"></span>
              </button>
            </div>
          </div>
          <p class="input-caption">ChatGPT can make mistakes. Check important info.</p>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  import { askKnowledgeStream } from '@/api/ai'
  import DOMPurify from 'dompurify'
  import { FormatConverter } from '@/utils/formatConverter'
  // 数学公式（KaTeX）
  import renderMathInElement from 'katex/contrib/auto-render'
  import 'katex/dist/katex.min.css'
  // 图表（Chart.js）
  import { Chart, registerables } from 'chart.js'
  Chart.register(...registerables)
  
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
        currentStreamingMessageIndex: -1,
        selectedModel: {
          id: 'deepseek',
          name: 'DeepSeek',
          description: '高效的开源大模型，适合日常对话'
        },
        availableModels: [
          {
            id: 'deepseek',
            name: 'DeepSeek',
            description: '高效的开源大模型，适合日常对话'
          }
        ]
      }
    },
    mounted() {
      this.focusInput()
      // 消息区域事件委托（复制代码等）
      this.$nextTick(() => {
        this.$el && this.$el.addEventListener('click', this.handleMessageAreaClick)
      })
    },
    beforeUnmount() {
      // 清理事件监听
      this.$el && this.$el.removeEventListener('click', this.handleMessageAreaClick)
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
          // 直接调用知识库流式接口，不再切换到不带召回内容的生成
          const full = await askKnowledgeStream(
            originalQuestion,
            {
              use_knowledge_base: true,
            //   similarity_threshold: 0.3,
            //   top_k: 5
            },
            (chunk) => {
              if (this.currentStreamingMessageIndex >= 0) {
                this.messages[this.currentStreamingMessageIndex].content += chunk
                // 强制触发视图刷新，避免个别环境下嵌套属性变更未立即渲染
                if (typeof this.$forceUpdate === 'function') this.$forceUpdate()
                this.$nextTick(() => this.scrollToBottom())
                // 流式过程中不做重型增强，待完成后统一处理
              }
            }
          )

          if (this.currentStreamingMessageIndex >= 0) {
            this.messages[this.currentStreamingMessageIndex].content = full
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
          this.$message.error('知识库问答失败: ' + (error.message || '未知错误'))
        } finally {
          this.isLoading = false
          this.isStreaming = false
          this.currentStreamingMessageIndex = -1
          this.scrollToBottom()
          this.queueEnhance()
          this.focusInput()
        }
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

      // 在渲染后的 DOM 中增强 Markdown（代码块复制按钮、语言标签等）
      enhanceRenderedMarkdown() {
        const container = this.$refs.messagesContainer
        if (!container) return
        const pres = container.querySelectorAll('pre')
        pres.forEach(pre => {
          if (pre.getAttribute('data-enhanced') === '1') return
          pre.setAttribute('data-enhanced', '1')
          pre.style.position = pre.style.position || 'relative'

          // 语言标签
          const codeEl = pre.querySelector('code')
          if (codeEl) {
            const cls = codeEl.className || ''
            const m = cls.match(/language-([a-zA-Z0-9_+-]+)/)
            if (m && !pre.querySelector('.code-lang-tag')) {
              const tag = document.createElement('span')
              tag.className = 'code-lang-tag'
              tag.textContent = m[1].toUpperCase()
              pre.appendChild(tag)
            }
          }

          // 复制按钮
          if (!pre.querySelector('.copy-code-btn')) {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.className = 'copy-code-btn'
            btn.textContent = '复制'
            pre.appendChild(btn)
          }
        })

        // 数学公式渲染（支持 $$...$$、$...$、\( ... \)、\[ ... \]）
        try {
          renderMathInElement(container, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          })
        } catch (e) {
          console.warn('数学公式渲染失败:', e)
        }

        // 图表渲染：```chart\n{ ...Chart.js 配置JSON... }\n```
        try {
          const chartCodes = container.querySelectorAll('pre > code.language-chart')
          chartCodes.forEach(codeEl => {
            const pre = codeEl.closest('pre')
            if (!pre) return
            if (pre.getAttribute('data-chart-enhanced') === '1') return
            const raw = codeEl.textContent || ''
            let cfg = null
            try {
              cfg = JSON.parse(raw)
            } catch (e) {
              console.warn('图表 JSON 解析失败:', e)
              return
            }
            // 创建画布并替换代码块
            const wrapper = document.createElement('div')
            wrapper.className = 'chart-block'
            const canvas = document.createElement('canvas')
            wrapper.appendChild(canvas)
            pre.replaceWith(wrapper)
            pre.setAttribute('data-chart-enhanced', '1')
            try {
              // 提供默认项，防止必填字段缺失
              const safeCfg = Object.assign({ type: 'bar', data: { labels: [], datasets: [] }, options: {} }, cfg)
              const ctx = canvas.getContext('2d')
              new Chart(ctx, safeCfg)
            } catch (e) {
              console.warn('图表渲染失败:', e)
            }
          })
        } catch (e) {
          console.warn('图表渲染异常:', e)
        }
      },

      // 轻量节流，减少频繁 DOM 操作
      queueEnhance() {
        clearTimeout(this._enhanceTimer)
        this._enhanceTimer = setTimeout(() => {
          this.$nextTick(() => this.enhanceRenderedMarkdown())
        }, 120)
      },

      // 处理消息区域点击（复制代码）
      async handleMessageAreaClick(e) {
        const btn = e.target.closest && e.target.closest('.copy-code-btn')
        if (!btn) return
        const pre = btn.closest('pre')
        const code = pre && pre.querySelector('code')
        const text = code ? code.innerText : (pre ? pre.innerText : '')
        if (!text) return
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text)
          } else {
            const ta = document.createElement('textarea')
            ta.value = text
            ta.style.position = 'fixed'
            ta.style.left = '-10000px'
            document.body.appendChild(ta)
            ta.focus()
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
          }
          const old = btn.textContent
          btn.textContent = '已复制'
          setTimeout(() => (btn.textContent = old), 1200)
        } catch (err) {
          console.warn('复制失败', err)
          const old = btn.textContent
          btn.textContent = '复制失败'
          setTimeout(() => (btn.textContent = old), 1200)
        }
      },
      
      // 将 Markdown 渲染为安全的 HTML（支持 GFM）
      formatMessage(content) {
        if (!content) return ''
        try {
          // 1) Markdown → HTML（GFM、换行等已由 FormatConverter 配置）
          let html = FormatConverter.markdownToHtml(content)

          // 2) 安全清洗，允许常见 Markdown 标签
          html = DOMPurify.sanitize(html)

          // 3) 链接统一在新窗口打开，防止跳走当前页
          html = html.replace(/<a (?![^>]*target=)/g, '<a target="_blank" rel="noopener noreferrer nofollow" ')

          return html
        } catch (e) {
          console.warn('渲染消息失败，回退为纯文本:', e)
          return DOMPurify.sanitize(content).replace(/\n/g, '<br>')
        }
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
    background-color: #ffffff;
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
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.chat-input-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  border: 1px solid #dfe1e5;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  box-sizing: border-box;
}

.pill-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dfe1e5;
  background: #fff;
  color: #111827;
  font-size: 22px;
  font-weight: 300;
  padding: 0;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.pill-icon-btn:hover {
  transform: translateY(-1px);
  border-color: #d1d5db;
}

.pill-icon-btn:active {
  transform: translateY(0);
}

.pill-icon-btn.send-btn {
  border: none;
  background: #f1f3f4;
}

.pill-icon-btn.send-btn:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.pill-icon-btn.send-btn:disabled .send-square {
  background: #cbd5e1;
}

.send-square {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #111827;
  display: block;
}

.pill-icon-btn.send-btn:not(:disabled):hover .send-square {
  background: #000;
}

.input-caption {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  margin: 8px 0 0;
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
    overflow-x: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0; /* 重要：允许flex子项收缩 */
    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  /* 隐藏chat-messages的滚动条 (Webkit浏览器) */
  .chat-messages::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  .message-item { display: flex; gap: 12px; max-width: 80%; animation: fadeInUp 0.3s ease; }
  .message-item.user { align-self: flex-end; flex-direction: row-reverse; }
  .message-item.assistant { align-self: flex-start; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  .message-avatar { flex-shrink: 0; margin-top: 4px; }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #409eff; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; }
  
  .message-content { flex: 1; min-width: 0; }
  .message-text { background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); word-wrap: break-word; line-height: 1.6; }
  .message-item.user .message-text { background: #409eff; color: white; }
  .message-text .streaming-raw { white-space: pre-wrap; font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif; }
  
  .message-time { font-size: 12px; color: #c0c4cc; margin-top: 4px; text-align: right; }
  .message-item.user .message-time { text-align: left; }

  /* Markdown Styles */
  /* 标题样式 */
  .message-text :deep(h1) { font-size: 1.5em; font-weight: bold; margin: 16px 0 12px 0; color: #333; }
  .message-text :deep(h2) { font-size: 1.3em; font-weight: bold; margin: 14px 0 10px 0; color: #333; }
  .message-text :deep(h3) { font-size: 1.1em; font-weight: bold; margin: 12px 0 8px 0; color: #333; }
  .message-text :deep(h4) { font-size: 1.0em; font-weight: 600; margin: 10px 0 6px 0; color: #333; }
  .message-text :deep(h5) { font-size: 0.95em; font-weight: 600; margin: 8px 0 4px 0; color: #333; }
  .message-text :deep(h6) { font-size: 0.9em; font-weight: 600; margin: 6px 0 4px 0; color: #333; }
  .message-item.user .message-text :deep(h1),
  .message-item.user .message-text :deep(h2),
  .message-item.user .message-text :deep(h3),
  .message-item.user .message-text :deep(h4),
  .message-item.user .message-text :deep(h5),
  .message-item.user .message-text :deep(h6) { color: white; }
  
  /* 列表样式 */
  .message-text :deep(ul) { margin: 8px 0; padding-left: 20px; }
  .message-text :deep(li) { margin: 4px 0; list-style-type: disc; }
  
  /* 引用样式 */
  .message-text :deep(blockquote) { 
    margin: 8px 0; 
    padding: 8px 12px; 
    border-left: 4px solid #ddd; 
    background: #f9f9f9; 
    color: #666; 
    font-style: italic; 
  }
  .message-item.user .message-text :deep(blockquote) { 
    border-left-color: rgba(255, 255, 255, 0.5); 
    background: rgba(255, 255, 255, 0.1); 
    color: rgba(255, 255, 255, 0.9); 
  }
  
  /* Code Block Styles */
  .message-text :deep(code) { background: #f5f7fa; padding: 2px 6px; border-radius: 4px; font-family: 'Consolas', 'Monaco', monospace; font-size: 14px; }
  .message-item.user .message-text :deep(code) { background: rgba(255, 255, 255, 0.2); }
  .message-text :deep(pre) { background: #f5f7fa; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; }
  .message-text :deep(pre code) { background: none; padding: 0; }

  /* 代码块工具条与语言标签 */
  .message-text :deep(pre) {
    position: relative;
    padding-top: 34px; /* 给语言标签/复制按钮留出空间 */
  }
  .message-text :deep(.code-lang-tag) {
    position: absolute;
    top: 6px;
    left: 10px;
    font-size: 12px;
    color: #666;
    background: #eef2f7;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 2px 6px;
  }
  .message-item.user .message-text :deep(.code-lang-tag) {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border-color: rgba(255,255,255,0.35);
  }
  .message-text :deep(.copy-code-btn) {
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 12px;
    line-height: 1;
    color: #334155;
    background: #e5e7eb;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
  }
  .message-text :deep(.copy-code-btn:hover) {
    background: #dbe3ea;
  }
  .message-item.user .message-text :deep(pre) { background: rgba(255,255,255,0.08); }
  .message-item.user .message-text :deep(.copy-code-btn) {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border-color: rgba(255,255,255,0.35);
  }

  /* highlight.js 基础样式（精简 GitHub 风格） */
  .message-text :deep(code.hljs) {
    padding: 0;
    background: transparent;
  }
  .message-text :deep(.hljs) {
    color: #24292e;
    background: transparent;
  }
  .message-text :deep(.hljs-comment),
  .message-text :deep(.hljs-quote) { color: #6a737d; }
  .message-text :deep(.hljs-attr),
  .message-text :deep(.hljs-attribute),
  .message-text :deep(.hljs-keyword),
  .message-text :deep(.hljs-selector-tag) { color: #d73a49; }
  .message-text :deep(.hljs-name),
  .message-text :deep(.hljs-type),
  .message-text :deep(.hljs-selector-id),
  .message-text :deep(.hljs-selector-class) { color: #6f42c1; }
  .message-text :deep(.hljs-number),
  .message-text :deep(.hljs-literal),
  .message-text :deep(.hljs-variable),
  .message-text :deep(.hljs-template-variable) { color: #005cc5; }
  .message-text :deep(.hljs-string),
  .message-text :deep(.hljs-doctag) { color: #032f62; }
  .message-text :deep(.hljs-title),
  .message-text :deep(.hljs-section) { color: #22863a; }
  .message-text :deep(.hljs-meta) { color: #b31d28; }
  .message-text :deep(.hljs-built_in),
  .message-text :deep(.hljs-builtin-name) { color: #e36209; }
  .message-item.user .message-text :deep(.hljs) { color: #fff; }

  /* Thinking (pre-stream) */
  .thinking { display: flex; flex-direction: column; gap: 10px; }
  .thinking-header { display: flex; align-items: center; gap: 8px; }
  .thinking-text { font-size: 14px; color: #65738a; }
  .thinking-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid #c7d2fe; border-top-color: #6366f1;
    animation: spin-anim 1s linear infinite;
  }
  @keyframes spin-anim { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
  .thinking-skeleton { display: flex; flex-direction: column; gap: 6px; margin-top: 2px; }
  .skeleton-line {
    height: 10px; border-radius: 6px;
    background: linear-gradient(90deg, #eef2f7 25%, #e9eef5 37%, #eef2f7 63%);
    background-size: 400% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  .skeleton-line.w80 { width: 80%; }
  .skeleton-line.w70 { width: 70%; }
  .skeleton-line.w60 { width: 60%; }
  @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
  .message-item.user .thinking-text { color: rgba(255,255,255,0.85); }
  .message-item.user .skeleton-line {
    background: linear-gradient(90deg, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.28) 37%, rgba(255,255,255,0.18) 63%);
  }

  /* KaTeX 容器微调，避免被气泡样式挤压 */
  .message-text :deep(.katex-display) { overflow-x: auto; padding: 6px 0; }
  .message-item.user .message-text :deep(.katex) { color: #fff; }

  /* 图表容器 */
  .message-text :deep(.chart-block) { width: 100%; max-width: 100%; margin: 10px 0; }

  /* 表格与链接、图片等 */
  .message-text :deep(table) { width: 100%; border-collapse: collapse; margin: 10px 0; }
  .message-text :deep(th),
  .message-text :deep(td) { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
  .message-text :deep(th) { background: #f9fafb; font-weight: 600; }
  .message-item.user .message-text :deep(th),
  .message-item.user .message-text :deep(td) { border-color: rgba(255,255,255,0.35); }

  .message-text :deep(a) { color: #409eff; text-decoration: underline; word-break: break-all; }
  .message-item.user .message-text :deep(a) { color: #dceeff; }

  .message-text :deep(img) { max-width: 100%; border-radius: 6px; border: 1px solid #eee; }
  
  
  .typing-indicator { display: flex; gap: 4px; padding: 12px 16px; }
  .typing-indicator span { width: 8px; height: 8px; border-radius: 50%; background: #c0c4cc; animation: typing 1.4s infinite; }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-10px); opacity: 1; } }
  
/* Chat View Input Area */
.chat-input-container {
  padding: 24px 24px 32px;
  background: transparent;
  border-top: 1px solid rgba(229, 231, 235, 0.6);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
}

.input-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.message-input {
  flex: 1;
  min-width: 0;
  min-height: 32px;
  max-height: 160px;
  padding: 0;
  border: none;
  border-radius: 0;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  font-family: inherit;
  word-wrap: break-word;
  white-space: pre-wrap;
  background: transparent;
  color: #111827;
  overflow-y: auto;
}

.message-input:focus {
  outline: none;
}

.message-input:empty:before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}
  
  /* Responsive */
  @media (max-width: 768px) {
    .greeting-title { font-size: 32px; }
    .chat-page { 
      height: 100vh; 
      max-height: 100vh; /* 确保不超过视口高度 */
    }
    .chat-messages { 
      padding: 16px; 
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
    .message-item { max-width: 90%; }
    .chat-input-container {
      padding: 20px 16px 28px;
    }
    .input-wrapper {
      max-width: 100%;
    }
    .chat-input-bar {
      gap: 12px;
      padding: 10px 14px;
    }
    .pill-icon-btn {
      width: 36px;
      height: 36px;
      font-size: 18px;
    }
  }
  </style>
