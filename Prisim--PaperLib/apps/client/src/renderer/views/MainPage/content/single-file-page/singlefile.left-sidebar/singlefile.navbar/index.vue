<script setup lang="ts">
/**
 * SingleFile Left Navbar - 左侧导航栏
 * 功能按钮区域（展开按钮已移至 Topbar）
 */
</script>

<template>
  <nav class="left-navbar">
    <!-- 功能按钮占位 -->
    <div class="nav-items">
      <!-- TODO: 添加功能按钮 -->
    </div>
  </nav>
</template>

<style scoped>
.left-navbar {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.nav-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
</style>
