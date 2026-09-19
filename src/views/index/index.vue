<script setup>
// 首页：对应路由 /index（背景图：src/assets/index.png）
</script>

<template>
  <div class="page-container">
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100%;
  /* 首页背景图片：居中显示 */
  background-image: url('@/assets/index.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 70%;
}

.page-title {
  font-weight: 600;
}

.page-tip {
  color: #909399;
}
</style>
