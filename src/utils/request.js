import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 创建 axios 实例：统一请求前缀与超时时间
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器：登录后自动在请求头携带 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.token = token;
  }
  return config;
});

// 响应拦截器：统一处理 { code, msg, data } 响应结构与登录失效
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 业务成功（code 为 1）：直接返回数据部分
    if (res.code === 1) {
      return res.data;
    }
    // 业务失败：统一提示错误信息
    ElMessage.error(res.msg || '操作失败');
    return Promise.reject(new Error(res.msg || '操作失败'));
  },
  (error) => {
    if (error.response?.status === 401) {
      // 登录失效：清除 token 并跳转登录页
      ElMessage.error('登录已失效，请重新登录');
      localStorage.removeItem('token');
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    } else {
      ElMessage.error('系统繁忙，请稍后重试');
    }
    return Promise.reject(error);
  },
);

export default request;
