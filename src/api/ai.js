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
    // 默认不做相似度过滤，避免误筛掉高相关片段
    similarity_threshold: options.similarity_threshold ?? 0,
    score_threshold: options.score_threshold ?? 0,
    // 可选检索调优参数（按后端支持透传）
    nprobe: options.nprobe ?? 16,
    per_doc_max: options.per_doc_max ?? null,
    mmr: options.mmr ?? false,
    min_unique_docs: options.min_unique_docs ?? null,
    rerank: options.rerank ?? null
    // 不默认传 top_k，按需由调用方指定
    // ...(options.top_k != null ? { top_k: options.top_k } : {})
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
    // 默认不做相似度过滤，避免误筛
    similarity_threshold: options.similarity_threshold ?? 0,
    score_threshold: options.score_threshold ?? 0,
    // 可选检索调优参数（按后端支持透传）
    nprobe: options.nprobe ?? 16,
    per_doc_max: options.per_doc_max ?? null,
    mmr: options.mmr ?? false,
    min_unique_docs: options.min_unique_docs ?? null,
    rerank: options.rerank ?? null
    // 不默认传 top_k，按需由调用方指定
    // ...(options.top_k != null ? { top_k: options.top_k } : {})
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
    // 避免缓存/变换，确保流式直通
    cache: 'no-store',
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

    // SSE 模式：按空行分隔事件，支持多行 data: 合并，忽略心跳行“:”
    buffer += text
    let sepIndex
    while ((sepIndex = buffer.indexOf('\n\n')) >= 0) {
      const rawEvent = buffer.slice(0, sepIndex)
      buffer = buffer.slice(sepIndex + 2)

      const event = rawEvent.trimEnd()
      if (!event) continue
      if (event.startsWith(':')) continue // 心跳

      // 合并多行 data:
      const dataLines = event
        .split('\n')
        .filter(l => l.startsWith('data:'))
        .map(l => l.replace(/^data:\s?/, ''))
      if (dataLines.length === 0) continue

      const dataStr = dataLines.join('\n')
      if (dataStr === '[DONE]') continue

      let piece = ''
      try {
        const parsed = JSON.parse(dataStr)
        piece =
          parsed.content ||
          parsed.delta ||
          parsed.text ||
          parsed.answer ||
          parsed.message || ''
        if (!piece && parsed.choices && parsed.choices[0]) {
          piece = parsed.choices[0].delta?.content || parsed.choices[0].message?.content || ''
        }
      } catch (_) {
        // 非 JSON，直接作为文本处理
        piece = dataStr
      }

      if (piece) {
        full += piece
        try { onChunk && onChunk(piece) } catch (e) { /* 忽略 UI 回调异常 */ }
      }
    }
  }

  // 处理残余事件
  if (buffer && isSSE) {
    const event = buffer.trim()
    if (event && !event.startsWith(':')) {
      const dataLines = event
        .split('\n')
        .filter(l => l.startsWith('data:'))
        .map(l => l.replace(/^data:\s?/, ''))
      const dataStr = dataLines.join('\n')
      if (dataStr && dataStr !== '[DONE]') {
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
          try { onChunk && onChunk(piece) } catch (_) {}
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
