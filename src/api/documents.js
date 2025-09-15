/*
 * @Author: syp1996 304899670@qq.com
 * @Date: 2025-08-22 13:58:01
 * @LastEditors: syp1996 304899670@qq.com
 * @LastEditTime: 2025-08-22 20:34:02
 * @FilePath: \markdown-fontend-main\src\api\documents.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

// 获取文档列表
export function getDocuments(params) {
  return request({
    url: '/documents',
    method: 'get',
    params
  })
}

// 获取单个文档（支持传入 axios 配置，如 signal 以便取消请求）
export function getDocumentById(id, config = {}) {
  return request({
    url: `/documents/${id}`,
    method: 'get',
    ...config
  })
}

// 创建文档（RAG版）
export function createDocument(data) {
  return request({
    url: '/v1/ingest/text',
    method: 'post',
    data
  })
}

// 更新文档（RAG版）
export function updateDocument(id, data) {
  return request({
    url: `/v1/ingest/text/${id}`,
    method: 'put',
    data
  })
}

// 删除文档
export function deleteDocument(id) {
  return request({
    url: `/documents/${id}`,
    method: 'delete'
  })
}

// 上传文档
export function uploadDocument(data) {
  return request({
    url: '/documents/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 搜索文档
export function searchDocuments(keyword) {
  return request({
    url: '/documents/search',
    method: 'get',
    params: {
      keyword
    }
  })
}
