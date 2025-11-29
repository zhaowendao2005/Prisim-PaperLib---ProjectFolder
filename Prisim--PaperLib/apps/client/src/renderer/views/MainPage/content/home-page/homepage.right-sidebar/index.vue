<script setup lang="ts">
/**
 * HomePage 右侧栏 - 组合组件
 */
import RightNavbar from './homepage.navbar/index.vue'
import RightContent from './homepage.content/index.vue'

defineProps<{
  collapsed: boolean
  width: number
}>()

const emit = defineEmits<{
  expand: []
  collapse: []
  startResize: [e: MouseEvent]
}>()
</script>

<template>
  <div class="right-section" :class="{ collapsed }">
    <!-- 展开按钮（折叠时显示） -->
    <button
      v-if="collapsed"
      class="expand-btn"
      @click="emit('expand')"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- 拖拽条 -->
    <div
      v-show="!collapsed"
      class="resize-handle"
      @mousedown="emit('startResize', $event)"
    />

    <!-- 右侧栏 -->
    <aside
      v-show="!collapsed"
      class="right-sidebar"
      :style="{ width: width + 'px' }"
    >
      <RightNavbar @collapse="emit('collapse')" />
      <RightContent />
    </aside>
  </div>
</template>

<style scoped>
.right-section {
  display: flex;
  flex-shrink: 0;
}

.right-section.collapsed {
  width: 0;
}

.right-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-card);
  border-left: 1px solid var(--color-border-light);
  overflow: hidden;
}

.expand-btn {
  width: 24px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: var(--color-bg-card);
  border-radius: 8px 0 0 8px;
  border-left: 1px solid var(--color-border-light);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
  flex-shrink: 0;
}

.expand-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.expand-btn svg {
  width: 14px;
  height: 14px;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-right: -2px;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: var(--color-accent);
}
</style>
