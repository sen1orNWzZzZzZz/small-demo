<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-animation"></div>
      <div class="bg-overlay"></div>
    </div>
    
    <div class="login-content">
      <div class="login-box">
        <div class="login-header">
          <div class="logo">
            <img src="/vite.svg" alt="logo" class="logo-img" />
          </div>
          <h1 class="app-title">TaskHub</h1>
          <p class="app-subtitle">项目管理系统</p>
        </div>

        <a-form
          :model="formState"
          @finish="handleLogin"
          class="login-form"
          layout="vertical"
        >
          <a-form-item
            name="username"
            :rules="[{ required: true, message: '请输入用户名' }]"
          >
            <a-input
              v-model:value="formState.username"
              size="large"
              placeholder="用户名"
              class="login-input"
            >
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[{ required: true, message: '请输入密码' }]"
          >
            <a-input-password
              v-model:value="formState.password"
              size="large"
              placeholder="密码"
              class="login-input"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <div class="form-options">
              <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
              <a class="forgot-link">忘记密码？</a>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              class="login-button"
              :loading="loading"
              block
            >
              登录
            </a-button>
          </a-form-item>

          <div class="register-link">
            还没有账号？<a>立即注册</a>
          </div>
        </a-form>

        <div class="login-footer">
          <span>© 2023 TaskHub. All rights reserved.</span>
        </div>
      </div>

      <div class="feature-display">
        <div class="feature-item">
          <ProjectOutlined class="feature-icon" />
          <h3>项目管理</h3>
          <p>高效的项目协作与任务分配</p>
        </div>
        <div class="feature-item">
          <TeamOutlined class="feature-icon" />
          <h3>团队协作</h3>
          <p>实时沟通，无缝协作</p>
        </div>
        <div class="feature-item">
          <DashboardOutlined class="feature-icon" />
          <h3>数据分析</h3>
          <p>可视化数据，洞察项目进度</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  LockOutlined,
  ProjectOutlined,
  TeamOutlined,
  DashboardOutlined,
} from '@ant-design/icons-vue'
import { post } from '../utils/request'
import { API_ENDPOINTS } from '../config/api'

const router = useRouter()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: '',
  remember: false,
})

const handleLogin = async () => {
  loading.value = true
  
  try {
    const data = await post(API_ENDPOINTS.LOGIN, {
      username: formState.username,
      password: formState.password,
    })
    
    // 清除之前的用户数据（处理多用户登录情况）
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    
    // 存储新用户的登录信息
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    if (data.userId) {
      localStorage.setItem('userId', data.userId)
    }
    if (data.username) {
      localStorage.setItem('username', data.username)
    }
    
    message.success('登录成功！')
    router.push('/dashboard')
    
  } catch (error) {
    console.error('登录错误:', error)
    message.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  z-index: 0;
}

.bg-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  animation: bgFloat 20s ease-in-out infinite;
}

@keyframes bgFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(-20px, -20px) scale(1.05);
  }
  50% {
    transform: translate(20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(-20px, 20px) scale(1.02);
  }
}

.bg-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
}

.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 80px;
  align-items: center;
  max-width: 1200px;
  padding: 40px;
}

.login-box {
  background: rgba(255, 255, 255, 0.98);
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 420px;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-img {
  width: 40px;
  height: 40px;
  animation: logoRotate 10s linear infinite;
}

@keyframes logoRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-top: 32px;
}

.login-input {
  border-radius: 12px;
  border: 2px solid #e8eaef;
  transition: all 0.3s ease;
}

.login-input:hover,
.login-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.input-icon {
  color: #999;
  font-size: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.forgot-link:hover {
  color: var(--color-secondary);
}

.login-button {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: var(--color-primary);
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link a:hover {
  color: var(--color-secondary);
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.feature-display {
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: fadeInRight 0.8s ease-out 0.2s backwards;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  min-width: 280px;
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 48px;
  color: #fff;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.feature-item h3 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
}

.feature-item p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
    gap: 40px;
  }

  .feature-display {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
  }

  .feature-item {
    min-width: 220px;
  }
}

@media (max-width: 768px) {
  .login-content {
    padding: 20px;
  }

  .login-box {
    width: 100%;
    max-width: 400px;
    padding: 32px 24px;
  }

  .feature-display {
    display: none;
  }
}
</style>
