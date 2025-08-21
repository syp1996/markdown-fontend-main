import axios from 'axios'
import { Message } from 'element-ui'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : process.env.VUE_APP_BASE_API,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('响应拦截器 - 原始响应:', response)
    console.log('响应拦截器 - 响应数据:', response.data)
    
    const res = response.data
    
    // 如果后端返回了code字段，则按code判断
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code !== 200 && res.code !== 0) {
        Message({
          message: res.message || '请求失败',
          type: 'error',
          duration: 5 * 1000
        })
        
        // 401: 未登录或token过期
        if (res.code === 401) {
          localStorage.removeItem('token')
          location.reload()
        }
        return Promise.reject(new Error(res.message || '请求失败'))
      }
    }
    
    // 如果没有code字段或code为200，直接返回数据
    return res
  },
  error => {
    console.log('响应拦截器 - 错误:', error)
    Message({
      message: error.message || '网络错误',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
