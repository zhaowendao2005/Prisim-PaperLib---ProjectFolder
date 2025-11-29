<script setup lang="ts">
/**
 * HomePage 左侧栏 - 组合组件
 */
import LeftNavbar from './homepage.navbar/index.vue'
import LeftContent from './homepage.content/index.vue'

defineProps<{
  collapsed: boolean
  width: number
}>()

const emit = defineEmits<{
  toggleCollapse: []
  startResize: []
}>()
</script>

<template>
  <div class="left-section" :class="{ collapsed }">
    <!-- 垂直 Navbar -->
    <LeftNavbar :collapsed="collapsed" @toggle-collapse="emit('toggleCollapse')" />

    <!-- 内容区 -->
    <aside
      v-show="!collapsed"
      class="left-sidebar"
      :style="{ width: width + 'px' }"
    >
      <LeftContent />
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

.left-section.collapsed {
  width: 48px;
}

.left-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border-light);
  overflow: hidden;
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
