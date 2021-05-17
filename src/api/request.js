import axios from 'axios'
// import { Notification } from 'element-ui'
import router from '@/router/index.js'
import { Dialog } from 'vant';

// const baseURL = 'http://192.168.31.128/open'
const baseURL = 'http://bz.baizitech.cn/open'

const service = axios.create({
  baseURL,
  timeout: 0,
  method: 'post'
})

// service.interceptors.request.use(config =>
//   // let token = localStorage.getItem('token')
//   // if (token) {
//   //   config.headers['bz-sso-sessionid'] = token
//   // }
//   )
service.interceptors.request.use(config => {
  return config
})

service.interceptors.response.use(response => {
  const { data } = response
  // blob
  if (data.size) {
    return data
  }
  switch (data.code) {
    case 200:
      return data.data
    case -1:
      return Promise.reject(new Error(data.msg))
    case -2:
      // 会话超过48小时或取消关注
      data.msg.includes('回复时间超过限制') && Dialog({ message: '用户已取关或回复时间超过48小时'});
      return Promise.reject(new Error(data.msg))
    default:
      // TODO
      localStorage.clear()
      router.push('/login')
  }
}, () => {
  // Notification({
  //   type: 'warning',
  //   title: '提示',
  //   message: '请求超时或服务器错误'
  // })
  Promise.reject(new Error('请求超时或服务器错误'))
})

export default service
