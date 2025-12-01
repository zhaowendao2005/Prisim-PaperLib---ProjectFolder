<script setup lang="ts">
/**
 * SingleFile Right Navbar - 右侧导航栏
 * 折叠按钮已移至 Topbar
 */
</script>

<template>
  <nav class="right-navbar">
    <!-- 标题 -->
    <span class="navbar-title">侧栏</span>
  </nav>
</template>

<style scoped>
.right-navbar {
  display: flex;
  align-items: center;
  padding: 12px 12px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.navbar-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}
</style>
