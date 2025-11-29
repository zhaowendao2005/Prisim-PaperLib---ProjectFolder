<script setup lang="ts">
/**
 * Home 页面 - 首页
 * 结构：左侧栏（垂直 navbar）+ 主面板 + 右侧栏（水平 navbar）
 */
import { ref } from 'vue'

import LeftSidebar from './homepage.left-sidebar/index.vue'
import MainPanel from './homepage.main-panel/index.vue'
import RightSidebar from './homepage.right-sidebar/index.vue'

// 侧边栏宽度
const leftSidebarWidth = ref(280)
const rightSidebarWidth = ref(320)

// 侧边栏折叠状态
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)

// 拖拽调整宽度
const isResizingLeft = ref(false)

function startResizeLeft() {
  isResizingLeft.value = true
  document.addEventListener('mousemove', onResizeLeft)
  document.addEventListener('mouseup', stopResizeLeft)
}

function onResizeLeft(e: MouseEvent) {
  if (!isResizingLeft.value) return
  const newWidth = e.clientX - 48 // 减去 navbar 宽度
  leftSidebarWidth.value = Math.max(200, Math.min(400, newWidth))
}

function stopResizeLeft() {
  isResizingLeft.value = false
  document.removeEventListener('mousemove', onResizeLeft)
  document.removeEventListener('mouseup', stopResizeLeft)
}

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
</script>

<template>
  <div class="home-page">
    <!-- 左侧栏 -->
    <LeftSidebar
      :collapsed="leftCollapsed"
      :width="leftSidebarWidth"
      @toggle-collapse="leftCollapsed = !leftCollapsed"
      @start-resize="startResizeLeft"
    />

    <!-- 主面板 -->
    <MainPanel />

    <!-- 右侧栏 -->
    <RightSidebar
      :collapsed="rightCollapsed"
      :width="rightSidebarWidth"
      @expand="rightCollapsed = false"
      @collapse="rightCollapsed = true"
      @start-resize="startResizeRight"
    />
  </div>
</template>

<style scoped>
.home-page {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
