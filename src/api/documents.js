import request from '@/utils/request'

// 获取文档列表
export function getDocuments(params) {
  return request({
    url: '/documents',
    method: 'get',
    params
  })
}

// 获取单个文档
export function getDocument(id) {
  return request({
    url: `/documents/${id}`,
    method: 'get'
  })
}

// 创建文档
export function createDocument(data) {
  return request({
    url: '/documents',
    method: 'post',
    data
  })
}

// 更新文档
export function updateDocument(id, data) {
  return request({
    url: `/documents/${id}`,
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
