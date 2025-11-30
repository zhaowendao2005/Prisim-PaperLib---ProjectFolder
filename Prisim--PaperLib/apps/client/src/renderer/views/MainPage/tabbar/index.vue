<script setup lang="ts">
/**
 * MainPage 标签栏组件 - Safari 风格悬浮胶囊
 */
import { useTabManager } from '@composables/page-navigation'
import type { TabItem } from '@composables/page-navigation'

const { tabs, activeTabId, setActiveTab, addTab, closeTab } = useTabManager()

/** 获取 Tab 图标 */
function getTabIcon(type: TabItem['type']) {
  const icons: Record<string, string> = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    project: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'new-tab': 'M12 6v6m0 0v6m0-6h6m-6 0H6',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  }
  return icons[type] ?? icons['new-tab']
}

/** 处理关闭 Tab */
function handleCloseTab(e: Event, id: string) {
  e.stopPropagation()
  closeTab(id)
}

/** 添加新 Tab */
function handleAddTab() {
  addTab('new-tab', 'New Tab')
}
</script>

<template>
  <nav class="tabbar">
    <div class="tabbar-container">
      <!-- Dynamic Tabs -->
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-pill"
        :class="{ active: activeTabId === tab.id }"
        @click="setActiveTab(tab.id)"
      >
        <div class="tab-icon-wrapper">
          <!-- Icon (hidden on hover for closable tabs) -->
          <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getTabIcon(tab.type)" />
          </svg>
          <!-- Close Button (shown on hover, except for Home) -->
          <button
            v-if="tab.id !== 'home'"
            class="tab-close-btn"
            @click="handleCloseTab($event, tab.id)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <span class="tab-title">{{ tab.title }}</span>
      </div>

      <!-- Add Tab Button -->
      <button class="add-tab-btn" @click="handleAddTab">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.tabbar {
  padding: 0;
  border-bottom: 1px solid var(--color-border);
}

.tabbar-container {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background-color: var(--color-bg-sidebar);
  backdrop-filter: blur(24px);
  overflow-x: auto;
}

/* Tab Pill */
.tab-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  min-width: 160px;
  max-width: 240px;
  flex: 1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-muted);
  background: transparent;
}

.tab-pill:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

.tab-pill.active {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
  /* 极淡边框区分白色背景 */
  box-shadow: 
    0 1px 2px 0 rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

/* Icon Wrapper */
.tab-icon-wrapper {
  position: relative;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 4px;
}

.tab-icon {
  width: 14px;
  height: 14px;
  transition: opacity 0.2s;
}

.tab-pill.active .tab-icon {
  color: var(--color-text-primary);
}

/* Close Button */
.tab-close-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
  color: var(--color-text-muted);
}

.tab-pill:hover .tab-close-btn {
  opacity: 1;
}

.tab-pill:hover .tab-icon {
  opacity: 0;
}

.tab-close-btn svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.5;
}

.tab-close-btn:hover {
  color: var(--color-text-primary);
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

/* Tab Title */
.tab-title {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  user-select: none;
}

/* Add Tab Button */
.add-tab-btn {
  width: 32px;
  height: 32px;
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-tab-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

.add-tab-btn svg {
  width: 16px;
  height: 16px;
}
</style>
