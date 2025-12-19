<template>
  <div class="my-tasks-container">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">📝 我的任务</h1>
        <p class="page-subtitle">共 {{ taskList.length }} 个任务</p>
      </div>

      <!-- 状态区域列表 -->
      <div class="status-sections">
        <div 
          v-for="(tasks, statusKey, index) in kanbanData" 
          :key="statusKey"
          class="status-section"
          :class="{ 'status-section-expanded': expandedStatus === statusKey }"
          :style="{ '--section-index': index }"
        >
          <!-- 状态头部 -->
          <div 
            class="status-header" 
            @click="toggleStatus(statusKey)"
            :style="{ borderLeftColor: getStatusColor(statusKey) }"
          >
            <div class="status-header-left">
              <down-outlined :class="{ 'arrow-rotated': expandedStatus === statusKey }" class="expand-arrow" />
              <h3 class="status-title">{{ getStatusText(statusKey) }}</h3>
              <a-tag :color="getStatusColor(statusKey)" size="small">{{ tasks.length }}</a-tag>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="tasks-panel" v-show="expandedStatus === statusKey">
            <div class="tasks-grid">
              <div
                v-for="(task, cardIndex) in tasks"
                :key="task.id"
                class="task-card"
                :style="{ '--card-index': cardIndex }"
                @click="goToTaskDetail(task.id)"
              >
                <div class="task-header">
                  <h3 class="task-name">{{ task.taskName }}</h3>
                  <a-tag :color="getPriorityColor(task.priority)" size="small">
                    {{ task.priority || '中' }}
                  </a-tag>
                </div>

                <div class="task-body">
                  <div class="task-info-item">
                    <calendar-outlined class="info-icon" />
                    <span>开始：{{ formatDate(task.startDate) }}</span>
                  </div>
                  <div class="task-info-item">
                    <clock-circle-outlined class="info-icon" />
                    <span>结束：{{ formatDate(task.endDate) }}</span>
                  </div>
                  <div class="task-info-item" v-if="task.principal">
                    <user-outlined class="info-icon" />
                    <span>负责人：{{ task.principal }}</span>
                  </div>
                </div>

                <div class="task-footer">
                  <a-progress 
                    :percent="getProgress(task.status)" 
                    :stroke-color="getStatusColor(task.status)"
                    :show-info="false"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a-empty v-if="taskList.length === 0" description="暂无任务" style="margin-top: 80px;" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  DownOutlined
} from '@ant-design/icons-vue';
import { get } from '../utils/request';
import { API_ENDPOINTS } from '../config/api';

const router = useRouter();
const taskList = ref([]);
const loading = ref(false);
const expandedStatus = ref('0'); // 默认展开第一个状态（字符串类型）

// 根据状态分组任务
const kanbanData = computed(() => {
  const grouped = {
    0: [], // 未开始
    1: [], // 进行中
    2: [], // 已完成
    3: []  // 已延期
  };
  
  taskList.value.forEach(task => {
    const status = task.status ?? 0;
    if (grouped[status]) {
      grouped[status].push(task);
    }
  });
  
  return grouped;
});

// 加载当前用户任务
const loadMyTasks = async () => {
  loading.value = true;
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.error('用户未登录');
      return;
    }
    
    const response = await get(API_ENDPOINTS.TASK_BY_USER(userId));
    if (response.code === 200 && response.data) {
      taskList.value = response.data;
    }
  } catch (error) {
    console.error('加载任务列表失败:', error);
    message.error('加载任务列表失败');
  } finally {
    loading.value = false;
  }
};

const goToTaskDetail = (taskId) => {
  router.push(`/tasks/${taskId}`);
};

const toggleStatus = (statusKey) => {
  expandedStatus.value = expandedStatus.value === statusKey ? null : statusKey;
};

const getPriorityColor = (priority) => {
  const map = { '高': 'red', '中': 'orange', '低': 'blue' };
  return map[priority] || 'default';
};

const getStatusColor = (status) => {
  const map = { 0: '#faad14', 1: '#1890ff', 2: '#52c41a', 3: '#ff4d4f' };
  return map[status] || '#d9d9d9';
};

const getStatusText = (status) => {
  const map = { 0: '未开始', 1: '进行中', 2: '已完成', 3: '已延期' };
  return map[status] || '未知';
};

const getProgress = (status) => {
  const map = { 0: 25, 1: 50, 2: 100, 3: 75 };
  return map[status] || 0;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

onMounted(() => {
  loadMyTasks();
});
</script>

<style scoped>
.my-tasks-container {
  height: 100%;
  background: var(--color-body-background);
  overflow-y: auto;
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-header-border);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 状态区域列表 */
.status-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 状态区域 */
.status-section {
  background: var(--color-content-background);
  border-radius: 8px;
  border: 1px solid var(--color-header-border);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: sectionFlipIn 0.5s ease forwards;
  animation-delay: calc(var(--section-index) * 0.1s);
  opacity: 0;
}

@keyframes sectionFlipIn {
  from {
    opacity: 0;
    transform: perspective(800px) rotateX(-10deg) translateY(20px);
  }
  to {
    opacity: 1;
    transform: perspective(800px) rotateX(0deg) translateY(0);
  }
}

.status-section-expanded {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

/* 状态头部 */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
  background: var(--color-content-background);
}

.status-header:hover {
  background: var(--color-body-background);
}

.status-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expand-arrow {
  font-size: 14px;
  color: #999;
  transition: transform 0.3s ease;
}

.arrow-rotated {
  transform: rotate(180deg);
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-content-text);
  margin: 0;
}

/* 任务面板 */
.tasks-panel {
  padding: 16px;
  border-top: 1px solid var(--color-header-border);
  background: var(--color-body-background);
  animation: panelSlideDown 0.3s ease;
}

@keyframes panelSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 任务网格 */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* 任务卡片 */
.task-card {
  background: var(--color-content-background);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--color-header-border);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: cardFadeIn 0.4s ease forwards;
  animation-delay: calc(var(--card-index) * 0.05s);
  opacity: 0;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.4);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-header-border);
}

.task-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-content-text);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.task-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.task-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-content-text);
}

.info-icon {
  font-size: 13px;
  color: #667eea;
}

.task-footer {
  padding-top: 10px;
  border-top: 1px solid var(--color-header-border);
}

@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
