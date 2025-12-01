<script setup lang="ts">
/**
 * Single File Page - PDF 阅读器页面
 * 结构：Topbar + 左侧栏 + 主面板 + 右侧栏
 */
import { ref, computed } from 'vue'
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'

import Topbar from './singlefile.topbar/index.vue'
import LeftSidebar from './singlefile.left-sidebar/index.vue'
import MainPanel from './singlefile.main-panel/index.vue'
import RightSidebar from './singlefile.right-sidebar/index.vue'

const paperReaderStore = usePaperReaderStore()
const readerState = computed(() => paperReaderStore.activeReaderState)

// MainPanel 引用
const mainPanelRef = ref<InstanceType<typeof MainPanel> | null>(null)

// 侧边栏宽度
const leftSidebarWidth = ref(280)
const rightSidebarWidth = ref(320)

// 侧边栏折叠状态（默认折叠）
const leftCollapsed = ref(true)
const rightCollapsed = ref(true)

// 拖拽调整左侧栏宽度
const isResizingLeft = ref(false)

function startResizeLeft() {
  isResizingLeft.value = true
  document.addEventListener('mousemove', onResizeLeft)
  document.addEventListener('mouseup', stopResizeLeft)
}

function onResizeLeft(e: MouseEvent) {
  if (!isResizingLeft.value) return
  const newWidth = e.clientX - 40 // 减去 navbar 宽度
  leftSidebarWidth.value = Math.max(200, Math.min(400, newWidth))
}

function stopResizeLeft() {
  isResizingLeft.value = false
  document.removeEventListener('mousemove', onResizeLeft)
  document.removeEventListener('mouseup', stopResizeLeft)
}

// 拖拽调整右侧栏宽度
function startResizeRight(e: MouseEvent) {
  const startX = e.clientX
  const startWidth = rightSidebarWidth.value

  const onMove = (e: MouseEvent) => {
    const delta = startX - e.clientX
    rightSidebarWidth.value = Math.max(240, Math.min(480, startWidth + delta))
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// 工具栏事件处理
function handleGoToPage(delta: number) {
  mainPanelRef.value?.goToPage(delta)
}

function handleZoom(delta: number) {
  mainPanelRef.value?.zoom(delta)
}
</script>

<template>
  <div class="single-file-page">
    <!-- 加载状态 -->
    <div v-if="!readerState" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="empty-text">未找到论文</p>
    </div>

    <!-- PDF 阅读器 -->
    <template v-else>
      <!-- 顶部工具栏 -->
      <Topbar 
        :left-collapsed="leftCollapsed"
        :right-collapsed="rightCollapsed"
        @go-to-page="handleGoToPage"
        @zoom="handleZoom"
        @toggle-left-sidebar="leftCollapsed = !leftCollapsed"
        @toggle-right-sidebar="rightCollapsed = !rightCollapsed"
      />

      <!-- 内容区：左侧栏 + 主面板 + 右侧栏 -->
      <div class="content-area">
        <!-- 左侧栏 -->
        <LeftSidebar
          :collapsed="leftCollapsed"
          :width="leftSidebarWidth"
          @start-resize="startResizeLeft"
        />

        <!-- 主面板 -->
        <MainPanel ref="mainPanelRef" />

        <!-- 右侧栏 -->
        <RightSidebar
          :collapsed="rightCollapsed"
          :width="rightSidebarWidth"
          @start-resize="startResizeRight"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.single-file-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  overflow: hidden;
}

/* 内容区 */
.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--color-text-muted);
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.5;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}
</style>
