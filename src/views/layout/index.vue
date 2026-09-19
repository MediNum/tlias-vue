<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { updatePassword } from '@/api/emp';

// 当前路由对象：让菜单项跟随当前访问的路径自动高亮
const route = useRoute();
const router = useRouter();

// 登录令牌：存在即视为已登录（当前为模拟实现，后续替换为真实的 token）
const token = ref(localStorage.getItem('token'));

// 默认展开当前路由所属的子菜单分组
const defaultOpeneds = computed(() => {
  const groupMap = {
    '/clazz': 'clazz-stu',
    '/stu': 'clazz-stu',
    '/dept': 'dept-emp',
    '/emp': 'dept-emp',
    '/report/emp': 'data-stat',
    '/report/stu': 'data-stat',
    '/log': 'data-stat',
  };
  const group = groupMap[route.path];
  return group ? [group] : [];
});

// 跳转登录页
const handleLogin = () => {
  router.push('/login');
};

// ==================== 修改密码 ====================

const pwdDialogVisible = ref(false);
const pwdFormRef = ref(null);

// 修改密码表单数据
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 确认新密码一致性校验
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入密码不一致，请您仔细核对'));
  } else {
    callback();
  }
};

// 修改密码表单校验规则
const pwdRules = {
  oldPassword: [
    { required: true, message: '请输入原始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

// 打开修改密码弹窗
const handleChangePassword = () => {
  pwdForm.oldPassword = '';
  pwdForm.newPassword = '';
  pwdForm.confirmPassword = '';
  pwdDialogVisible.value = true;
};

// 保存修改密码
const handlePasswordSave = () => {
  pwdFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      // 提交原始密码与新密码（确认新密码仅做前端一致性校验，不提交后端）
      await updatePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });
      ElMessage.success('修改密码成功，请重新登录');
      pwdDialogVisible.value = false;
      // 按原型需求：密码修改成功后返回登录页，要求用户重新登录
      localStorage.removeItem('token');
      token.value = null;
      router.push('/login');
    } catch {
      // 失败信息（如：原密码错误）已由请求响应拦截器统一提示
    }
  });
};

// 退出登录：确认后清除 token 并返回登录页
const handleLogout = () => {
  ElMessageBox.confirm('确认退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      localStorage.removeItem('token');
      token.value = null;
      ElMessage.success('退出登录成功');
      router.push('/login');
    })
    .catch(() => {});
};
</script>

<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <!-- 顶部：Header -->
      <el-header class="layout-header">
        <!-- 图标区域：宽度与左侧栏一致，形成视觉对齐 -->
        <div class="header-logo">
          <el-icon :size="28"><Reading /></el-icon>
        </div>
        <h1 class="header-title">tlias 智能学习辅助系统</h1>
        <div class="header-right">
          <!-- 未登录：显示登录入口 -->
          <el-button
            v-if="!token"
            link
            class="header-button"
            @click="handleLogin"
          >
            <el-icon><Key /></el-icon>
            <span>登&nbsp;&nbsp;录</span>
          </el-button>
          <!-- 已登录：显示修改密码、退出登录 -->
          <template v-else>
            <el-button link class="header-button" @click="handleChangePassword">
              <el-icon><EditPen /></el-icon>
              <span>修改密码</span>
            </el-button>
            <el-button link class="header-button" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-button>
          </template>
        </div>
      </el-header>
      <el-container>
        <!-- 左侧：导航菜单 -->
        <el-aside width="200px" class="layout-aside">
          <!--
            开启 router 模式后，点击菜单项会自动跳转到 index 对应的路由，
            跳转后由 Main 区域的 <router-view> 渲染对应页面
          -->
          <el-menu
            :default-active="route.path"
            :default-openeds="defaultOpeneds"
            router
            class="layout-menu"
            background-color="#001529"
            text-color="rgba(255, 255, 255, 0.7)"
            active-text-color="#409eff"
          >
            <el-menu-item index="/index">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>

            <!-- 班级学员管理（可折叠） -->
            <el-sub-menu index="clazz-stu">
              <template #title>
                <el-icon><School /></el-icon>
                <span>班级学员管理</span>
              </template>
              <el-menu-item index="/clazz">
                <el-icon><Collection /></el-icon>
                <span>班级管理</span>
              </el-menu-item>
              <el-menu-item index="/stu">
                <el-icon><Avatar /></el-icon>
                <span>学员管理</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 部门员工管理（可折叠） -->
            <el-sub-menu index="dept-emp">
              <template #title>
                <el-icon><OfficeBuilding /></el-icon>
                <span>部门员工管理</span>
              </template>
              <el-menu-item index="/dept">
                <el-icon><Grid /></el-icon>
                <span>部门管理</span>
              </el-menu-item>
              <el-menu-item index="/emp">
                <el-icon><UserFilled /></el-icon>
                <span>员工管理</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 数据统计管理（可折叠） -->
            <el-sub-menu index="data-stat">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>数据统计管理</span>
              </template>
              <el-menu-item index="/report/emp">
                <el-icon><DataLine /></el-icon>
                <span>员工信息统计</span>
              </el-menu-item>
              <el-menu-item index="/report/stu">
                <el-icon><TrendCharts /></el-icon>
                <span>学员信息统计</span>
              </el-menu-item>
              <el-menu-item index="/log">
                <el-icon><Document /></el-icon>
                <span>日志信息统计</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
        <el-container>
          <!-- 右侧：主展示区域，渲染子路由对应的页面 -->
          <el-main class="layout-main">
            <router-view></router-view>
          </el-main>
          <!-- 底部：Footer -->
          <el-footer class="layout-footer">
            tlias 智能学习辅助系统 © 2026
          </el-footer>
        </el-container>
      </el-container>
    </el-container>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="pwdDialogVisible"
      title="修改密码"
      width="460px"
      destroy-on-close
    >
      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="100px"
      >
        <el-form-item label="原始密码" prop="oldPassword">
          <el-input
            v-model="pwdForm.oldPassword"
            type="password"
            placeholder="请输入原始密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.common-layout {
  height: 100%;
}

.layout-container {
  height: 100%;
}

.layout-header {
  display: flex;
  align-items: center;
  /* 左侧不留内边距，让图标区域与左侧栏对齐 */
  padding: 0 20px 0 0;
  /* 背景渐变：从左至右 rgb(0, 85, 128) → rgb(164, 234, 20) */
  background: linear-gradient(to right, #005580, #a4ea14);
  border-bottom: 1px solid #e4e7ed;
  /* 白色标题文字，与右侧按钮风格保持一致 */
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

/* 图标区域：与左侧栏等宽（200px） */
.header-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 200px;
  height: 100%;
  background-color: #001529;
  color: #fff;
}

.header-title {
  margin-left: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  /* 按钮组靠右展示 */
  margin-left: auto;
  /* 整体左移，避免按钮过于贴边 */
  margin-right: 100px;
}

/* 登录相关按钮：白色文字与图标，加粗 */
.header-right .header-button {
  color: #fff;
  font-weight: 600;
}

.header-right .header-button:hover {
  color: #fff;
  opacity: 0.8;
}

.layout-aside {
  background-color: #001529;
  overflow: hidden;
}

.layout-menu {
  height: 100%;
  border-right: none;
  overflow-y: auto;
}

.layout-main {
  padding: 16px;
  background-color: #f5f7fa;
  overflow-y: auto;
}

.layout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  color: #909399;
  font-size: 13px;
}
</style>
