<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { login } from '@/api/login';

const router = useRouter();
const loginFormRef = ref(null);

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
});

// 表单校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' },
  ],
};

// 处理登录
const handleLogin = async () => {
  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;

  try {
    // 调用后端登录接口，成功后保存 token
    const data = await login(loginForm);
    localStorage.setItem('token', data.token);
    ElMessage.success('登录成功');
    router.push('/index');
  } catch {
    // 失败信息已由请求响应拦截器统一提示
  }
};
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <h1 class="login-title">tlias 智能学习辅助系统</h1>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  /* 登录页背景图片：铺满并居中显示 */
  background-image: url('@/assets/login-bg.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-color: #f2f3f5;
}

.login-card {
  width: 420px;
  border-radius: 8px;
}

.login-title {
  margin-bottom: 24px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.login-button {
  width: 100%;
}
</style>
