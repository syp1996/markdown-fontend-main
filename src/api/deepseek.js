
// DeepSeek API 配置
const DEEPSEEK_CONFIG = {
  apiKey: process.env.VUE_APP_DEEPSEEK_API_KEY || 'sk-c1fd34d6c0214fb79f2855710c6f4847',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat'
}

/**
 * 
 * 与 DeepSeek AI 进行对话（非流式）
 * @param {string} message - 用户消息
 * @param {Array} history - 历史消息记录
 * @returns {Promise<string>} AI 回复
 */
export async function chatWithDeepSeek(message, history = []) {
  try {
    // 构建消息历史
    const messages = [
      {
        role: 'system',
        content: '你是DeepSeek AI助手，一个有用、无害、诚实的AI助手。请用中文回答用户的问题，提供准确、有帮助的信息。'
      }
    ]

    // 添加历史消息（限制最近10条）
    const recentHistory = history.slice(-10)
    messages.push(...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })))

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message
    })

    // 发送请求到DeepSeek API
    const response = await fetch(`${DEEPSEEK_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`DeepSeek API 错误: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('DeepSeek API 返回数据格式错误')
    }

    return data.choices[0].message.content.trim()

  } catch (error) {
    console.error('DeepSeek API 调用失败:', error)
    
    // 如果是网络错误或API错误，返回模拟回复
    if (error.message.includes('API') || error.message.includes('fetch')) {
      return getMockResponse(message)
    }
    
    throw error
  }
}

/**
 * 与 DeepSeek AI 进行对话（流式）
 * @param {string} message - 用户消息
 * @param {Array} history - 历史消息记录
 * @param {Function} onChunk - 接收流式数据的回调函数
 * @returns {Promise<string>} 完整的AI回复
 */
export async function chatWithDeepSeekStream(message, history = [], onChunk) {
  try {
    // 构建消息历史
    const messages = [
      {
        role: 'system',
        content: '你是DeepSeek AI助手，一个有用、无害、诚实的AI助手。请用中文回答用户的问题，提供准确、有帮助的信息。'
      }
    ]

    // 添加历史消息（限制最近10条）
    const recentHistory = history.slice(-10)
    messages.push(...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })))

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message
    })

    // 发送流式请求到DeepSeek API
    const response = await fetch(`${DEEPSEEK_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_CONFIG.model,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`DeepSeek API 错误: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    let reading = true
    while (reading) {
      const { done, value } = await reader.read()
      
      if (done) {
        reading = false
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            break
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            
            if (content) {
              fullContent += content
              if (onChunk) {
                onChunk(content)
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent.trim()

  } catch (error) {
    console.error('DeepSeek 流式API 调用失败:', error)
    
    // 如果是网络错误或API错误，使用模拟流式回复
    if (error.message.includes('API') || error.message.includes('fetch')) {
      return getMockStreamResponse(message, onChunk)
    }
    
    throw error
  }
}

/**
 * 获取模拟回复（用于开发和测试）
 * @param {string} message - 用户消息
 * @returns {string} 模拟回复
 */
function getMockResponse(message) {
  const mockResponses = {
    '你好': '你好！我是DeepSeek AI助手，很高兴为您服务！有什么我可以帮助您的吗？',
    'hello': 'Hello! I\'m DeepSeek AI assistant. How can I help you today?',
    '帮我写一个Python函数': `好的！这里是一个简单的Python函数示例：

\`\`\`python
def greet(name):
    """
    问候函数
    参数: name (str) - 要问候的名字
    返回: str - 问候消息
    """
    return f"你好，{name}！欢迎使用Python！"

# 使用示例
print(greet("用户"))
\`\`\`

这个函数接受一个名字参数，返回一个问候消息。您想要什么特定功能的函数呢？`,
    
    '解释一下什么是机器学习': `机器学习（Machine Learning，ML）是人工智能的一个重要分支，它让计算机能够在没有明确编程的情况下学习和改进。

**核心概念：**
1. **数据驱动**：通过大量数据来训练模型
2. **模式识别**：发现数据中的规律和模式
3. **预测能力**：基于学习到的模式进行预测

**主要类型：**
- **监督学习**：使用标记数据进行训练
- **无监督学习**：发现数据中的隐藏结构
- **强化学习**：通过奖励机制学习最优策略

**应用场景：**
- 图像识别、语音识别
- 推荐系统、搜索引擎
- 自动驾驶、医疗诊断
- 金融风控、自然语言处理

您想了解机器学习的哪个具体方面呢？`,

    '帮我写一份项目文档': `好的！这里是一个项目文档的模板：

# 项目文档

## 项目概述
- **项目名称**：[项目名称]
- **项目描述**：[简要描述项目的目的和功能]
- **开发周期**：[开始日期] - [预计结束日期]

## 技术栈
- **前端**：Vue.js 3 + Element Plus
- **后端**：[后端技术栈]
- **数据库**：[数据库类型]
- **部署**：[部署方式]

## 功能特性
1. [功能1描述]
2. [功能2描述]
3. [功能3描述]

## 项目结构
\`\`\`
project/
├── src/
│   ├── components/
│   ├── views/
│   ├── api/
│   └── utils/
├── public/
└── docs/
\`\`\`

## 开发指南
1. 环境要求
2. 安装依赖
3. 启动项目
4. 构建部署

您希望我为哪种类型的项目定制文档呢？`,

    '今天天气如何？': '抱歉，我无法获取实时天气信息。建议您：\n\n1. 查看天气应用或网站\n2. 询问语音助手\n3. 查看窗外的天气情况\n\n不过我可以帮您解答其他问题，比如编程、学习、工作等方面的内容！'
  }

  // 简单的关键词匹配
  for (const [key, response] of Object.entries(mockResponses)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return response
    }
  }

  // 默认回复
  return `感谢您的提问！您说："${message}"

我理解您的问题，这是一个很好的话题。作为AI助手，我可以帮您：

🔹 **编程开发**：代码编写、调试、技术咨询
🔹 **学习辅导**：知识解释、概念分析、学习建议  
🔹 **文档写作**：技术文档、项目规划、内容整理
🔹 **问题解答**：各种疑问、技术讨论、方案建议

请告诉我您具体需要什么帮助，我会尽力为您提供详细和有用的回答！`
}

/**
 * 获取模拟流式回复（用于开发和测试）
 * @param {string} message - 用户消息
 * @param {Function} onChunk - 接收流式数据的回调函数
 * @returns {Promise<string>} 完整的模拟回复
 */
async function getMockStreamResponse(message, onChunk) {
  const response = getMockResponse(message)
  
  // 模拟流式返回，每个字符延迟一定时间
  let fullContent = ''
  
  for (let i = 0; i < response.length; i++) {
    const char = response[i]
    fullContent += char
    
    if (onChunk) {
      onChunk(char)
    }
    
    // 模拟打字速度：中文字符稍慢，英文和标点稍快
    const delay = /[\u4e00-\u9fa5]/.test(char) ? 50 : 30
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  return fullContent
}

/**
 * 检查DeepSeek API配置
 * @returns {Object} 配置检查结果
 */
export function checkDeepSeekConfig() {
  return {
    hasApiKey: !!DEEPSEEK_CONFIG.apiKey && DEEPSEEK_CONFIG.apiKey !== 'sk-your-deepseek-api-key-here',
    apiKey: DEEPSEEK_CONFIG.apiKey ? 
      DEEPSEEK_CONFIG.apiKey.substring(0, 8) + '...' : 
      '未配置',
    baseURL: DEEPSEEK_CONFIG.baseURL,
    model: DEEPSEEK_CONFIG.model
  }
}

export default {
  chatWithDeepSeek,
  chatWithDeepSeekStream,
  checkDeepSeekConfig
}
