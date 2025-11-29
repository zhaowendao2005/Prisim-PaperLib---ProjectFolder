<script setup lang="ts">
/**
 * Project 页面 - 论文阅读与管理
 * 包含：左侧边栏（论文列表）、主面板（PDF阅读器）、右侧边栏（Notes/AI）
 */
import LeftSidebar from './left-sidebar/index.vue'
import MainPanel from './main-panel/index.vue'
import RightSidebar from './right-sidebar/index.vue'
</script>

<template>
  <div class="project-page">
    <LeftSidebar />
    <MainPanel />
    <RightSidebar />
  </div>
</template>

<style scoped>
.project-page {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 12px;
}
</style>
