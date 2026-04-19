import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

service.interceptors.request.use(
  (config) => {
    // 所需请求头功能位
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = token
      config.headers['token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.success === false) {
      const message = res.message || res.error || 'Error'
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    } else {
      return res
    }
  },
  (error) => {
    console.error('err' + error)
    ElMessage.error(error.message)
    return Promise.reject(error)
  },
)

export default service
