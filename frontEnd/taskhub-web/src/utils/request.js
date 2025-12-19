// 统一请求封装
import { message } from 'ant-design-vue'
import API_CONFIG from '../config/api'

/**
 * 通用请求方法
 * @param {string} url - 请求地址
 * @param {object} options - fetch配置项
 * @returns {Promise<any>}
 */
export async function request(url, options = {}) {
  const token = localStorage.getItem('token')
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...options
  }
  
  try {
    const response = await fetch(url, defaultOptions)
    
    // 处理401未授权
    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('登录已过期，请重新登录')
    }
    
    // 处理其他HTTP错误
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `请求失败: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('请求错误:', error)
    throw error
  }
}

/**
 * GET请求
 */
export function get(url, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return request(fullUrl, {
    method: 'GET'
  })
}

/**
 * POST请求
 */
export function post(url, data = {}) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * PUT请求
 */
export function put(url, data = {}) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE请求
 */
export function del(url) {
  return request(url, {
    method: 'DELETE'
  })
}
