import request from '@/utils/request'
import authManager from '@/utils/auth'

/**
 * 知识库增强对话（RAG 增强）
 * 调用后端增强 RAG 接口获取增强提示词
 * @param {string} message - 用户问题
 * @param {object} options - 可选参数
 * @returns {Promise<object>} 后端响应数据
 */
export function chatSimple(message, options = {}) {
  // 确保消息不为空并去除前后空格
  const trimmedMessage = message?.trim()
  
  if (!trimmedMessage || trimmedMessage.length === 0) {
    throw new Error('消息不能为空')
  }
  
  if (trimmedMessage.length > 1000) {
    throw new Error('消息太长，最多1000字符')
  }
  
  const requestData = {
    message: trimmedMessage,
    use_knowledge_base: options.use_knowledge_base !== false, // 默认为true
    similarity_threshold: options.similarity_threshold || 0.3,
    top_k: options.top_k || 5
  }
  
  console.log('发送增强RAG API请求数据:', JSON.stringify(requestData))
  
  return request({
    // 新接口：增强 RAG 对话
    // 按需求切换为新的知识库问答接口
    // 注意：全局 baseURL 已包含 `/api` 前缀，因此此处使用 `/v1/ask/stream`
    // 实际请求路径为：/api/v1/ask/stream
    url: '/v1/ask/stream',
    method: 'post',
    data: requestData
  })
}

/**
 * 知识库问答（流式）
 * 直接调用后端 /api/v1/ask/stream，并逐块输出内容
 * @param {string} message - 用户问题
 * @param {object} options - 可选参数（如相似度阈值、top_k 等）
 * @param {Function} onChunk - 流式输出回调
 * @returns {Promise<string>} 完整回复
 */
export async function askKnowledgeStream(message, options = {}, onChunk) {
  const trimmedMessage = message?.trim()
  if (!trimmedMessage) throw new Error('消息不能为空')

  // 组装请求体（与原有参数保持一致）
  const requestData = {
    message: trimmedMessage,
    use_knowledge_base: options.use_knowledge_base !== false,
    similarity_threshold: options.similarity_threshold || 0.3,
    top_k: options.top_k || 5
  }

  // 计算基础 API 前缀，保持与 axios 一致
  const API_BASE = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api'
    : (process.env.VUE_APP_BASE_API || '/api')

  const token = authManager.getToken()
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream, application/json;q=0.9, */*;q=0.8'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const resp = await fetch(`${API_BASE}/v1/ask/stream`, {
    method: 'POST',
    headers,
    // 不设置超时，等待后端生成
    body: JSON.stringify(requestData)
  })

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '')
    throw new Error(`知识库流式接口错误: ${resp.status} ${resp.statusText} ${errText}`.trim())
  }

  // 判断是否为 SSE
  const ct = resp.headers.get('content-type') || ''
  const isSSE = ct.includes('text/event-stream')

  // 读取流并尽可能兼容 SSE 或纯文本分块
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value, { stream: true })

    if (!isSSE) {
      // 普通文本分块，直接输出
      if (text) {
        full += text
        onChunk && onChunk(text)
      }
      continue
    }

    // SSE 模式：累积缓冲，按行处理，保留残余
    buffer += text
    let nlIndex
    while ((nlIndex = buffer.indexOf('\n')) !== -1) {
      const rawLine = buffer.slice(0, nlIndex)
      buffer = buffer.slice(nlIndex + 1)

      const line = rawLine.trimEnd()
      if (!line) continue // 跳过空行

      if (line.startsWith('data:')) {
        const dataStr = line.replace(/^data:\s?/, '')
        if (dataStr === '[DONE]') continue

        let piece = ''
        try {
          const parsed = JSON.parse(dataStr)
          // 兼容多种字段命名
          piece =
            parsed.content ||
            parsed.delta ||
            parsed.text ||
            parsed.answer ||
            parsed.message ||
            ''
          // 如果是 OpenAI 风格数据结构
          if (!piece && parsed.choices && parsed.choices[0]) {
            piece = parsed.choices[0].delta?.content || parsed.choices[0].message?.content || ''
          }
        } catch (_) {
          // 非 JSON，直接作为文本处理
          piece = dataStr
        }

        if (piece) {
          full += piece
          onChunk && onChunk(piece)
        }
      }
      // 其他如以冒号开头的注释行忽略
    }
  }

  // 处理缓冲区残余（SSE 下可能还有最后一行）
  if (buffer && isSSE) {
    const line = buffer.trim()
    if (line.startsWith('data:')) {
      const dataStr = line.replace(/^data:\s?/, '')
      if (dataStr !== '[DONE]') {
        let piece = ''
        try {
          const parsed = JSON.parse(dataStr)
          piece = parsed.content || parsed.delta || parsed.text || parsed.answer || parsed.message || ''
          if (!piece && parsed.choices && parsed.choices[0]) {
            piece = parsed.choices[0].delta?.content || parsed.choices[0].message?.content || ''
          }
        } catch (_) {
          piece = dataStr
        }
        if (piece) {
          full += piece
          onChunk && onChunk(piece)
        }
      }
    }
  }

  return full.trim()
}

export default {
  chatSimple,
  askKnowledgeStream
}
