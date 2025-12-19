import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '../components/BasicLayout.vue'
import Dashboard from '../components/Dashboard.vue'
import ProjectList from '../components/ProjectList.vue'
import ProjectDetail from '../components/ProjectDetail.vue'
import TaskDetail from '../components/TaskDetail.vue'
import MyTasks from '../components/MyTasks.vue'
import UserManagement from '../components/UserManagement.vue'
import Login from '../components/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'projects',
        component: ProjectList
      },
      {
        path: 'projects/:id',
        component: ProjectDetail
      },
      {
        path: 'tasks/:id',
        component: TaskDetail
      },
      {
        path: 'my-tasks',
        component: MyTasks
      },
      {
        path: 'users',
        component: UserManagement
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 如果访问登录页面，直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 如果没有token，跳转到登录页
  if (!token) {
    next('/login')
    return
  }
  
  // 已登录，正常访问
  next()
})

export default router
