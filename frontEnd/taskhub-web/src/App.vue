<script setup>
import { useTheme } from './composables/useTheme'
import { watch, onMounted } from 'vue'

// 需要在组件加载前就不断地初始化主题
const { initTheme, setTheme, currentTheme } = useTheme()

// 立即初始化主题不要等待
setTimeout(() => {
  console.log('[TaskHub] 主题初始化中...')
  initTheme()
}, 0)

// 将 setTheme 暴露到全局以测试
window.__setTheme = setTheme
console.log('[TaskHub] 主题系统已初始化，可以使用 window.__setTheme(\'cyanOrange\') 等来测试')

// 监听主题变化
watch(currentTheme, (newTheme) => {
  console.log('[TaskHub] 主题已改变:', newTheme);
  const el = document.getElementById('theme-name');
  if (el) {
    el.textContent = newTheme;
  }
});

onMounted(() => {
  // 初始化主题名称显示
  const el = document.getElementById('theme-name');
  if (el) {
    el.textContent = currentTheme.value;
  }
});
</script>

<template>
  <div style="display: flex; height: 100vh; flex-direction: column;">
    <!-- 调试条 - 显示当前主题 -->
    <!-- <div id="theme-debug" style="
      height: 30px;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      padding: 0 16px;
      font-size: 12px;
      font-weight: bold;
      flex-shrink: 0;
      z-index: 9999;
    ">
      当前主题色 (var(--color-primary)): <span id="theme-name" style="margin-left: 8px;"></span>
    </div> -->
    <!-- 主内容 -->
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-body-background);
  transition: background-color 0.3s ease;
}

#app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
