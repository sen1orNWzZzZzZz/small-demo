import { ref, computed } from 'vue'

// 撞色主题配置
const themes = {
  // 主题1: 紫蓝撞色
  purpleBlue: {
    name: '紫蓝撞色',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    headerBackground: '#ffffff',
    headerBorder: '#e8eaef',
    headerText: '#1a1a1a',
    bodyBackground: '#f5f7fa',
    sidebarBackground: '#001529',
    sidebarText: '#ffffff',
    contentBackground: '#ffffff',
    contentText: '#1a1a1a',
  },
  // 主题2: 青橙撞色（暗黑）
  cyanOrange: {
    name: '青橙撞色',
    primary: '#00d4ff',
    secondary: '#0099cc',
    accent: '#ff6b6b',
    headerBackground: '#0f1419',
    headerBorder: '#1f2937',
    headerText: '#ffffff',
    bodyBackground: '#050a12',
    sidebarBackground: '#0a1625',
    sidebarText: '#ffffff',
    contentBackground: '#0f1419',
    contentText: '#e0e0e0',
  },
  // 主题3: 粉紫撞色
  pinkPurple: {
    name: '粉紫撞色',
    primary: '#ff006e',
    secondary: '#c7127f',
    accent: '#00d9ff',
    headerBackground: '#fdf5fb',
    headerBorder: '#f0d7ff',
    headerText: '#2c1645',
    bodyBackground: '#fef8fc',
    sidebarBackground: '#2c1645',
    sidebarText: '#ffffff',
    contentBackground: '#ffffff',
    contentText: '#2c1645',
  },
  // 主题4: 绿蓝撞色
  greenBlue: {
    name: '绿蓝撞色',
    primary: '#00d084',
    secondary: '#005c5a',
    accent: '#0066ff',
    headerBackground: '#f0fdf9',
    headerBorder: '#d4f5e9',
    headerText: '#0a3a34',
    bodyBackground: '#f7fffb',
    sidebarBackground: '#0a2622',
    sidebarText: '#ffffff',
    contentBackground: '#ffffff',
    contentText: '#0a3a34',
  },
  // 主题5: 红紫撞色
  redPurple: {
    name: '红紫撞色',
    primary: '#ff0055',
    secondary: '#9c006c',
    accent: '#00ffff',
    headerBackground: '#fff5f9',
    headerBorder: '#ffe0e6',
    headerText: '#4a0033',
    bodyBackground: '#fffbfd',
    sidebarBackground: '#2c0a2a',
    sidebarText: '#ffffff',
    contentBackground: '#ffffff',
    contentText: '#4a0033',
  },
  // 主题6: 黄蓝撞色
  yellowBlue: {
    name: '黄蓝撞色',
    primary: '#ffd60a',
    secondary: '#ffc300',
    accent: '#0096ff',
    headerBackground: '#fffef0',
    headerBorder: '#fff3cd',
    headerText: '#664d00',
    bodyBackground: '#fffff9',
    sidebarBackground: '#1a3a5c',
    sidebarText: '#ffffff',
    contentBackground: '#ffffff',
    contentText: '#664d00',
  },
}

const currentTheme = ref('purpleBlue')

// 获取当前主题配置
const getCurrentTheme = computed(() => {
  return themes[currentTheme.value]
})

// 切换主题
const setTheme = (themeName) => {
  if (themes[themeName]) {
    currentTheme.value = themeName
    // 保存到本地存储
    localStorage.setItem('app-theme', themeName)
    // 更新 CSS 变量
    applyTheme(themes[themeName])
    
    // 强制测趋重新计算样式，确保主题改变生效
    setTimeout(() => {
      const root = document.documentElement;
      // 触发重排
      root.offsetHeight;
      // 强制更新
      if (root.style.color === '') {
        root.style.color = 'inherit';
        root.style.color = '';
      }
    }, 50);
  }
}

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('app-theme') || 'purpleBlue'
  currentTheme.value = savedTheme
  applyTheme(themes[savedTheme])
}

// 应用主题到 CSS 变量
const applyTheme = (theme) => {
  if (!theme) return;
  
  // 确保 DOM 已准备好
  const root = document.documentElement;
  if (!root) {
    setTimeout(() => applyTheme(theme), 100);
    return;
  }
  
  console.log('[useTheme] 应用主题:', theme.name);
  console.log('[useTheme] headerBackground:', theme.headerBackground);
  console.log('[useTheme] headerText:', theme.headerText);
  
  // 使用 setProperty 方法，确保样式优先级足够高
  root.style.setProperty('--color-primary', theme.primary, 'important');
  root.style.setProperty('--color-secondary', theme.secondary, 'important');
  root.style.setProperty('--color-accent', theme.accent, 'important');
  root.style.setProperty('--color-header-background', theme.headerBackground, 'important');
  root.style.setProperty('--color-header-border', theme.headerBorder, 'important');
  root.style.setProperty('--color-header-text', theme.headerText, 'important');
  root.style.setProperty('--color-body-background', theme.bodyBackground, 'important');
  root.style.setProperty('--color-sidebar-background', theme.sidebarBackground, 'important');
  root.style.setProperty('--color-sidebar-text', theme.sidebarText, 'important');
  root.style.setProperty('--color-content-background', theme.contentBackground, 'important');
  root.style.setProperty('--color-content-text', theme.contentText, 'important');
  
  // 验证 CSS 变量是否磨设置
  const headerBg = getComputedStyle(root).getPropertyValue('--color-header-background');
  const headerText = getComputedStyle(root).getPropertyValue('--color-header-text');
  console.log('[useTheme] 验证 - headerBackground:', headerBg.trim());
  console.log('[useTheme] 验证 - headerText:', headerText.trim());
  console.log('[useTheme] 主题应用完成');
}

// 获取所有主题列表
const getAllThemes = computed(() => {
  return Object.keys(themes).map(key => ({
    key,
    name: themes[key].name
  }))
})

export function useTheme() {
  return {
    currentTheme,
    getCurrentTheme,
    setTheme,
    initTheme,
    getAllThemes,
    themes
  }
}
