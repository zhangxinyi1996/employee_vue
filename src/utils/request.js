import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
    baseURL: 'http://localhost:9999/employee_management',
    timeout: 5000
})

// 请求拦截器：自动带上 Token
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = 'Bearer ' + token
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器：统一返回格式处理
instance.interceptors.response.use(
    response => {
        const res = response.data
        if (res.code !== 200) {
            return Promise.reject({
                response: {
                    data: {
                        code: res.code,
                        message: res.message || 'エラーが発生しました',
                        data: res.data
                    }
                }
            })
        }
        return res.data
    },
    error => {
        // 尝试从后端的 response body 中提取 code/message
        const res = error.response?.data
        return Promise.reject({
            response: {
                data: {
                    code: res?.code || error.response?.status || 500,
                    message: res?.message || 'ネットワークエラー',
                    data: res?.data || null
                }
            }
        })
    }
)

export default instance
