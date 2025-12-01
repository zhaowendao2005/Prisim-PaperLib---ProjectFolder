<script setup lang="ts">
/**
 * MainPage 顶部标题栏组件
 * 基于公共 Titlebar 组件，添加页面特有的拖拽区域和工具栏
 */
import { ref, computed } from 'vue'
import { useTabManager } from '@composables/page-navigation'
import { useMineruTaskStore } from '@/renderer/stores/mineru-task/mineru-task.store'

import Titlebar from '@components/titlebar/index.vue'
import ProgressDialog from '../Dialog/progress-dialog/index.vue'

const isDark = ref(false)
const { activeTab } = useTabManager()

// MinerU 任务 Store
const mineruStore = useMineruTaskStore()

// 是否显示 title-pill（仅在 project 页面显示）
const showTitlePill = computed(() => activeTab.value?.type === 'project')

// 临时：selectedPaper 标题显示
const selectedPaperTitle = ref('Attention Is All You Need')

// ===== 进度按钮相关 =====

/** 进度对话框是否可见 */
const progressDialogVisible = ref(false)

/** 是否有活跃任务 */
const hasActiveTasks = computed(() => mineruStore.hasRunningTask)

/** 进度统计 */
const progressStats = computed(() => mineruStore.globalProgress)

/** 切换进度对话框 */
function toggleProgressDialog(): void {
  progressDialogVisible.value = !progressDialogVisible.value
}
</script>

<template>
  <!-- 不传回调，使用 Titlebar 默认的 window.api 调用 -->
  <Titlebar>
    <!-- Title / Drag Area -->
    <div class="title-drag-area">
      <div v-if="showTitlePill" class="title-pill">
        <svg class="icon-doc" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="title-text">PaperMind</span>
        <span class="title-sep"> — </span>
        <span class="title-filename">{{ selectedPaperTitle }}.pdf</span>
      </div>
    </div>

    <!-- Right Toolbar -->
    <div class="title-toolbar">
      <!-- MinerU 进度按钮（始终显示） -->
      <button
        class="toolbar-btn progress-btn"
        :class="{ active: hasActiveTasks }"
        title="MinerU OCR 任务"
        @click="toggleProgressDialog"
      >
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span v-if="hasActiveTasks" class="progress-badge">{{ progressStats.running }}</span>
      </button>

      <button class="toolbar-btn" @click="isDark = !isDark">
        <svg v-if="isDark" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
      <button class="toolbar-btn">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </button>
    </div>
  </Titlebar>

  <!-- 进度对话框 -->
  <ProgressDialog v-model:visible="progressDialogVisible" />
</template>

<style scoped>
/* Title Drag Area */
.title-drag-area {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: drag;
}

.title-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 6px;
  background-color: var(--color-bg-hover);
  transition: background-color 0.2s;
}

.icon-doc {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #007AFF;
}

.title-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.title-sep {
  font-size: 10px;
  opacity: 0.4;
  margin: 0 4px;
}

.title-filename {
  font-size: 12px;
  opacity: 0.6;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Title Toolbar */
.title-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  width: 80px;
  -webkit-app-region: no-drag;
}

.toolbar-btn {
  color: var(--color-text-muted);
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.toolbar-btn:hover { color: var(--color-text-secondary); }

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 进度按钮样式 */
.progress-btn {
  position: relative;
}

.progress-btn.active {
  color: var(--color-accent);
}

.progress-btn.active .icon {
  animation: pulse 2s infinite;
}

.progress-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--color-accent);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
