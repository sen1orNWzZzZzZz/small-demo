<template>
  <div class="user-management-container">
    <div class="content-wrapper">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <div class="title-section">
            <h1 class="page-title">👥 用户管理</h1>
            <p class="page-subtitle">管理系统用户信息与权限</p>
          </div>
        </div>
        <div class="header-right">
          <a-button type="primary" size="large" @click="showAddModal" class="add-btn">
            <template #icon>
              <plus-outlined />
            </template>
            新增用户
          </a-button>
        </div>
      </div>

      <!-- 用户列表 -->
      <a-table
        :columns="columns"
        :data-source="userList"
        :loading="loading"
        row-key="id"
        :pagination="false"
        class="user-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'userName'">
            <div class="user-cell">
              <div class="user-avatar-small">
                {{ record.userNickname ? record.userNickname.charAt(0) : record.userName.charAt(0) }}
              </div>
              <span>{{ record.userName }}</span>
            </div>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showUserDetail(record)">
                <eye-outlined /> 详情
              </a-button>
              <a-button type="link" size="small" @click="showEditModal(record)">
                <edit-outlined /> 编辑
              </a-button>
              <a-button type="link" size="small" danger @click="handleDelete(record)">
                <delete-outlined /> 删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 用户详情抽屉 -->
    <a-drawer
      v-model:open="detailVisible"
      :width="600"
      placement="left"
      class="user-detail-drawer"
      :closable="false"
    >
      <template #title>
        <div class="drawer-header">
          <h2>用户详情</h2>
          <a-button type="text" @click="detailVisible = false" class="close-btn">
            <close-outlined />
          </a-button>
        </div>
      </template>
      
      <div class="user-detail-content" v-if="currentUser">
        <!-- 用户头像和基本信息 -->
        <div class="detail-hero">
          <div class="detail-avatar">
            {{ currentUser.userNickname ? currentUser.userNickname.charAt(0) : currentUser.userName.charAt(0) }}
          </div>
          <div class="detail-name-section">
            <h1 class="detail-nickname">{{ currentUser.userNickname || currentUser.userName }}</h1>
            <p class="detail-username">@{{ currentUser.userName }}</p>
          </div>
        </div>

        <!-- 信息卡片 -->
        <div class="detail-cards">
          <div class="detail-card" v-if="currentUser.email">
            <div class="card-icon mail-icon">
              <mail-outlined />
            </div>
            <div class="card-content">
              <div class="card-label">邮箱地址</div>
              <div class="card-value">{{ currentUser.email }}</div>
            </div>
          </div>

          <div class="detail-card" v-if="currentUser.phonenumber">
            <div class="card-icon phone-icon">
              <phone-outlined />
            </div>
            <div class="card-content">
              <div class="card-label">手机号码</div>
              <div class="card-value">{{ currentUser.phonenumber }}</div>
            </div>
          </div>

          <div class="detail-card">
            <div class="card-icon id-icon">
              <idcard-outlined />
            </div>
            <div class="card-content">
              <div class="card-label">用户ID</div>
              <div class="card-value">#{{ currentUser.id }}</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <a-button type="primary" size="large" block @click="showEditModal(currentUser)">
            <edit-outlined /> 编辑用户信息
          </a-button>
          <a-button danger size="large" block @click="handleDelete(currentUser)">
            <delete-outlined /> 删除用户
          </a-button>
        </div>
      </div>
    </a-drawer>

    <!-- 新增/编辑用户对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="submitLoading"
      width="700px"
      class="user-modal"
      :closable="false"
    >
      <div class="modal-content">
        <!-- 用户头像区域 -->
        <div class="avatar-section">
          <div class="edit-avatar">
            <div class="avatar-display">
              {{ userForm.userNickname ? userForm.userNickname.charAt(0) : (userForm.userName ? userForm.userName.charAt(0) : '?') }}
            </div>
            <div class="avatar-upload-hint">
              <camera-outlined />
              <span>点击上传头像（功能待实现）</span>
            </div>
          </div>
        </div>

        <!-- 表单区域 -->
        <a-form
          :model="userForm"
          layout="vertical"
          class="user-form"
        >
          <a-form-item label="用户名" required>
            <a-input 
              v-model:value="userForm.userName" 
              placeholder="请输入用户名" 
              size="large"
              :bordered="false"
              class="form-input"
            >
              <template #prefix>
                <user-outlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item label="昵称">
            <a-input 
              v-model:value="userForm.userNickname" 
              placeholder="请输入昵称" 
              size="large"
              :bordered="false"
              class="form-input"
            >
              <template #prefix>
                <smile-outlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item label="密码" v-if="!isEdit" required>
            <a-input-password 
              v-model:value="userForm.password" 
              placeholder="请输入密码" 
              size="large"
              :bordered="false"
              class="form-input"
            >
              <template #prefix>
                <lock-outlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item label="邮箱">
            <a-input 
              v-model:value="userForm.email" 
              placeholder="请输入邮箱" 
              size="large"
              :bordered="false"
              class="form-input"
            >
              <template #prefix>
                <mail-outlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item label="手机号">
            <a-input 
              v-model:value="userForm.phonenumber" 
              placeholder="请输入手机号" 
              size="large"
              :bordered="false"
              class="form-input"
            >
              <template #prefix>
                <phone-outlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
        </a-form>
      </div>
      
      <template #footer>
        <div class="modal-footer">
          <a-button size="large" @click="handleCancel" class="cancel-btn">
            取消
          </a-button>
          <a-button 
            type="primary" 
            size="large" 
            @click="handleSubmit" 
            :loading="submitLoading"
            class="submit-btn"
          >
            {{ isEdit ? '保存修改' : '创建用户' }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  EyeOutlined,
  CloseOutlined,
  CameraOutlined,
  UserOutlined,
  SmileOutlined,
  LockOutlined
} from '@ant-design/icons-vue';
import { get, post, put, del } from '../utils/request';
import { API_ENDPOINTS } from '../config/api';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'userName', key: 'userName', width: 120 },
  { title: '昵称', dataIndex: 'userNickname', key: 'userNickname', width: 120 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 180 },
  { title: '手机号', dataIndex: 'phonenumber', key: 'phonenumber', width: 140 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
];

const userList = ref([]);
const loading = ref(false);
const detailVisible = ref(false);
const currentUser = ref(null);
const modalVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const userForm = ref({
  id: null,
  userName: '',
  userNickname: '',
  password: '',
  email: '',
  phonenumber: ''
});

// 显示用户详情
const showUserDetail = (record) => {
  currentUser.value = record;
  detailVisible.value = true;
};

// 加载用户列表
const loadUserList = async () => {
  loading.value = true;
  try {
    const response = await get(API_ENDPOINTS.USER_LIST);
    if (response.code === 200 && response.data) {
      userList.value = response.data;
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
    message.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 显示新增对话框
const showAddModal = () => {
  isEdit.value = false;
  userForm.value = {
    id: null,
    username: '',
    userNickname: '',
    password: '',
    email: '',
    phonenumber: ''
  };
  modalVisible.value = true;
};

// 显示编辑对话框
const showEditModal = (record) => {
  isEdit.value = true;
  userForm.value = {
    id: record.id,
    userName: record.userName,
    userNickname: record.userNickname,
    email: record.email,
    phonenumber: record.phonenumber
  };
  modalVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!userForm.value.userName) {
    message.warning('请输入用户名');
    return;
  }
  if (!isEdit.value && !userForm.value.password) {
    message.warning('请输入密码');
    return;
  }
  
  submitLoading.value = true;
  try {
    let response;
    if (isEdit.value) {
      response = await put(API_ENDPOINTS.USER_UPDATE(userForm.value.id), userForm.value);
    } else {
      response = await post(API_ENDPOINTS.USER_CREATE, userForm.value);
    }
    
    if (response.code === 200) {
      message.success(isEdit.value ? '更新成功' : '创建成功');
      modalVisible.value = false;
      loadUserList();
    } else {
      message.error(response.message || '操作失败');
    }
  } catch (error) {
    console.error('提交失败:', error);
    message.error('操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 取消
const handleCancel = () => {
  modalVisible.value = false;
};

// 删除用户
const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户「${record.username}」吗？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      try {
        const response = await del(API_ENDPOINTS.USER_DELETE(record.id));
        if (response.code === 200) {
          message.success('删除成功');
          loadUserList();
        } else {
          message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        message.error('删除失败');
      }
    }
  });
};

onMounted(() => {
  loadUserList();
});
</script>

<style scoped>
.user-management-container {
  height: 100%;
  background: var(--color-body-background);
  overflow-y: auto;
  padding: 24px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--color-header-border);
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
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

.add-btn {
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 表格样式 */
:deep(.user-table) {
  background: var(--color-content-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.user-table .ant-table) {
  background: var(--color-content-background);
  color: var(--color-content-text);
}

:deep(.user-table .ant-table-thead > tr > th) {
  background: transparent;
  color: white;
  font-weight: 600;
  border: none;
  position: relative;
}

:deep(.user-table .ant-table-thead > tr > th::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

:deep(.user-table .ant-table-thead) {
  position: relative;
}

:deep(.user-table .ant-table-thead::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 0;
}

:deep(.user-table .ant-table-tbody > tr) {
  transition: all 0.3s ease;
}

:deep(.user-table .ant-table-tbody > tr:hover) {
  background: var(--color-header-border);
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
}

/* 用户详情抽屉 */
:deep(.user-detail-drawer .ant-drawer-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0;
}

:deep(.user-detail-drawer .ant-drawer-body) {
  padding: 0;
  background: var(--color-body-background);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  color: white;
}

.drawer-header h2 {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  color: white;
  font-size: 18px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 详情内容 */
.user-detail-content {
  padding: 32px 24px;
}

.detail-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.detail-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: heroGlow 8s ease-in-out infinite;
}

@keyframes heroGlow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20%, -20%); }
}

.detail-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  animation: avatarPulse 3s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6); }
}

.detail-name-section {
  text-align: center;
  position: relative;
  z-index: 1;
}

.detail-nickname {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-content-text);
  margin: 0 0 8px 0;
}

.detail-username {
  font-size: 16px;
  color: #999;
  margin: 0;
}

/* 信息卡片 */
.detail-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.detail-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: var(--color-content-background);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.detail-card:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.detail-card:nth-child(1) {
  border-left-color: #667eea;
}

.detail-card:nth-child(1):hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
}

.detail-card:nth-child(2) {
  border-left-color: #764ba2;
}

.detail-card:nth-child(2):hover {
  background: linear-gradient(90deg, rgba(118, 75, 162, 0.05) 0%, transparent 100%);
}

.detail-card:nth-child(3) {
  border-left-color: #f093fb;
}

.detail-card:nth-child(3):hover {
  background: linear-gradient(90deg, rgba(240, 147, 251, 0.05) 0%, transparent 100%);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  transition: all 0.3s ease;
}

.mail-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.phone-icon {
  background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%);
}

.id-icon {
  background: linear-gradient(135deg, #f093fb 0%, #667eea 100%);
}

.detail-card:hover .card-icon {
  transform: rotate(10deg) scale(1.1);
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-content-text);
}

/* 操作按钮 */
.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-actions .ant-btn {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.detail-actions .ant-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 对话框样式 */
:deep(.user-modal .ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.user-modal .ant-modal-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 32px;
  border: none;
}

:deep(.user-modal .ant-modal-title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

:deep(.user-modal .ant-modal-close) {
  color: white;
}

:deep(.user-modal .ant-modal-close:hover) {
  background: rgba(255, 255, 255, 0.2);
}

:deep(.user-modal .ant-modal-body) {
  padding: 40px 48px;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 0 24px;
}

/* 头像编辑区域 */
.avatar-section {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px;
}

.edit-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-avatar:hover .avatar-display {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
}

.avatar-display {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.avatar-display::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.edit-avatar:hover .avatar-display::after {
  opacity: 0.3;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
}

.avatar-upload-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #999;
  transition: all 0.3s ease;
}

.edit-avatar:hover .avatar-upload-hint {
  color: #667eea;
}

.avatar-upload-hint .anticon {
  font-size: 16px;
}

/* 表单样式 */
.user-form {
  margin-top: 16px;
}

:deep(.user-form .ant-form-item) {
  margin-bottom: 24px;
}

.form-input {
  background: var(--color-body-background);
  border-radius: 8px;
  padding: 12px 16px;
}

.input-icon {
  font-size: 18px;
  color: #667eea;
  margin-right: 8px;
}

:deep(.user-form .ant-input-affix-wrapper),
:deep(.user-form .ant-input) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.user-form .ant-input-affix-wrapper) {
  background: var(--color-body-background);
  padding: 12px 16px;
}

:deep(.user-form .ant-input-affix-wrapper:hover),
:deep(.user-form .form-input:hover) {
  background: var(--color-header-border);
}

:deep(.user-form .ant-input-affix-wrapper:focus-within),
:deep(.user-form .form-input:focus-within) {
  background: var(--color-header-border);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 对话框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0 0;
}

.cancel-btn,
.submit-btn {
  min-width: 100px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  :deep(.user-detail-drawer) {
    width: 100% !important;
  }
}
</style>
