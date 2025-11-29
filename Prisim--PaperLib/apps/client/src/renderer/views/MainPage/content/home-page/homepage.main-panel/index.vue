<script setup lang="ts">
/**
 * HomePage 主面板
 * 根据当前视图显示不同内容
 */
import { ref } from 'vue'
import ProjectDashboard from './ProjectDashboard.vue'

// 当前主视图（后续可从 navbar 传入）
const currentView = ref('files')
</script>

<template>
  <main class="main-panel">
    <!-- 项目仪表盘视图 -->
    <ProjectDashboard v-if="currentView === 'files'" />
    
    <!-- 其他视图占位 -->
    <div v-else class="placeholder-text">
      {{ currentView }} 视图开发中...
    </div>
  </main>
</template>

<style scoped>
.main-panel {
  flex: 1;
  display: flex;
  background-color: var(--color-bg-primary);
  overflow: hidden;
}

.placeholder-text {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 14px;
  opacity: 0.6;
}
</style>
