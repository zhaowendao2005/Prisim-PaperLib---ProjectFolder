<script setup lang="ts">
/**
 * 主页面 - 布局容器
 */
import { ref } from 'vue'

import Topbar from './topbar/index.vue'
import LeftSidebar from './content/left-sidebar/index.vue'
import MainPanel from './content/main-panel/index.vue'
import RightSidebar from './content/right-sidebar/index.vue'

const isDark = ref(false)
</script>

<template>
  <!-- 根容器 -->
  <div class="app-container" :class="{ dark: isDark }">
    <!-- 1. Title Bar -->
    <Topbar />

    <!-- 2. Main Layout -->
    <main class="main-layout">
      <LeftSidebar />
      <MainPanel />
      <RightSidebar />
    </main>
  </div>
</template>

<style scoped>
/* ========== 根容器 ========== */
.app-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: background-color 0.5s, color 0.5s;
}

/* ========== Main Layout ========== */
.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 8px 12px 12px;
  gap: 12px;
}
</style>
