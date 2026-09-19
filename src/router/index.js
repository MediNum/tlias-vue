import { createRouter, createWebHistory } from 'vue-router';

// 路由表：以 views/layout 作为父级布局（Header + 菜单 + 主展示区域 + Footer），
// 各功能页面作为其子路由，通过 <router-view> 渲染到主展示区域
const routes = [
  // 登录页：独立于主布局，全屏展示
  {
    path: '/login',
    name: 'LoginView',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/index',
    children: [
      // 首页
      {
        path: 'index',
        name: 'IndexView',
        component: () => import('@/views/index/index.vue'),
        meta: { title: '首页' },
      },
      // 班级管理
      {
        path: 'clazz',
        name: 'ClazzView',
        component: () => import('@/views/clazz/index.vue'),
        meta: { title: '班级管理' },
      },
      // 学员管理
      {
        path: 'stu',
        name: 'StuView',
        component: () => import('@/views/stu/index.vue'),
        meta: { title: '学员管理' },
      },
      // 部门管理
      {
        path: 'dept',
        name: 'DeptView',
        component: () => import('@/views/dept/index.vue'),
        meta: { title: '部门管理' },
      },
      // 员工管理
      {
        path: 'emp',
        name: 'EmpView',
        component: () => import('@/views/emp/index.vue'),
        meta: { title: '员工管理' },
      },
      // 员工信息统计
      {
        path: 'report/emp',
        name: 'ReportEmpView',
        component: () => import('@/views/report/emp/index.vue'),
        meta: { title: '员工信息统计' },
      },
      // 学员信息统计
      {
        path: 'report/stu',
        name: 'ReportStuView',
        component: () => import('@/views/report/stu/index.vue'),
        meta: { title: '学员信息统计' },
      },
      // 日志信息统计
      {
        path: 'log',
        name: 'LogView',
        component: () => import('@/views/log/index.vue'),
        meta: { title: '日志信息统计' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
