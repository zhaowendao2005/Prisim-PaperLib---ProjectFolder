<script setup lang="ts">
/**
 * Home 页面 - 首页
 * 结构：左侧栏（垂直 navbar）+ 主面板 + 右侧栏（水平 navbar）
 */
import { ref } from 'vue'

// 侧边栏宽度
const leftSidebarWidth = ref(280)
const rightSidebarWidth = ref(320)

// 侧边栏折叠状态
const leftCollapsed = ref(false)
const rightCollapsed = ref(false)

// 拖拽调整宽度
const isResizingLeft = ref(false)
const isResizingRight = ref(false)

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
  isResizingRight.value = true
  const startX = e.clientX
  const startWidth = rightSidebarWidth.value

  const onMove = (e: MouseEvent) => {
    const delta = startX - e.clientX
    rightSidebarWidth.value = Math.max(240, Math.min(480, startWidth + delta))
  }

  const onUp = () => {
    isResizingRight.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>

<template>
  <div class="home-page">
    <!-- 左侧区域：垂直 Navbar + 内容 -->
    <div class="left-section" :class="{ collapsed: leftCollapsed }">
      <!-- 垂直 Navbar -->
      <nav class="left-navbar">
        <div class="nav-top">
          <!-- 折叠/展开按钮 -->
          <button class="nav-btn toggle-btn" @click="leftCollapsed = !leftCollapsed">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="leftCollapsed ? 'M13 5l7 7-7 7' : 'M11 19l-7-7 7-7'" />
            </svg>
          </button>
          <div class="nav-divider" />
          <button class="nav-btn active">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <button class="nav-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          <button class="nav-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button class="nav-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
        </div>
        <div class="nav-bottom">
          <button class="nav-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </nav>

      <!-- 左侧内容区 -->
      <aside
        v-show="!leftCollapsed"
        class="left-sidebar"
        :style="{ width: leftSidebarWidth + 'px' }"
      >
        <div class="sidebar-content">
          <div class="placeholder-text">左侧栏内容</div>
        </div>
      </aside>

      <!-- 左侧拖拽条 -->
      <div
        v-show="!leftCollapsed"
        class="resize-handle left"
        @mousedown="startResizeLeft"
      />
    </div>

    <!-- 主面板 -->
    <main class="main-panel">
      <div class="placeholder-text">主面板内容</div>
    </main>

    <!-- 右侧区域 -->
    <div class="right-section" :class="{ collapsed: rightCollapsed }">
      <!-- 展开按钮（折叠时显示） -->
      <button
        v-if="rightCollapsed"
        class="expand-btn right"
        @click="rightCollapsed = false"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- 右侧拖拽条 -->
      <div
        v-show="!rightCollapsed"
        class="resize-handle right"
        @mousedown="startResizeRight"
      />

      <!-- 右侧栏 -->
      <aside
        v-show="!rightCollapsed"
        class="right-sidebar"
        :style="{ width: rightSidebarWidth + 'px' }"
      >
        <!-- 水平 Navbar -->
        <nav class="right-navbar">
          <button class="tab-btn active">概览</button>
          <button class="tab-btn">统计</button>
          <button class="tab-btn">活动</button>
          <button class="tab-btn toggle-btn" @click="rightCollapsed = true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </nav>

        <!-- 右侧内容区 -->
        <div class="sidebar-content">
          <div class="placeholder-text">右侧栏内容</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 0;
}

/* ========== 左侧区域 ========== */
.left-section {
  display: flex;
  flex-shrink: 0;
}

.left-section.collapsed {
  width: 48px;
}

/* 垂直 Navbar */
.left-navbar {
  width: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 8px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
}

.nav-top,
.nav-bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-divider {
  height: 1px;
  margin: 4px 0;
  background-color: var(--color-border-light);
}

.nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.nav-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.nav-btn.active {
  background-color: var(--color-accent);
  color: white;
}

.nav-btn svg {
  width: 18px;
  height: 18px;
}

/* 左侧内容区 */
.left-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border-light);
  overflow: hidden;
}

/* ========== 主面板 ========== */
.main-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-primary);
  overflow: auto;
}

/* ========== 右侧区域 ========== */
.right-section {
  display: flex;
  flex-shrink: 0;
}

.right-section.collapsed {
  width: 0;
}

/* 右侧栏 */
.right-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-card);
  border-left: 1px solid var(--color-border-light);
  overflow: hidden;
}

/* 水平 Navbar */
.right-navbar {
  display: flex;
  gap: 4px;
  padding: 12px;
  border-bottom: 1px solid var(--color-border-light);
}

.tab-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.tab-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tab-btn.toggle-btn {
  margin-left: auto;
  padding: 6px;
}

.tab-btn.toggle-btn svg {
  width: 14px;
  height: 14px;
}

/* 展开按钮 */
.expand-btn {
  width: 24px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: var(--color-bg-card);
  border-radius: 8px 0 0 8px;
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

.expand-btn.right {
  border-left: 1px solid var(--color-border-light);
}

/* ========== 通用 ========== */
.sidebar-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.placeholder-text {
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
  opacity: 0.6;
}

/* 拖拽条 */
.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: var(--color-accent);
}

.resize-handle.left {
  margin-left: -2px;
}

.resize-handle.right {
  margin-right: -2px;
}
</style>
