<script setup lang="ts">
/**
 * SingleFile Left Sidebar - 左侧栏容器
 * 默认折叠，带非线性动画
 * 展开按钮已移至 Topbar
 */
import LeftNavbar from './singlefile.navbar/index.vue'
import LeftContent from './singlefile.content/index.vue'

defineProps<{
  collapsed: boolean
  width: number
}>()

const emit = defineEmits<{
  startResize: []
}>()
</script>

<template>
  <div class="left-section" :class="{ collapsed }">
    <!-- 垂直 Navbar（仅展开时显示） -->
    <LeftNavbar v-show="!collapsed" />

    <!-- 内容区 -->
    <aside
      class="left-sidebar"
      :style="{ width: collapsed ? '0px' : width + 'px' }"
    >
      <LeftContent v-show="!collapsed" />
    </aside>

    <!-- 拖拽条 -->
    <div
      v-show="!collapsed"
      class="resize-handle"
      @mousedown="emit('startResize')"
    />
  </div>
</template>

<style scoped>
.left-section {
  display: flex;
  flex-shrink: 0;
}

.left-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border-light);
  overflow: hidden;
  /* 非线性动画 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-left: -2px;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: var(--color-accent);
}
</style>
