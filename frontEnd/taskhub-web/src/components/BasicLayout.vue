<template>  
  <a-layout style="width: 100%; height: 100%; display: flex; flex-direction: column; margin: 0; padding: 0">  
    <!-- 顶部导航栏 -->
    <div class="custom-header">
      <div class="header-left">
        <a-button 
          type="text" 
          size="large" 
          @click="drawerVisible = true"
          class="menu-trigger"
        >
          <MenuOutlined style="font-size: 20px" />
        </a-button>
        <div class="logo-mini">
          <img src="/vite.svg" alt="logo" class="logo-img" />
          <span class="logo-text">TaskHub</span>
        </div>
      </div>
      <div class="header-right">
        <!-- 主题切换 -->
        <a-dropdown class="theme-dropdown">
          <template #overlay>
            <a-menu 
              @click="handleThemeChange"
              :style="{
                'background-color': 'var(--color-header-background)',
                'color': 'var(--color-header-text)'
              }"
            >
              <a-menu-item key="purpleBlue" :style="{ 'color': 'var(--color-header-text)' }">
                <div class="theme-option">
                  <span class="theme-dot" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"></span>
                  <span>紫蓝撞色</span>
                </div>
              </a-menu-item>
              <a-menu-item key="cyanOrange" :style="{ 'color': 'var(--color-header-text)' }">
                <div class="theme-option">
                  <span class="theme-dot" style="background: linear-gradient(135deg, #00d4ff 0%, #ff6b6b 100%)"></span>
                  <span>青橙撞色</span>
                </div>
              </a-menu-item>
              <a-menu-item key="pinkPurple" :style="{ 'color': 'var(--color-header-text)' }">
                <div class="theme-option">
                  <span class="theme-dot" style="background: linear-gradient(135deg, #ff006e 0%, #00d9ff 100%)"></span>
                  <span>粉紫撞色</span>
                </div>
              </a-menu-item>
              <a-menu-item key="greenBlue" :style="{ 'color': 'var(--color-header-text)' }">
                <div class="theme-option">
                  <span class="theme-dot" style="background: linear-gradient(135deg, #00d084 0%, #0066ff 100%)"></span>
                  <span>绿蓝撞色</span>
                </div>
              </a-menu-item>
              <a-menu-item key="redPurple" :style="{ 'color': 'var(--color-header-text)' }">
                <div class="theme-option">
                  <span class="theme-dot" style="background: linear-gradient(135deg, #ff0055 0%, #00ffff 100%)"></span>
                  <span>红紫撞色</span>
                </div>
              </a-menu-item>
              <a-menu-item key="yellowBlue" :style="{ 'color': 'var(--color-header-text)' }">
                <div class="theme-option">
                  <span class="theme-dot" style="background: linear-gradient(135deg, #ffd60a 0%, #0096ff 100%)"></span>
                  <span>黄蓝撞色</span>
                </div>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button type="text" size="large" class="theme-trigger">
            <BgColorsOutlined style="font-size: 18px" />
          </a-button>
        </a-dropdown>
        
        <div class="notification-icon">
          <a-badge :count="3">
            <a-button type="text" size="large" style="color: var(--color-header-text)">
              <BellOutlined style="font-size: 18px" />
            </a-button>
          </a-badge>
        </div>
        <div class="user-info">
          <a-dropdown>
            <template #overlay>
              <a-menu
                :style="{
                  'background-color': 'var(--color-header-background)',
                  'color': 'var(--color-header-text)'
                }"
              >
                <a-menu-item key="profile" :style="{ 'color': 'var(--color-header-text)' }">
                  <UserOutlined /> 个人中心
                </a-menu-item>
                <a-menu-item key="settings" :style="{ 'color': 'var(--color-header-text)' }">
                  <SettingOutlined /> 设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" :style="{ 'color': 'var(--color-header-text)' }" @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
            <div style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
              <a-avatar style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); cursor: pointer">User</a-avatar>
              <div class="user-detail">
                <div class="user-name">管理员</div>
                <div class="user-status">在线</div>
              </div>
            </div>
          </a-dropdown>
        </div>
      </div>
    </div>
    
    <!-- 抽屉式导航菜单 -->
    <a-drawer
      v-model:open="drawerVisible"
      :closable="false"
      placement="left"
      :width="260"
      class="nav-drawer"
      :body-style="{ padding: 0, background: 'var(--color-header-background)' }"
    >
      <div class="drawer-header">
        <div class="drawer-logo">
          <div class="logo-icon">
            <img src="/vite.svg" alt="logo" />
          </div>
          <span class="drawer-logo-text">TaskHub</span>
        </div>
        <a-button 
          type="text" 
          size="large" 
          @click="drawerVisible = false"
          class="close-btn"
        >
          <CloseOutlined style="font-size: 18px" class="close-icon" />
        </a-button>
      </div>
      
      <a-menu 
        v-model:selectedKeys="selectedKeys" 
        theme="dark" 
        mode="inline" 
        class="drawer-menu"
        @click="drawerVisible = false"
      >
        <a-menu-item key="dashboard" class="menu-item-custom">
          <template #icon><DashboardOutlined /></template>
          <router-link to="/dashboard" class="menu-link">工作台</router-link>
        </a-menu-item>
        <a-menu-item key="projects" class="menu-item-custom">
          <template #icon><ProjectOutlined /></template>
          <router-link to="/projects" class="menu-link">项目管理</router-link>
        </a-menu-item>
        <a-menu-item key="tasks" class="menu-item-custom">
          <template #icon><CheckSquareOutlined /></template>
          <router-link to="/my-tasks" class="menu-link">我的任务</router-link>
        </a-menu-item>
        <a-menu-item key="users" class="menu-item-custom">
          <template #icon><UserOutlined /></template>
          <router-link to="/users" class="menu-link">用户管理</router-link>
        </a-menu-item>
      </a-menu>
      
      <div class="drawer-footer">
        <a-divider style="margin: 12px 0; background: rgba(255, 255, 255, 0.1)" />
        <div class="drawer-user">
          <a-avatar style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)">User</a-avatar>
          <div>
            <div class="drawer-user-name">管理员用户</div>
            <div class="drawer-user-status">在线</div>
          </div>
        </div>
      </div>
    </a-drawer>
    
    <!-- 内容区域，核心业务页面在这里渲染 -->  
    <a-layout-content style="flex: 1; overflow-y: auto; padding: 0">  
      <!-- router-view 是关键 -->  
      <router-view />  
    </a-layout-content>  
  
    <a-layout-footer style="text-align: center; background: var(--color-body-background); color: var(--color-content-text); border-top: 1px solid var(--color-header-border); transition: all 0.3s ease; padding: 24px 50px !important">  
      TaskHub Project Management System ©2023 Created by You  
    </a-layout-footer>  
  </a-layout>  
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
  BgColorsOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue';  
import { useTheme } from '../composables/useTheme';

const router = useRouter();
const { setTheme } = useTheme();
const drawerVisible = ref(false);
const selectedKeys = ref(['dashboard']);

const handleThemeChange = (e) => {
  console.log('点击了主题菜单，事件对象:', e);
  const themeKey = e.key || e;
  console.log('主题 key:', themeKey);
  setTheme(themeKey);
  // 强制重新棒绣布局以磁上主题变化
  setTimeout(() => {
    console.log('强制刷新布局');
    window.dispatchEvent(new Event('resize'));
    // 正法强制颇扈5回流
    document.body.offsetHeight;
  }, 50);
}

const handleLogout = () => {
  // 清除所有用户相关数据（处理多用户登录情况）
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  
  message.success('已退出登录');
  // 跳转到登录页
  router.push('/login');
}
</script>

<style scoped>
:deep(.ant-layout) {
  display: flex;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.ant-layout-content) {
  padding: 0 !important;
  background: transparent;
}

:deep(.ant-layout-footer) {
  padding: 24px 50px !important;
  background: var(--color-body-background) !important;
  color: var(--color-content-text) !important;
  border-top: 1px solid var(--color-header-border);
  transition: all 0.3s ease;
}

/* 顾部导航栏 */
.custom-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
/* 主题颜色一律由全局样式或 CSS 变量控制 */

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-trigger {
  transition: all 0.3s ease;
}

.menu-trigger:hover {
  background: var(--color-header-border);
  transform: scale(1.1);
  transition: all 0.3s ease;
}

.logo-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  height: 32px;
  width: 32px;
  animation: logoRotate 3s linear infinite;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 主题切换 */
.theme-dropdown {
  transition: all 0.3s ease;
}

.theme-trigger {
  transition: all 0.3s ease;
}

.theme-trigger:hover {
  background: var(--color-header-border);
  transform: scale(1.1) rotateZ(90deg);
  transition: all 0.3s ease;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
}

.notification-icon {
  transition: all 0.3s ease;
}

.notification-icon:hover {
  transform: scale(1.1);
}

:deep(.ant-badge-count) {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%) !important;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4) !important;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: var(--color-header-border);
  transition: all 0.3s ease;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.user-status {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  transition: all 0.3s ease;
}

/* 抽屉式导航 */
:deep(.ant-drawer) {
  z-index: 1000;
}

:deep(.ant-drawer-content-wrapper) {
  width: 260px !important;
}

:deep(.ant-drawer-body) {
  padding: 0 !important;
  background: var(--color-header-background) !important;
  transition: all 0.3s ease;
}

:deep(.ant-drawer-header) {
  border-bottom: 1px solid var(--color-header-border);
  background: var(--color-header-background) !important;
}

:deep(.ant-drawer-title) {
  color: var(--color-header-text) !important;
}

.nav-drawer {
  z-index: 1000;
}

.drawer-header {
  height: 80px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-header-border);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  transition: all 0.3s ease;
}

.drawer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.drawer-logo:hover .logo-icon {
  transform: scale(1.1) rotateZ(5deg);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.logo-icon img {
  height: 24px;
  width: 24px;
}

.drawer-logo-text {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.close-btn {
  padding: 0;
  min-width: auto;
  color: #fff !important;
}

/* 抽屉菜单 */
.drawer-menu {
  padding-top: 12px;
  background: var(--color-header-background) !important;
}

:deep(.ant-menu) {
  background-color: var(--color-header-background) !important;
}

:deep(.ant-menu-item) {
  color: var(--color-header-text) !important;
}

:deep(.ant-menu-item-selected) {
  background: var(--color-header-border) !important;
  border-radius: 8px !important;
  color: var(--color-primary) !important;
}

/* 抽屉底部用户信息 */
.drawer-footer {
  padding: 16px;
  background: var(--color-header-border);
  border-top: 1px solid var(--color-header-border);
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-header-text);
}

.drawer-user-status {
  font-size: 11px;
  color: var(--color-header-text);
  opacity: 0.7;
}

/* 动画 */
@keyframes logoRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 抽屉打开动画 */
:deep(.ant-drawer-content-wrapper) {
  animation: drawerSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes drawerSlideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

:deep(.ant-dropdown-menu) {
  min-width: 160px;
  background: var(--color-header-background) !important;
  color: var(--color-header-text) !important;
}

/* 只针对导航栏菜单，不影响抽屉菜单 */
.custom-header :deep(.ant-menu) {
  background: var(--color-header-background) !important;
  color: var(--color-header-text) !important;
}

.custom-header :deep(.ant-menu-item) {
  color: var(--color-header-text) !important;
  background: var(--color-header-background) !important;
}

.custom-header :deep(.ant-menu-item:hover) {
  color: var(--color-primary) !important;
  background: var(--color-header-border) !important;
}
</style>

<!-- 根据主题变量应用导航栏样式（非 scoped）-->
<style>
/* 强制覆盖 scoped 样式，确保导航栏颜色会随主题变化 */
.custom-header {
  background: var(--color-header-background) !important;
  color: var(--color-header-text) !important;
  border-bottom: 1px solid var(--color-header-border) !important;
  transition: all 0.3s ease !important;
}

.custom-header .ant-btn,
.custom-header button {
  color: var(--color-header-text) !important;
  transition: color 0.3s ease !important;
}

.custom-header .ant-btn:hover,
.custom-header .ant-btn:focus,
.custom-header button:hover,
.custom-header button:focus {
  color: var(--color-primary) !important;
}

.custom-header .logo-text,
.custom-header .user-name,
.custom-header .menu-trigger,
.custom-header .theme-trigger {
  color: var(--color-header-text) !important;
}

/* 主题切换下拉菜单样式 */
.ant-dropdown-menu {
  background: var(--color-header-background) !important;
}

.ant-dropdown-menu-item {
  color: var(--color-header-text) !important;
  background: var(--color-header-background) !important;
}

.ant-dropdown-menu-item:hover {
  color: var(--color-primary) !important;
  background: var(--color-header-border) !important;
}

/* 控制 Ant Design 的下拉菜单上加阴影 */
.ant-dropdown {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15)) !important;
}
</style>
