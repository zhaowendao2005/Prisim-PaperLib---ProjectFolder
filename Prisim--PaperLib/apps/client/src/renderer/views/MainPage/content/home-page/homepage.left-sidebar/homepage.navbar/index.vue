<script setup lang="ts">
/**
 * HomePage 左侧栏 - 垂直导航栏
 * 
 * 分组结构：
 * 1. 主视图组：收回按钮 + 直接更改主内容视图的按钮（独立选中状态）
 * 2. 侧栏视图组：决定左侧栏内容视图的按钮（独立选中状态）
 * 3. 操作组：点击后添加新标签页的按钮（底部对齐）
 */
import { ref } from 'vue'
import { useTabManager } from '@composables/page-navigation'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggleCollapse: []
}>()

const { tabs, addTab, setActiveTab } = useTabManager()

// 主视图组选中状态
const activeMainView = ref('files')

// 侧栏视图组选中状态
const activeSidebarView = ref('papers')

/** 打开设置页面（单例模式：已存在则激活，否则新建） */
function handleOpenSettings() {
  const existingTab = tabs.value.find(t => t.type === 'settings')
  if (existingTab) {
    setActiveTab(existingTab.id)
  } else {
    addTab('settings', 'Settings')
  }
}
</script>

<template>
  <nav class="left-navbar">
    <!-- 顶部区域 -->
    <div class="nav-top">
      <!-- 组1: 收回按钮 + 主视图切换 -->
      <div class="nav-group">
        <!-- 折叠/展开按钮 -->
        <button class="nav-btn toggle-btn" @click="emit('toggleCollapse')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="collapsed ? 'M13 5l7 7-7 7' : 'M11 19l-7-7 7-7'" />
          </svg>
        </button>
        <!-- 文件视图 -->
        <button 
          class="nav-btn" 
          :class="{ active: activeMainView === 'files' }"
          @click="activeMainView = 'files'"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>

      <div class="nav-divider" />

      <!-- 组2: 侧栏内容视图切换 -->
      <div class="nav-group">
        <!-- 论文列表 -->
        <button 
          class="nav-btn" 
          :class="{ active: activeSidebarView === 'papers' }"
          @click="activeSidebarView = 'papers'"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="nav-bottom">
      <div class="nav-divider" />

      <!-- 组3: 操作按钮 -->
      <div class="nav-group">
        <!-- 新建项目（添加新标签页） -->
        <button class="nav-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <!-- 设置 -->
        <button class="nav-btn" @click="handleOpenSettings">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.left-navbar {
  width: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
}

.nav-top,
.nav-bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-divider {
  height: 1px;
  margin: 6px 0;
  background-color: var(--color-border);
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

.nav-btn.toggle-btn {
  color: var(--color-text-muted);
}

.nav-btn.toggle-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.nav-btn svg {
  width: 18px;
  height: 18px;
}
</style>
