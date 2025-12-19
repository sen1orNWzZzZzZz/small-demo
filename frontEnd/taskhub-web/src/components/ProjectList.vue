<template>  
  <div style="padding: 16px; background: var(--color-body-background); min-height: 100%; transition: all 0.3s ease">  
    <!-- 顶部操作栏 -->  
    <a-card :bordered="false" class="header-actions" style="margin-bottom: 16px">  
      <a-row justify="space-between">  
        <a-col>  
          <a-input-search  
            v-model:value="searchText"  
            placeholder="输入项目名称搜索"  
            style="width: 300px"  
            @search="onSearch"  
          />  
        </a-col>  
        <a-col>  
          <a-button type="primary" @click="showCreateModal">  
            <template #icon><PlusOutlined /></template>  
            新建项目  
          </a-button>  
        </a-col>  
      </a-row>  
    </a-card>  
  
    <!-- 项目卡片列表 -->  
    <a-row :gutter="[16, 16]">  
      <!-- 循环渲染项目卡片 -->  
      <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="project in projectList" :key="project.id">  
        <a-card hoverable class="project-card">
          <template #actions>
            <setting-outlined key="setting" @click="handleEdit(project)" />
            <delete-outlined key="delete" @click="handleDelete(project)" style="color: #ff4d4f;" />
            <router-link :to="`/projects/${project.id}`">
              <arrow-right-outlined key="enter" /> 进入  
            </router-link>  
          </template>
                  
          <div class="card-header">
            <div class="card-avatar">
              <a-avatar :size="64" :style="{ backgroundColor: getStatusColor(project.status) }">
                <span style="font-size: 24px; font-weight: bold;">{{ project.projectName.charAt(0) }}</span>
              </a-avatar>
            </div>
                    
            <div class="card-info">
              <div class="project-name">{{ project.projectName }}</div>
              <div class="priority-badge">
                <a-tag :color="getPriorityColor(project.priority)" style="font-size: 14px; padding: 4px 12px; font-weight: 600;">
                  {{ project.priority || '中' }}
                </a-tag>
              </div>
              <div class="start-date">
                <span style="color: #8c8c8c;">开始: </span>
                <span>{{ formatDate(project.startDate) }}</span>
              </div>
            </div>
          </div>
                  
          <div class="project-info">
             <div class="info-row">
                <span class="info-label">状态:</span>
                <a-tag :color="getStatusColor(project.status)">{{ getStatusText(project.status) }}</a-tag>
             </div>
             <a-progress :percent="getProgress(project.status)" size="small" :status="project.status === 3 ? 'exception' : 'normal'" style="margin: 8px 0;"/>
            <div class="info-row">
              <span class="info-label">结束:</span>
              <span>{{ formatDate(project.endDate) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>  
    </a-row>  

    <!-- 新建项目对话框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="新建项目"
      @ok="handleCreate"
      @cancel="handleCancel"
      :confirmLoading="createLoading"
    >
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="项目名称" required>
          <a-input v-model:value="formState.projectName" placeholder="请输入项目名称" />
        </a-form-item>
        
        <a-form-item label="开始日期" required>
          <a-date-picker
            v-model:value="formState.startDate"
            style="width: 100%"
            placeholder="选择开始日期"
          />
        </a-form-item>
        
        <a-form-item label="结束日期" required>
          <a-date-picker
            v-model:value="formState.endDate"
            style="width: 100%"
            placeholder="选择结束日期"
          />
        </a-form-item>
        
        <a-form-item label="优先级">
          <a-select v-model:value="formState.priority" placeholder="选择优先级">
            <a-select-option value="高">高</a-select-option>
            <a-select-option value="中">中</a-select-option>
            <a-select-option value="低">低</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="状态">
          <a-select v-model:value="formState.status" placeholder="选择状态">
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
import { ref, onMounted } from 'vue';  
import { message, Modal } from 'ant-design-vue';
import { PlusOutlined, SettingOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';  
import { get, post, del } from '../utils/request';
import { API_ENDPOINTS } from '../config/api';
import dayjs from 'dayjs';
  
const searchText = ref('');  
const projectList = ref([]);
const createModalVisible = ref(false);
const createLoading = ref(false);

const formState = ref({
  projectName: '',
  startDate: null,
  endDate: null,
  priority: '中',
  status: 0
});

// 加载项目列表
const loadProjects = async () => {
  try {
    const response = await get(API_ENDPOINTS.PROJECT_LIST);
    if (response.code === 200 && response.data) {
      projectList.value = response.data;
    } else {
      projectList.value = [];
    }
  } catch (error) {
    console.error('加载项目列表失败:', error);
    message.error('加载项目列表失败');
  }
};

// 显示创建对话框
const showCreateModal = () => {
  createModalVisible.value = true;
};

// 取消创建
const handleCancel = () => {
  createModalVisible.value = false;
  formState.value = {
    projectName: '',
    startDate: null,
    endDate: null,
    priority: '中',
    status: 0
  };
};

// 创建项目
const handleCreate = async () => {
  if (!formState.value.projectName) {
    message.warning('请输入项目名称');
    return;
  }
  if (!formState.value.startDate || !formState.value.endDate) {
    message.warning('请选择开始和结束日期');
    return;
  }
  
  createLoading.value = true;
  try {
    await post(API_ENDPOINTS.PROJECT_CREATE, {
      projectName: formState.value.projectName,
      startDate: formState.value.startDate.toISOString(),
      endDate: formState.value.endDate.toISOString(),
      updateDate: new Date().toISOString(),
      updateBy: localStorage.getItem('username') || 'admin',
      priority: formState.value.priority,
      status: formState.value.status
    });
    
    message.success('项目创建成功');
    createModalVisible.value = false;
    handleCancel();
    loadProjects(); // 重新加载列表
  } catch (error) {
    console.error('创建项目失败:', error);
    message.error(error.message || '创建项目失败');
  } finally {
    createLoading.value = false;
  }
};
  
// 辅助函数：根据状态返回颜色  
const getStatusColor = (status) => {  
  const map = {  
    0: '#faad14', // 未开始 - 黄
    1: '#1890ff', // 进行中 - 蓝  
    2: '#52c41a', // 已完成 - 绿
    3: '#ff4d4f'  // 已延期 - 红  
  };  
  return map[status] || '#d9d9d9';  
};

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    0: '未开始',
    1: '进行中',
    2: '已完成',
    3: '已延期'
  };
  return map[status] || '未知';
};

// 获取进度百分比
const getProgress = (status) => {
  const map = {
    0: 25,
    1: 50,
    2: 100,
    3: 75
  };
  return map[status] || 0;
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 获取优先级颜色
const getPriorityColor = (priority) => {
  const map = {
    '高': 'red',
    '中': 'orange',
    '低': 'blue'
  };
  return map[priority] || 'default';
};  
  
const onSearch = () => {  
  if (!searchText.value) {
    loadProjects();
    return;
  }
  searchProjects();
};

// 搜索项目
const searchProjects = async () => {
  try {
    const response = await get(`${API_ENDPOINTS.PROJECT_SEARCH}?keyword=${searchText.value}`);
    if (response.code === 200 && response.data) {
      projectList.value = response.data;
    } else {
      projectList.value = [];
    }
  } catch (error) {
    console.error('搜索项目失败:', error);
    message.error('搜索项目失败');
  }
};

// 编辑项目
const handleEdit = (project) => {
  // TODO: 打开编辑对话框
  message.info('编辑功能待实现');
};

// 删除项目
const handleDelete = (project) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除项目「${project.projectName}」吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        const response = await del(API_ENDPOINTS.PROJECT_DELETE(project.id));
        if (response.code === 200) {
          message.success('删除成功');
          loadProjects();
        } else {
          message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除项目失败:', error);
        message.error(error.message || '删除项目失败');
      }
    }
  });
};

onMounted(() => {
  loadProjects();
});
</script>  

<style scoped>
.header-actions {
  background-color: var(--color-content-background) !important;
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.card-avatar {
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}

.project-name {
  font-size: 30px;
  font-weight: 600;
  color: var(--color-content-text);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.priority-badge {
  margin: 4px 0;
}

.start-date {
  font-size: 12px;
  color: var(--color-content-text);
}

.card-desc {  
    height: auto;
    min-height: 50px;
    overflow: hidden;  
    color: var(--color-content-text);
    padding: 4px 0;
}

.desc-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 20px;
}

.desc-label {
  color: #8c8c8c;
  margin-right: 8px;
  width: 60px;
  flex-shrink: 0;
}

.project-info {  
    margin-top: 12px;  
    padding-top: 12px;  
    border-top: 2px solid var(--color-primary);
    color: var(--color-content-text);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 22px;
}

.info-label {
  color: #8c8c8c;
  width: 60px;
  flex-shrink: 0;
}
.project-card {
  background-color: var(--color-content-background) !important;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: var(--color-content-text);
}

.project-card :deep(.ant-card-head) {
  background-color: var(--color-content-background) !important;
  border-bottom: 1px solid var(--color-header-border) !important;
}

.project-card :deep(.ant-card-body) {
  background-color: var(--color-content-background) !important;
  color: var(--color-content-text);
}

.project-card :deep(.ant-card-meta-title) {
  color: var(--color-content-text) !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

.project-card :deep(.ant-card-meta-description) {
  color: var(--color-content-text) !important;
}

/* 卡片 actions 底部按钮区域 */
.project-card :deep(.ant-card-actions) {
  background-color: var(--color-content-background) !important;
  border-top: 1px solid var(--color-header-border) !important;
}

.project-card :deep(.ant-card-actions > li) {
  color: var(--color-content-text) !important;
  border-right: 1px solid var(--color-header-border) !important;
}

.project-card :deep(.ant-card-actions > li:last-child) {
  border-right: none !important;
}

.project-card :deep(.ant-card-actions > li > span) {
  color: var(--color-content-text) !important;
}

.project-card :deep(.ant-card-actions > li > span:hover) {
  color: var(--color-primary) !important;
}

.project-card :deep(.ant-card-actions a) {
  color: var(--color-content-text) !important;
}

.project-card :deep(.ant-card-actions a:hover) {
  color: var(--color-primary) !important;
}

/* 按錠图标与文字颜色 - 需要需要与景为色形成对比 */
.project-card :deep(.ant-card-actions li span svg) {
  color: var(--color-primary) !important;
}

.project-card :deep(.ant-card-actions li span:hover svg) {
  color: var(--color-secondary) !important;
}

.project-card :deep(.ant-card-actions li a) {
  color: var(--color-primary) !important;
  text-decoration: none;
}

.project-card :deep(.ant-card-actions li a:hover) {
  color: var(--color-secondary) !important;
}

.project-card :deep(.ant-card-actions li a svg) {
  color: var(--color-primary) !important;
}

.project-card :deep(.ant-card-actions li a:hover svg) {
  color: var(--color-secondary) !important;
}

/* 卡片 hover 边框 */
.project-card:hover {
  border-color: var(--color-primary) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15) !important;
}

.project-card :deep(.ant-card-bordered) {
  border-color: var(--color-header-border) !important;
}

/* 搜索框样式 */
:deep(.ant-input-search) {
  background-color: var(--color-content-background) !important;
}

:deep(.ant-input-search .ant-input) {
  background-color: var(--color-content-background) !important;
  border-color: var(--color-header-border) !important;
  color: var(--color-content-text) !important;
}

:deep(.ant-input-search .ant-input::placeholder) {
  color: #999 !important;
}

:deep(.ant-input-search .ant-input:focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
}
</style>