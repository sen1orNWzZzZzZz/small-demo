<template>
  <div class="task-detail-container">
    <!-- 任务头部 -->
    <a-page-header
      class="task-header"
      :title="taskInfo?.taskName || '任务详情'"
      :sub-title="getStatusText(taskInfo?.status || 0)"
      @back="() => $router.go(-1)"
    >
      <template #tags>
        <a-tag :color="getPriorityColor(taskInfo?.priority)">
          {{ taskInfo?.priority || '中' }}优先级
        </a-tag>
        <a-tag :color="getStatusColor(taskInfo?.status)">
          {{ getStatusText(taskInfo?.status || 0) }}
        </a-tag>
      </template>
      <template #extra>
        <a-button key="1" type="primary" @click="handleEdit">编辑</a-button>
        <a-button key="2" @click="showAssignModal">指派</a-button>
        <a-button key="3" danger @click="handleDelete">删除</a-button>
      </template>
      
      <a-descriptions size="small" :column="2">
        <a-descriptions-item label="所属项目">{{ projectInfo?.projectName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDate(taskInfo?.createDate) }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ formatDate(taskInfo?.startDate) }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ formatDate(taskInfo?.endDate) }}</a-descriptions-item>
        <a-descriptions-item label="更新人">{{ taskInfo?.updateBy || '-' }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ formatDate(taskInfo?.updateDate) }}</a-descriptions-item>
        <a-descriptions-item label="完成人">{{ taskInfo?.completeBy || '-' }}</a-descriptions-item>
        <a-descriptions-item label="是否完成">
          <a-tag :color="taskInfo?.isDone ? 'green' : 'orange'">
            {{ taskInfo?.isDone ? '已完成' : '未完成' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-page-header>

    <!-- 任务详细信息 -->
    <div class="task-content">
      <a-row :gutter="16" class="task-cards-row" :class="{ 'has-hovered': hoveredCard !== null }" style="height: 100%;">
        <!-- 左侧：任务信息 -->
        <a-col 
          :span="16" 
          class="card-col"
          :class="{
            'card-col-expanded': hoveredCard === 'left',
            'card-col-collapsed': hoveredCard === 'right'
          }"
          style="height: 100%;"
        >
          <div class="card-col-inner">
            <a-card 
              title="任务信息" 
              class="task-card info-card"
              @mouseenter="hoveredCard = 'left'"
              @mouseleave="hoveredCard = null"
            >
            <a-descriptions bordered :column="1">
              <a-descriptions-item label="任务名称">{{ taskInfo?.taskName }}</a-descriptions-item>
              <a-descriptions-item label="优先级">
                <a-tag :color="getPriorityColor(taskInfo?.priority)">{{ taskInfo?.priority }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-select 
                  v-if="taskInfo"
                  v-model:value="taskInfo.status" 
                  style="width: 200px"
                  @change="handleStatusChange"
                >
                  <a-select-option :value="0">未开始</a-select-option>
                  <a-select-option :value="1">进行中</a-select-option>
                  <a-select-option :value="2">已完成</a-select-option>
                  <a-select-option :value="3">已延期</a-select-option>
                </a-select>
                <span v-else>-</span>
              </a-descriptions-item>
              <a-descriptions-item label="进度">
                <a-progress v-if="taskInfo" :percent="getProgress(taskInfo.status)" :status="taskInfo.status === 3 ? 'exception' : 'normal'" />
                <span v-else>-</span>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 任务描述 -->
          <a-card 
            title="任务详情" 
            class="task-card detail-card"
            @mouseenter="hoveredCard = 'left'"
            @mouseleave="hoveredCard = null"
          >
            <a-empty v-if="!taskInfo?.taskDetail" description="暂无详情描述" />
            <p v-else style="white-space: pre-wrap; line-height: 1.8;">{{ taskInfo?.taskDetail }}</p>
          </a-card>
          </div>
        </a-col>

        <!-- 右侧：时间轴 -->
        <a-col 
          :span="8"
          class="card-col"
          :class="{
            'card-col-expanded': hoveredCard === 'right',
            'card-col-collapsed': hoveredCard === 'left'
          }"
          style="height: 100%;"
        >
          <div class="card-col-inner">
          <a-card 
            title="任务时间线" 
            class="task-card timeline-card"
            @mouseenter="hoveredCard = 'right'"
            @mouseleave="hoveredCard = null"
          >
            <a-timeline>
              <a-timeline-item color="green" v-if="taskInfo?.createDate">
                创建任务
                <p style="font-size: 12px; color: #999;">{{ formatDateTime(taskInfo?.createDate) }}</p>
              </a-timeline-item>
              <a-timeline-item color="blue" v-if="taskInfo?.startDate">
                开始时间
                <p style="font-size: 12px; color: #999;">{{ formatDateTime(taskInfo?.startDate) }}</p>
              </a-timeline-item>
              <a-timeline-item :color="taskInfo?.status === 2 ? 'green' : 'orange'" v-if="taskInfo?.endDate">
                {{ taskInfo?.status === 2 ? '已完成' : '计划结束' }}
                <p style="font-size: 12px; color: #999;">{{ formatDateTime(taskInfo?.endDate) }}</p>
              </a-timeline-item>
              <a-timeline-item v-if="taskInfo?.updateDate">
                最后更新
                <p style="font-size: 12px; color: #999;">{{ formatDateTime(taskInfo?.updateDate) }}</p>
              </a-timeline-item>
            </a-timeline>
          </a-card>
          </div>
        </a-col>
      </a-row>
    </div>
    
    <!-- 指派任务对话框 -->
    <a-modal
      v-model:open="assignModalVisible"
      title="指派任务"
      @ok="handleAssign"
      @cancel="assignModalVisible = false"
      :confirmLoading="assignLoading"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="选择用户">
          <a-select v-model:value="selectedUserId" placeholder="请选择用户">
            <a-select-option v-for="user in userList" :key="user.id" :value="user.id">
              {{ user.userNickname || user.username }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { get, put, del, post } from '../utils/request';
import { API_ENDPOINTS } from '../config/api';

const route = useRoute();
const router = useRouter();
const taskId = route.params.id;

const taskInfo = ref(null);
const projectInfo = ref(null);
const loading = ref(false);
const assignModalVisible = ref(false);
const assignLoading = ref(false);
const selectedUserId = ref(null);
const userList = ref([]);
const hoveredCard = ref(null);

// 加载任务详情
const loadTaskInfo = async () => {
  loading.value = true;
  try {
    const response = await get(API_ENDPOINTS.TASK_DETAIL(taskId));
    if (response.code === 200 && response.data) {
      taskInfo.value = response.data;
      // 如果有项目ID，加载项目信息
      if (taskInfo.value.projectId) {
        loadProjectInfo(taskInfo.value.projectId);
      }
    }
  } catch (error) {
    console.error('加载任务详情失败:', error);
    message.error('加载任务详情失败');
  } finally {
    loading.value = false;
  }
};

// 加载项目信息
const loadProjectInfo = async (projectId) => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT_DETAIL(projectId));
    if (response.code === 200 && response.data) {
      projectInfo.value = response.data;
    }
  } catch (error) {
    console.error('加载项目信息失败:', error);
  }
};

// 状态变更
const handleStatusChange = async (newStatus) => {
  try {
    const response = await put(`${API_ENDPOINTS.TASK_UPDATE_STATUS(taskId)}?status=${newStatus}`);
    if (response.code === 200) {
      message.success('状态更新成功');
      loadTaskInfo();
    } else {
      message.error(response.message || '状态更新失败');
      loadTaskInfo();
    }
  } catch (error) {
    console.error('更新状态失败:', error);
    message.error('更新状态失败');
    loadTaskInfo();
  }
};

// 加载用户列表
const loadUserList = async () => {
  try {
    const response = await get(API_ENDPOINTS.USER_LIST);
    if (response.code === 200 && response.data) {
      userList.value = response.data;
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
};

// 显示指派对话框
const showAssignModal = () => {
  loadUserList();
  assignModalVisible.value = true;
};

// 指派任务
const handleAssign = async () => {
  if (!selectedUserId.value) {
    message.warning('请选择用户');
    return;
  }
  
  assignLoading.value = true;
  try {
    const response = await post(API_ENDPOINTS.TASK_ASSIGN, {
      taskId: taskId,
      assigneeId: selectedUserId.value
    });
    
    if (response.code === 200) {
      message.success('指派成功');
      assignModalVisible.value = false;
      selectedUserId.value = null;
      loadTaskInfo();
    } else {
      message.error(response.message || '指派失败');
    }
  } catch (error) {
    console.error('指派任务失败:', error);
    message.error('指派任务失败');
  } finally {
    assignLoading.value = false;
  }
};

// 编辑任务
const handleEdit = () => {
  message.info('编辑功能待实现');
};

// 删除任务
const handleDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除任务「${taskInfo.value?.taskName}」吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        const response = await del(API_ENDPOINTS.TASK_DELETE(taskId));
        if (response.code === 200) {
          message.success('删除成功');
          router.go(-1);
        } else {
          message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除任务失败:', error);
        message.error('删除任务失败');
      }
    }
  });
};

// 辅助函数
const getStatusText = (status) => {
  const map = { 0: '未开始', 1: '进行中', 2: '已完成', 3: '已延期' };
  return map[status] || '未知';
};

const getStatusColor = (status) => {
  const map = { 0: '#faad14', 1: '#1890ff', 2: '#52c41a', 3: '#ff4d4f' };
  return map[status] || '#d9d9d9';
};

const getPriorityColor = (priority) => {
  const map = { '高': 'red', '中': 'orange', '低': 'blue' };
  return map[priority] || 'default';
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

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

onMounted(() => {
  loadTaskInfo();
});
</script>

<style scoped>
.task-detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-body-background);
  overflow: hidden;
}

.task-header {
  flex-shrink: 0;
  border: 1px solid var(--color-header-border);
  background: var(--color-content-background);
  transition: all 0.3s ease;
  color: var(--color-content-text);
}

.task-content {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  min-height: 0;
}

.task-cards-row {
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-col {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.card-col-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.task-card {
  background: var(--color-content-background);
}

.info-card {
  flex-shrink: 0;
}

.detail-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.detail-card :deep(.ant-card-body) {
  flex: 1;
  overflow-y: auto;
}

.timeline-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-card :deep(.ant-card-body) {
  flex: 1;
  overflow-y: auto;
}

.card-col-expanded {
  flex: 0 0 75% !important;
  max-width: 75% !important;
}

.card-col-collapsed {
  flex: 0 0 25% !important;
  max-width: 25% !important;
  opacity: 0.6;
}

.task-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.card-col-expanded .task-card {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.card-col-collapsed .task-card {
  transform: scale(0.98);
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .card-col-expanded,
  .card-col-collapsed {
    flex: unset !important;
    max-width: unset !important;
    opacity: 1 !important;
  }
  
  .card-col-expanded .task-card,
  .card-col-collapsed .task-card {
    transform: none !important;
  }
}

:deep(.ant-page-header) {
  color: var(--color-content-text);
}

:deep(.ant-descriptions-item-label) {
  color: #8c8c8c;
  background: var(--color-body-background);
}

:deep(.ant-descriptions-item-content) {
  color: var(--color-content-text);
  background: var(--color-content-background);
}

:deep(.ant-card) {
  color: var(--color-content-text);
}

:deep(.ant-card-head) {
  border-bottom: 1px solid var(--color-header-border);
}

:deep(.ant-timeline-item-content) {
  color: var(--color-content-text);
}
</style>
