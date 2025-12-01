<script setup lang="ts">
/**
 * SingleFile Right Sidebar - 右侧栏容器
 * 默认折叠，带非线性动画
 * 展开按钮已移至 Topbar
 */
import { ref } from 'vue'
import RightNavbar from './singlefile.navbar/index.vue'
import RightContent from './singlefile.content/index.vue'

defineProps<{
  collapsed: boolean
  width: number
}>()

const emit = defineEmits<{
  startResize: [e: MouseEvent]
}>()

// 标签配置
const tabs = [
  { id: 'overview', label: '概览' },
  { id: 'notes', label: '笔记' }
]

// 当前激活的标签
const activeTab = ref('overview')
</script>

<template>
  <div class="right-section" :class="{ collapsed }">
    <!-- 拖拽条 -->
    <div
      v-show="!collapsed"
      class="resize-handle"
      @mousedown="emit('startResize', $event)"
    />

    <!-- 右侧栏 -->
    <aside
      class="right-sidebar"
      :style="{ width: collapsed ? '0px' : width + 'px' }"
    >
      <template v-if="!collapsed">
        <RightNavbar 
          :tabs="tabs" 
          :active-tab="activeTab" 
          @update:active-tab="activeTab = $event" 
        />
        <RightContent :active-tab="activeTab" />
      </template>
    </aside>
  </div>
</template>

<style scoped>
.right-section {
  display: flex;
  flex-shrink: 0;
}

.right-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-card);
  border-left: 1px solid var(--color-border-light);
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
  margin-right: -2px;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: var(--color-accent);
}
</style>
