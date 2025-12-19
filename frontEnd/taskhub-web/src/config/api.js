// API配置 - 支持微服务架构
const API_CONFIG = {
  // 基础配置 - 开发环境使用代理，生产环境使用完整地址
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  TIMEOUT: 30000,
  
  // 微服务端点（预留）
  SERVICES: {
    AUTH: '/api/auth',      // 认证服务
    PROJECT: '/api/project', // 项目服务（预留）
    TASK: '/api/task',      // 任务服务（预留）
    USER: '/api/user',      // 用户服务（预留）
  }
}

// API端点
export const API_ENDPOINTS = {
  // 认证相关
  LOGIN: `${API_CONFIG.BASE_URL}${API_CONFIG.SERVICES.AUTH}/login`,
  LOGOUT: `${API_CONFIG.BASE_URL}${API_CONFIG.SERVICES.AUTH}/logout`,
  REFRESH_TOKEN: `${API_CONFIG.BASE_URL}${API_CONFIG.SERVICES.AUTH}/refresh`,
  
  // 项目相关
  PROJECT_CREATE: `${API_CONFIG.BASE_URL}/system/project`,
  PROJECT_LIST: `${API_CONFIG.BASE_URL}/system/project/list`,
  PROJECT_DETAIL: (id) => `${API_CONFIG.BASE_URL}/system/project/${id}`,
  PROJECT_UPDATE: (id) => `${API_CONFIG.BASE_URL}/system/project/${id}`,
  PROJECT_DELETE: (id) => `${API_CONFIG.BASE_URL}/system/project/${id}`,
  PROJECT_SEARCH: `${API_CONFIG.BASE_URL}/system/project/search`,
  PROJECT_SCREEN: `${API_CONFIG.BASE_URL}/system/project/screen`,
  PROJECT_STATIC: (id) => `${API_CONFIG.BASE_URL}/system/project/getStatic/${id}`,
  
  // 任务相关
  TASK_CREATE: `${API_CONFIG.BASE_URL}/system/task`,
  TASK_LIST: `${API_CONFIG.BASE_URL}/system/task/list`,
  TASK_DETAIL: (id) => `${API_CONFIG.BASE_URL}/system/task/${id}`,
  TASK_UPDATE: (id) => `${API_CONFIG.BASE_URL}/system/task/${id}`,
  TASK_DELETE: (id) => `${API_CONFIG.BASE_URL}/system/task/${id}`,
  TASK_BY_PROJECT: (projectId) => `${API_CONFIG.BASE_URL}/system/task/project/${projectId}`,
  TASK_BY_USER: (userId) => `${API_CONFIG.BASE_URL}/system/task/user/${userId}`,
  TASK_UPDATE_STATUS: (id) => `${API_CONFIG.BASE_URL}/system/task/${id}/status`,
  TASK_ASSIGN: `${API_CONFIG.BASE_URL}/system/task/pointTo`,
  
  // 用户相关
  USER_LIST: `${API_CONFIG.BASE_URL}/system/sys-user/list`,
  USER_CREATE: `${API_CONFIG.BASE_URL}/system/sys-user`,
  USER_UPDATE: (id) => `${API_CONFIG.BASE_URL}/system/sys-user/${id}`,
  USER_DELETE: (id) => `${API_CONFIG.BASE_URL}/system/sys-user/${id}`,
  USER_DETAIL: (id) => `${API_CONFIG.BASE_URL}/system/sys-user/${id}`,
}

export default API_CONFIG
