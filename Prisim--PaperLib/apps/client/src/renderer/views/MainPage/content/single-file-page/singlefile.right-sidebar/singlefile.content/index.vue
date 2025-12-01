<script setup lang="ts">
/**
 * SingleFile Right Content - 右侧内容区路由容器
 * 根据 activeTab 显示不同的面板
 */
import OverviewPanel from './OverviewPanel.vue'

defineProps<{
  activeTab: string
}>()
</script>

<template>
  <div class="single-pdf-right-sidebar-content">
    <!-- 概览面板 -->
    <OverviewPanel v-if="activeTab === 'overview'" />
    
    <!-- 笔记面板（占位） -->
    <div v-else-if="activeTab === 'notes'" class="single-pdf-right-sidebar-content__placeholder">
      <span>笔记功能开发中...</span>
    </div>
    
    <!-- 默认占位 -->
    <div v-else class="single-pdf-right-sidebar-content__placeholder">
      <span>请选择面板</span>
    </div>
  </div>
</template>

<style scoped>
.single-pdf-right-sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.single-pdf-right-sidebar-content__placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
