<script setup lang="ts">
/**
 * 全局进度对话框
 * 展示 MinerU OCR 任务进度
 */
import { computed } from 'vue'
import type { MineruTask } from '@client&electron.share/types'
import { useMineruTaskStore } from '@/renderer/stores/mineru-task/mineru-task.store'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const mineruStore = useMineruTaskStore()

// ===== 计算属性 =====

const taskList = computed(() => mineruStore.taskList)
const globalProgress = computed(() => mineruStore.globalProgress)
const isEmpty = computed(() => taskList.value.length === 0)

// ===== 方法 =====

function close(): void {
  emit('update:visible', false)
}

function getStateLabel(state: MineruTask['state']): string {
  const labels: Record<MineruTask['state'], string> = {
    uploading: '上传中',
    pending: '排队中',
    running: '解析中',
    done: '已完成',
    failed: '失败'
  }
  return labels[state]
}

function getStateClass(state: MineruTask['state']): string {
  const classes: Record<MineruTask['state'], string> = {
    uploading: 'uploading',
    pending: 'pending',
    running: 'running',
    done: 'done',
    failed: 'failed'
  }
  return classes[state]
}

function getProgressPercent(task: MineruTask): number {
  if (!task.progress || task.progress.totalPages === 0) return 0
  return Math.round((task.progress.extractedPages / task.progress.totalPages) * 100)
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="dialog-overlay" @click.self="close">
        <div class="dialog-container">
          <!-- 标题栏 -->
          <div class="dialog-header">
            <div class="header-title">
              <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>MinerU OCR 任务进度</span>
            </div>
            <button class="close-btn" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 统计栏 -->
          <div v-if="!isEmpty" class="stats-bar">
            <div class="stat-item">
              <span class="stat-value">{{ globalProgress.total }}</span>
              <span class="stat-label">总计</span>
            </div>
            <div class="stat-item running">
              <span class="stat-value">{{ globalProgress.running }}</span>
              <span class="stat-label">进行中</span>
            </div>
            <div class="stat-item done">
              <span class="stat-value">{{ globalProgress.done }}</span>
              <span class="stat-label">已完成</span>
            </div>
            <div class="stat-item failed">
              <span class="stat-value">{{ globalProgress.failed }}</span>
              <span class="stat-label">失败</span>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="dialog-content">
            <!-- 空态 -->
            <div v-if="isEmpty" class="empty-state">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>当前没有 MinerU OCR 任务</p>
              <span>在论文上右键选择"使用 MinerU 解析"开始</span>
            </div>

            <!-- 任务列表 -->
            <div v-else class="task-list">
              <div
                v-for="task in taskList"
                :key="task.localId"
                class="task-item"
                :class="getStateClass(task.state)"
              >
                <div class="task-main">
                  <div class="task-info">
                    <span class="task-name" :title="task.fileName">{{ task.fileName }}</span>
                    <span class="task-time">{{ formatTime(task.createdAt) }}</span>
                  </div>
                  <div class="task-status">
                    <span class="status-badge" :class="getStateClass(task.state)">
                      {{ getStateLabel(task.state) }}
                    </span>
                  </div>
                </div>

                <!-- 进度条（仅 running 状态） -->
                <div v-if="task.state === 'running' && task.progress" class="task-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: getProgressPercent(task) + '%' }" />
                  </div>
                  <span class="progress-text">
                    {{ task.progress.extractedPages }} / {{ task.progress.totalPages }} 页
                  </span>
                </div>

                <!-- 错误信息（仅 failed 状态） -->
                <div v-if="task.state === 'failed' && task.errorMsg" class="task-error">
                  {{ task.errorMsg }}
                </div>

                <!-- 已下载标记（done 状态） -->
                <div v-if="task.state === 'done' && task.resultLocalPath" class="task-downloaded">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>已下载</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-container {
  width: 560px;
  max-height: 80vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-icon {
  width: 20px;
  height: 20px;
  color: var(--color-accent);
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

.stats-bar {
  display: flex;
  gap: 24px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.stat-item.running .stat-value { color: #f59e0b; }
.stat-item.done .stat-value { color: #10b981; }
.stat-item.failed .stat-value { color: #ef4444; }

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.empty-state span {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  border-left: 3px solid transparent;
}

.task-item.uploading { border-left-color: #6366f1; }
.task-item.pending { border-left-color: #f59e0b; }
.task-item.running { border-left-color: #3b82f6; }
.task-item.done { border-left-color: #10b981; }
.task-item.failed { border-left-color: #ef4444; }

.task-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.uploading { background: #e0e7ff; color: #4338ca; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.running { background: #dbeafe; color: #1d4ed8; }
.status-badge.done { background: #d1fae5; color: #065f46; }
.status-badge.failed { background: #fee2e2; color: #991b1b; }

.task-progress {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.task-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
  font-size: 12px;
  color: #991b1b;
}

.task-downloaded {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
}

.task-downloaded svg {
  width: 14px;
  height: 14px;
}

/* 动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
  transition: transform 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container,
.dialog-leave-to .dialog-container {
  transform: scale(0.95);
}
</style>
