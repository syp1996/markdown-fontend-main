import request from '@/utils/request'

/**
 * 知识库增强对话 - 简单版本
 * 调用后端API获取基于知识库的增强提示词
 * @param {string} message - 用户问题
 * @param {object} options - 可选参数
 * @returns {Promise<string>} 增强的提示词
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
  
  console.log('发送知识库API请求数据:', JSON.stringify(requestData))
  
  return request({
    url: '/ai/chat-simple',
    method: 'post',
    data: requestData
  })
}

export default {
  chatSimple
}