<template>
  <!-- 根组件：整个应用的出口，只负责渲染路由匹配到的组件 -->
  <router-view></router-view>
</template>

<style>
/* 全局基础样式：撑满整个视口，消除默认边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}
</style>
