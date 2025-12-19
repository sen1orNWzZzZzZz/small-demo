<template>  
  <div style="padding: 16px; height: 100%; display: flex; flex-direction: column; background: var(--color-body-background); transition: all 0.3s ease">  
    <!-- 1. 项目概览头 -->  
    <a-page-header  
      style="border: 1px solid var(--color-header-border); background: var(--color-content-background); transition: all 0.3s ease; color: var(--color-content-text)"  
      :title="projectInfo?.projectName || '项目详情'"  
      :sub-title="getStatusTextFromProject(projectInfo?.status || 0)"  
      @back="() => $router.go(-1)"  
    >  
      <template #tags>  
        <a-tag :color="projectInfo?.priority === '高' ? 'red' : projectInfo?.priority === '低' ? 'blue' : 'orange'">
          {{ projectInfo?.priority || '中' }}优先级
        </a-tag>  
      </template>  
      <template #extra>  
        <a-button key="1" type="primary" @click="showAddTaskModal">添加任务</a-button>  
      </template>  
      <a-row>  
        <a-statistic title="总任务数" :value="totalTasks" style="margin-right: 50px" />  
        <a-statistic title="已完成" :value="completedTasks" />  
      </a-row>  
    </a-page-header>  
  
    <!-- 2. 任务看板区域 -->  
    <div class="kanban-board-container" :class="{ 'has-hovered': hoveredColumn !== null }">  
      <!-- 循环渲染四个状态列 -->  
      <div 
        class="kanban-column" 
        v-for="(tasks, statusKey, index) in kanbanData" 
        :key="statusKey"
        :class="{
          'column-expanded': hoveredColumn === statusKey,
          'column-collapsed': hoveredColumn !== null && hoveredColumn !== statusKey
        }"
        :style="{ '--index': index }"
        @mouseenter="hoveredColumn = statusKey"
        @mouseleave="hoveredColumn = null"
      >  
        <div class="column-header" :style="{ borderTopColor: getStatusColor(statusKey) }">  
          <h3>{{ getStatusText(statusKey) }} <span class="task-count">({{ tasks.length }})</span></h3>  
        </div>  
  
        <draggable  
          class="drag-area"
          :class="{ 'drag-area-expanded': hoveredColumn === statusKey }"
          :list="tasks"  
          group="tasks"  
          item-key="id"  
          @change="(evt) => onDragChange(evt, statusKey)"  
        >  
          <template #item="{ element }">  
            <a-card size="small" hoverable class="task-card" @click="goToTaskDetail(element.id)">  
              <div class="task-header">
                <div class="task-title">{{ element.taskName || element.title || '未命名任务' }}</div>  
                <a-tag v-if="element.priority === '高'" color="red" size="small">高</a-tag>  
                <a-tag v-else-if="element.priority === '低'" color="blue" size="small">低</a-tag>
                <a-tag v-else color="orange" size="small">中</a-tag>
              </div>
              <div class="task-footer">
                <div class="task-status">
                  <span class="label">状态：</span>
                  <a-tag :color="getStatusColor(element.status)" size="small">{{ getStatusText(element.status) }}</a-tag>
                </div>
                <div class="task-endtime">
                  <span class="label">结束：</span>
                  <span class="time-text">{{ formatDate(element.endDate) }}</span>
                </div>
              </div>
            </a-card>  
          </template>  
        </draggable>  
      </div>  
    </div>  
  
    <!-- 任务详情抽屉 (点击任务卡片弹出) -->  
    <a-drawer  
      v-model:open="drawerVisible"  
      title="任务详情"  
      width="600"  
      placement="right"  
    >  
      <p v-if="currentTask">正在查看任务 ID: {{ currentTask.id }} - {{ currentTask.taskName || currentTask.title }}</p>  
      <p>这里可以放置复杂的表单、评论区和操作日志...</p>  
    </a-drawer>

    <!-- 添加任务对话框 -->
    <a-modal
      v-model:open="addTaskModalVisible"
      title="添加任务"
      @ok="handleAddTask"
      @cancel="handleCancelAddTask"
      :confirmLoading="addTaskLoading"
      width="600px"
    >
      <a-form
        :model="taskForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="任务名称" required>
          <a-input v-model:value="taskForm.taskName" placeholder="请输入任务名称" />
        </a-form-item>
        
        <a-form-item label="任务详情">
          <a-textarea 
            v-model:value="taskForm.taskDetail" 
            placeholder="请输入任务详情描述"
            :rows="4"
            showCount
            :maxlength="500"
          />
        </a-form-item>
        
        <a-form-item label="优先级">
          <a-select v-model:value="taskForm.priority" placeholder="选择优先级">
            <a-select-option value="高">高</a-select-option>
            <a-select-option value="中">中</a-select-option>
            <a-select-option value="低">低</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="开始日期" required>
          <a-date-picker
            v-model:value="taskForm.startDate"
            style="width: 100%"
            placeholder="选择开始日期"
          />
        </a-form-item>
        
        <a-form-item label="结束日期" required>
          <a-date-picker
            v-model:value="taskForm.endDate"
            style="width: 100%"
            placeholder="选择结束日期"
          />
        </a-form-item>
        
        <a-form-item label="状态">
          <a-select v-model:value="taskForm.status" placeholder="选择状态">
            <a-select-option :value="0">未开始</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已完成</a-select-option>
            <a-select-option :value="3">已延期</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  
  </div>  
</template>  

<script setup>  
import { ref, reactive, onMounted, computed } from 'vue';  
import { message } from 'ant-design-vue';
import draggable from 'vuedraggable';  
import { useRoute, useRouter } from 'vue-router';
import { get, put, post } from '../utils/request';
import { API_ENDPOINTS } from '../config/api';
  
const route = useRoute();  
const router = useRouter();  
const projectId = route.params.id;

const projectInfo = ref(null);
const taskList = ref([]);
const loading = ref(false);

// 加载项目详情
const loadProjectInfo = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT_DETAIL(projectId));
    if (response.code === 200 && response.data) {
      projectInfo.value = response.data;
    }
  } catch (error) {
    console.error('加载项目信息失败:', error);
    message.error('加载项目信息失败');
  }
};

// 加载任务列表
const loadTasks = async () => {
  loading.value = true;
  try {
    const response = await get(API_ENDPOINTS.TASK_BY_PROJECT(projectId));
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

// 根据状态分组任务
const kanbanData = computed(() => {
  const grouped = {
    0: [], // 未开始
    1: [], // 进行中
    2: [], // 已完成
    3: []  // 已延期
  };
  
  taskList.value.forEach(task => {
    const status = task.status || 0;
    if (grouped[status]) {
      grouped[status].push(task);
    }
  });
  
  return grouped;
});

// 统计数据
const totalTasks = computed(() => taskList.value.length);
const completedTasks = computed(() => taskList.value.filter(t => t.status === 2).length);  
  
// 拖拽结束后的回调  
const onDragChange = async (evt, targetStatus) => {  
  if (evt.added) {  
    const task = evt.added.element;
    try {
      const response = await put(`${API_ENDPOINTS.TASK_UPDATE_STATUS(task.id)}?status=${targetStatus}`);
      if (response.code === 200) {
        message.success('任务状态已更新');
        loadTasks(); // 重新加载
      } else {
        message.error(response.message || '状态更新失败');
        loadTasks(); // 回滚
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
      message.error('更新任务状态失败');
      loadTasks(); // 回滚
    }
  }  
};  
  
// 添加任务相关
const addTaskModalVisible = ref(false);
const addTaskLoading = ref(false);
const taskForm = ref({
  taskName: '',
  taskDetail: '',
  priority: '中',
  startDate: null,
  endDate: null,
  status: 0
});

const showAddTaskModal = () => {
  addTaskModalVisible.value = true;
};

const handleCancelAddTask = () => {
  addTaskModalVisible.value = false;
  taskForm.value = {
    taskName: '',
    taskDetail: '',
    priority: '中',
    startDate: null,
    endDate: null,
    status: 0
  };
};

const handleAddTask = async () => {
  if (!taskForm.value.taskName) {
    message.warning('请输入任务名称');
    return;
  }
  if (!taskForm.value.startDate || !taskForm.value.endDate) {
    message.warning('请选择开始和结束日期');
    return;
  }
  
  addTaskLoading.value = true;
  try {
    const response = await post(API_ENDPOINTS.TASK_CREATE, {
      taskName: taskForm.value.taskName,
      taskDetail: taskForm.value.taskDetail,
      projectId: projectId,
      startDate: taskForm.value.startDate.toISOString(),
      endDate: taskForm.value.endDate.toISOString(),
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      updateBy: localStorage.getItem('username') || 'admin',
      priority: taskForm.value.priority,
      status: taskForm.value.status,
      isDone: false
    });
    
    if (response.code === 200) {
      message.success('任务创建成功');
      addTaskModalVisible.value = false;
      handleCancelAddTask();
      loadTasks();
    } else {
      message.error(response.message || '创建任务失败');
    }
  } catch (error) {
    console.error('创建任务失败:', error);
    message.error(error.message || '创建任务失败');
  } finally {
    addTaskLoading.value = false;
  }
};  
  
// 辅助函数  
const getStatusText = (key) => {  
  const map = { 0: '未开始', 1: '进行中', 2: '已完成', 3: '已延期' };  
  return map[key] || '未知';  
};  
const getStatusColor = (key) => {
    const map = { 0: '#faad14', 1: '#1890ff', 2: '#52c41a', 3: '#ff4d4f' };  
    return map[key] || '#d9d9d9';  
}

const getStatusTextFromProject = (status) => {
  const map = { 0: '未开始', 1: '进行中', 2: '已完成', 3: '已延期' };
  return map[status] || '未知';
};

// 抽屉控制  
const drawerVisible = ref(false);  
const currentTask = ref(null);
const hoveredColumn = ref(null);  
const showTaskDetail = (task) => {
    currentTask.value = task;  
    drawerVisible.value = true;  
}

// 跳转任务详情页
const goToTaskDetail = (taskId) => {
  router.push(`/tasks/${taskId}`);
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

onMounted(() => {
  loadProjectInfo();
  loadTasks();
});
  
</script>  

<style scoped>  
.kanban-board-container {  
  display: flex;  
  gap: 24px;  
  margin-top: 16px;  
  margin-left: -16px;
  margin-right: -16px;
  padding: 16px;
  background-color: var(--color-body-background);
  border-radius: 0;
  flex: 1;
  overflow-x: auto;  
  align-items: flex-start;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}  

.kanban-board-container.has-hovered {
  gap: 16px;
}  
  
.kanban-column {  
  flex: 0 0 280px;  
  min-width: 280px;  
  background-color: var(--color-content-background);  
  border-radius: 8px;  
  padding: 12px;  
  display: flex;  
  flex-direction: column;  
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom center;
  animation: cardFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--index) * 0.15s);
  opacity: 0;
}  

.column-expanded {
  flex: 0 0 420px !important;
  min-width: 420px !important;
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  border: 2px solid rgba(102, 126, 234, 0.4);
  z-index: 10;
}

.column-collapsed {
  flex: 0 0 200px !important;
  min-width: 200px !important;
  opacity: 0.5;
  transform: scale(0.95);
}  
  
.column-header {  
  padding: 12px;  
  margin-bottom: 12px;  
  border-top: 3px solid transparent;
  background-color: var(--color-content-background);
  border-radius: 2px;
  transition: all 0.3s ease;
}  
.column-header h3 {  
    margin: 0;  
    font-size: 14px;  
    font-weight: 600;
    color: var(--color-content-text);
}  
.task-count {  
    font-size: 12px;  
    color: #999;  
    font-weight: normal;  
}  
  
/* 拖拽区域 */
.drag-area {  
  flex-grow: 1;  
  overflow-y: auto;  
  min-height: 200px;  
  border-radius: 2px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  align-content: start;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}  

.drag-area-expanded {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}  
  
.task-card {  
  margin-bottom: 0;
  cursor: grab;  
  border-radius: 4px;  
  background-color: var(--color-content-background);
  border: 1px solid var(--color-header-border);
  transition: all 0.3s ease;
  min-width: 0;
  overflow: hidden;
}  
.task-card:active {
  cursor: grabbing;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-title {  
  font-weight: 600;  
  font-size: 13px;
  color: var(--color-content-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.task-footer {  
  display: flex;  
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #8c8c8c;
}

.task-status,
.task-endtime {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-footer .label {
  font-size: 11px;
  color: #8c8c8c;
}

.task-footer .time-text {
  font-size: 11px;
  color: var(--color-content-text);
}

/* 卡片翻转动画 */
@keyframes cardFlip {
  0% {
    opacity: 0;
    transform: perspective(1000px) rotateY(-90deg) translateY(30px) scale(0.8);
  }
  60% {
    transform: perspective(1000px) rotateY(10deg) translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: perspective(1000px) rotateY(0deg) translateY(0) scale(1);
  }
}

.kanban-column:hover {
  /* 移除原有的hover效果，改为通过class控制 */
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .column-expanded,
  .column-collapsed {
    flex: 0 0 280px !important;
    min-width: 280px !important;
    opacity: 1 !important;
    transform: translateY(0) !important;
    border: none !important;
  }
  
  .kanban-board-container.has-hovered {
    gap: 24px;
  }
}
</style>
