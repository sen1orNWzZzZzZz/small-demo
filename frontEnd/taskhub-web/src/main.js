import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { useTheme } from './composables/useTheme'

// 在应用启动时初始化主题
const { initTheme, setTheme } = useTheme()
initTheme()

// 将 setTheme 暴露到全局以测试
window.__setTheme = setTheme
window.__initTheme = initTheme
console.log('[TaskHub] 主题系统已初始化');
console.log('[TaskHub] 可以使用 window.__setTheme("cyanOrange") 等来切换主题');

// 测试：在页面加载待45秒后自动切换主题
// setTimeout(() => {
//   console.log('[TaskHub] 自动测试主题切换主题');
//   setTheme('cyanOrange');
// }, 4500);

const app = createApp(App)
app.use(router)
app.use(Antd)
app.mount('#app')
