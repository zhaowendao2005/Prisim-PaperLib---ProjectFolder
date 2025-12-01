<script setup lang="ts">
/**
 * SingleFile Topbar - PDF 阅读器工具栏
 */
import { computed } from 'vue'
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'

const paperReaderStore = usePaperReaderStore()
const readerState = computed(() => paperReaderStore.activeReaderState)

defineProps<{
  leftCollapsed: boolean
  rightCollapsed: boolean
}>()

const emit = defineEmits<{
  goToPage: [delta: number]
  zoom: [delta: number]
  toggleLeftSidebar: []
  toggleRightSidebar: []
}>()
</script>

<template>
  <div class="singlefile-topbar">
    <!-- 最左侧：左侧栏展开按钮 -->
    <button 
      class="sidebar-toggle-btn left"
      :class="{ active: !leftCollapsed }"
      :title="leftCollapsed ? '展开左侧栏' : '折叠左侧栏'"
      @click="emit('toggleLeftSidebar')"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    </button>

    <!-- 左侧：标题 -->
    <div class="topbar-left">
      <span class="paper-title">{{ readerState?.title || '未知文档' }}</span>
    </div>

    <!-- 中间：翻页控制 -->
    <div class="topbar-center">
      <button 
        class="tool-btn" 
        title="上一页" 
        :disabled="!readerState || readerState.currentPage <= 1"
        @click="emit('goToPage', -1)"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="page-info">
        {{ readerState?.currentPage || 1 }} / {{ readerState?.totalPages || '...' }}
      </span>
      <button 
        class="tool-btn" 
        title="下一页" 
        :disabled="!readerState || readerState.currentPage >= (readerState?.totalPages || 0)"
        @click="emit('goToPage', 1)"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- 右侧：缩放控制 -->
    <div class="topbar-right">
      <button class="tool-btn" title="缩小" @click="emit('zoom', -0.1)">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span class="zoom-level">{{ Math.round((readerState?.zoomLevel || 1) * 100) }}%</span>
      <button class="tool-btn" title="放大" @click="emit('zoom', 0.1)">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- 最右侧：右侧栏展开按钮 -->
    <button 
      class="sidebar-toggle-btn right"
      :class="{ active: !rightCollapsed }"
      :title="rightCollapsed ? '展开右侧栏' : '折叠右侧栏'"
      @click="emit('toggleRightSidebar')"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m6 6h-7" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.singlefile-topbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
  gap: 24px;
}

.topbar-left,
.topbar-center,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-left {
  position: absolute;
  left: 56px;
}

.topbar-right {
  position: absolute;
  right: 56px;
}

/* 侧边栏切换按钮 */
.sidebar-toggle-btn {
  position: absolute;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-toggle-btn.left {
  left: 12px;
}

.sidebar-toggle-btn.right {
  right: 12px;
}

.sidebar-toggle-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.sidebar-toggle-btn.active {
  color: var(--color-accent);
}

.sidebar-toggle-btn.active:hover {
  background-color: var(--color-accent-light);
}

.sidebar-toggle-btn svg {
  width: 18px;
  height: 18px;
}

.paper-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  padding: 6px 12px;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: 6px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: default;
  transition: all 0.15s ease;
}

.paper-title:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.06);
}

.tool-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn:disabled:hover {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.tool-btn svg {
  width: 18px;
  height: 18px;
}

.page-info,
.zoom-level {
  font-size: 13px;
  color: var(--color-text-secondary);
  min-width: 80px;
  text-align: center;
}
</style>
