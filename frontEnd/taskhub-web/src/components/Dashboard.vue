<template>
  <div class="dashboard-container">
    <!-- 顶部渐变背景 -->
    <div class="gradient-background"></div>

    <div class="dashboard-content">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <h1 class="welcome-title">欢迎回来，管理员</h1>
        <p class="welcome-subtitle">{{ currentTime }}</p>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-grid">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <!-- 背景波浪装饰 -->
          <div class="card-wave" :style="{ background: stat.color }"></div>
          
          <div class="stat-top">
            <div class="stat-icon" :style="{ background: stat.color }">
              <component :is="stat.icon" style="font-size: 28px; color: white" />
            </div>
            <div class="stat-info">
              <div class="stat-value" :ref="`stat${index}`">0</div>
              <div class="stat-trend" :class="stat.trend">
                <arrow-up-outlined v-if="stat.trend === 'up'" />
                <arrow-down-outlined v-else />
                <span>{{ stat.change }}</span>
              </div>
            </div>
          </div>
          
          <div class="stat-bottom">
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          
          <!-- 边框光晕 -->
          <div class="card-glow" :style="{ background: stat.color }"></div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <!-- 项目进度 -->
        <div class="chart-card">
          <h3>项目进度分布</h3>
          <div ref="projectChart" class="chart"></div>
        </div>

        <!-- 任务完成情况 -->
        <div class="chart-card">
          <h3>本周任务完成度</h3>
          <div ref="taskChart" class="chart"></div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="activities-section">
        <h3>最近活动</h3>
        <div class="activities-list">
          <div v-for="(activity, index) in activities" :key="index" class="activity-item" :style="{ animationDelay: `${index * 0.05}s` }">
            <div class="activity-dot"></div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { CountUp } from 'countup.js'
import { get } from '../utils/request'
import { API_ENDPOINTS } from '../config/api'
import { message } from 'ant-design-vue'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons-vue'

const currentTime = ref('')
const projectChart = ref(null)
const taskChart = ref(null)

const stats = ref([
  {
    label: '总项目数',
    value: 0,
    percentage: 75,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: ProjectOutlined,
    trend: 'up',
    change: '+12%',
  },
  {
    label: '已完成任务',
    value: 0,
    percentage: 85,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: CheckCircleOutlined,
    trend: 'up',
    change: '+8%',
  },
  {
    label: '进行中',
    value: 0,
    percentage: 60,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: ClockCircleOutlined,
    trend: 'down',
    change: '-3%',
  },
  {
    label: '团队成员',
    value: 0,
    percentage: 90,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: TeamOutlined,
    trend: 'up',
    change: '+5%',
  },
])

const activities = ref([])

// 加载看板数据
const loadDashboardData = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT_SCREEN);
    if (response.code === 200 && response.data) {
      const data = response.data;
      
      // 更新统计数据
      stats.value[0].value = data.totalProjects || 0;
      stats.value[1].value = data.completedTasks || 0;
      stats.value[2].value = data.ongoingTasks || 0;
      stats.value[3].value = data.projectMembers || 0;
      
      // 更新最近活动
      if (data.activities && Array.isArray(data.activities)) {
        activities.value = data.activities.map(item => ({
          text: item.content || '',
          time: formatActivityTime(item.time)
        }));
      }
      
      // 更新图表
      nextTick(() => {
        initCountUp();
        initProjectChart(data);
        initTaskChart(data.weeklyTasks);
      });
    }
  } catch (error) {
    console.error('加载看板数据失败:', error);
    message.error('加载数据失败');
  }
};

// 格式化活动时间
const formatActivityTime = (dateStr) => {
  if (!dateStr) return '刚刚';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return `${date.getMonth() + 1}-${date.getDate()}`;
};

// 初始化统计数字动画
const initCountUp = () => {
  stats.value.forEach((stat, index) => {
    const elements = document.querySelectorAll('.stat-value');
    const element = elements[index];
    if (element) {
      const countUp = new CountUp(element, stat.value, {
        duration: 2,
        delay: index * 0.1,
      });
      countUp.start();
    }
  });
};

// 初始化项目进度图表
const initProjectChart = (data) => {
  if (!projectChart.value) return
  const chart = echarts.init(projectChart.value)
  
  const chartData = data.projectProcess ? [
    { value: data.projectProcess['未开始'] || 0, name: '未开始' },
    { value: data.projectProcess['进行中'] || 0, name: '进行中' },
    { value: data.projectProcess['已完成'] || 0, name: '已完成' },
  ] : [
    { value: 0, name: '未开始' },
    { value: 0, name: '进行中' },
    { value: 0, name: '已完成' },
  ];
  
  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemGap: 20,
      textStyle: { color: '#666' },
    },
    series: [
      {
        name: '任务数量',
        type: 'pie',
        radius: '50%',
        center: ['50%', '45%'],
        data: chartData,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化任务完成图表
const initTaskChart = (weeklyTasks) => {
  if (!taskChart.value) return
  const chart = echarts.init(taskChart.value)
  
  const dayMap = {
    'MONDAY': 0,
    'TUESDAY': 1,
    'WEDNESDAY': 2,
    'THURSDAY': 3,
    'FRIDAY': 4,
    'SATURDAY': 5,
    'SUNDAY': 6
  };
  
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const chartData = new Array(7).fill(0);
  
  if (weeklyTasks) {
    Object.keys(weeklyTasks).forEach(day => {
      const index = dayMap[day];
      if (index !== undefined) {
        chartData[index] = weeklyTasks[day] || 0;
      }
    });
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: dayNames,
      axisLabel: { color: '#666' },
      axisLine: { lineStyle: { color: '#eee' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [
      {
        data: chartData,
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' },
          ]),
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  currentTime.value = now.toLocaleDateString('zh-CN', options)
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000)
  
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  background: var(--color-body-background);
  transition: background 0.3s ease;
}

.gradient-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
}

.dashboard-content {
  position: relative;
  z-index: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 32px;
  animation: fadeInDown 0.6s ease-out;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--color-content-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.stat-card:hover .card-glow {
  opacity: 0.3;
}

.stat-card:hover .card-wave {
  transform: translateX(0) scale(1.2);
}

/* 背景波浪 */
.card-wave {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0.08;
  transform: translateX(100px) scale(1);
  transition: all 0.6s ease;
  z-index: 0;
}

/* 边框光晕 */
.card-glow {
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(8px);
}

.stat-top {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-content-text);
  line-height: 1;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

.stat-trend .anticon {
  font-size: 14px;
}

.stat-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
  text-align: center;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background: var(--color-content-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.8s ease-out;
}

.chart-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--color-content-text);
  font-weight: 600;
}

.chart {
  width: 100%;
  height: 300px;
}

/* 活动区域 */
.activities-section {
  background: var(--color-content-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: fadeIn 1s ease-out;
}

.activities-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--color-content-text);
  font-weight: 600;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  animation: slideIn 0.6s ease-out forwards;
  opacity: 0;
}

.activity-item:hover {
  background: #f5f7fa;
  transform: translateX(4px);
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-top: 8px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0;
  color: var(--color-content-text);
  font-size: 14px;
  font-weight: 500;
}

.activity-time {
  display: block;
  margin-top: 4px;
  color: #999;
  font-size: 12px;
}

/* 动画 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* 滚动条美化 */
.dashboard-container::-webkit-scrollbar {
  width: 8px;
}

.dashboard-container::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.dashboard-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
