<script setup lang="ts">
/**
 * 全局任务进度对话框
 * 手风琴折叠布局，支持多种任务类型
 */
import { computed, ref } from 'vue'
import type { MineruTask } from '@client&electron.share/types'
import { useMineruTaskStore } from '@/renderer/stores/mineru-task/mineru-task.store'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const mineruStore = useMineruTaskStore()

// ===== 折叠状态 =====

/** 展开的模块（手风琴模式，只能展开一个） */
const expandedModule = ref<string | null>('mineru')

/** 展开的任务 ID（手风琴模式） */
const expandedTaskId = ref<string | null>(null)

// ===== 计算属性 =====

const mineruTaskList = computed(() => mineruStore.taskList)
const mineruProgress = computed(() => mineruStore.globalProgress)
const mineruIsEmpty = computed(() => mineruTaskList.value.length === 0)

/** MinerU 模块摘要 */
const mineruSummary = computed(() => {
  const { total, running, done, failed } = mineruProgress.value
  if (total === 0) return '暂无任务'
  const parts: string[] = []
  if (running > 0) parts.push(`${running} 进行中`)
  if (done > 0) parts.push(`${done} 已完成`)
  if (failed > 0) parts.push(`${failed} 失败`)
  return parts.join('，') || `${total} 个任务`
})

// ===== 方法 =====

function close(): void {
  emit('update:visible', false)
}

function toggleModule(moduleId: string): void {
  expandedModule.value = expandedModule.value === moduleId ? null : moduleId
  expandedTaskId.value = null
}

function toggleTask(taskId: string): void {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId
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
  return state
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
              <span>任务进度</span>
            </div>
            <button class="close-btn" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 手风琴内容区 -->
          <div class="dialog-content">
            <!-- MinerU OCR 折叠模块 -->
            <div class="accordion-module">
              <!-- 模块标题 -->
              <button 
                class="module-header"
                :class="{ expanded: expandedModule === 'mineru' }"
                @click="toggleModule('mineru')"
              >
                <svg class="module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span class="module-title">MinerU OCR</span>
                <span class="module-summary">{{ mineruSummary }}</span>
                <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <!-- 模块内容 -->
              <div v-if="expandedModule === 'mineru'" class="module-content">
                <!-- 空态 -->
                <div v-if="mineruIsEmpty" class="empty-state">
                  <p>暂无 OCR 任务</p>
                  <span>在阅读器右侧栏点击"发送至 MinerU OCR"开始</span>
                </div>

                <!-- 任务列表（子手风琴） -->
                <div v-else class="task-accordion">
                  <div
                    v-for="task in mineruTaskList"
                    :key="task.localId"
                    class="task-item"
                    :class="getStateClass(task.state)"
                  >
                    <!-- 任务标题（收起状态） -->
                    <button 
                      class="task-header"
                      :class="{ expanded: expandedTaskId === task.localId }"
                      @click="toggleTask(task.localId)"
                    >
                      <span class="task-name" :title="task.fileName">{{ task.fileName }}</span>
                      <span class="status-badge" :class="getStateClass(task.state)">
                        {{ getStateLabel(task.state) }}
                      </span>
                      <svg class="chevron-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <!-- 任务详情（展开状态） -->
                    <div v-if="expandedTaskId === task.localId" class="task-detail">
                      <div class="detail-row">
                        <span class="detail-label">创建时间</span>
                        <span class="detail-value">{{ formatTime(task.createdAt) }}</span>
                      </div>

                      <!-- 进度条（running 状态） -->
                      <div v-if="task.state === 'running' && task.progress" class="detail-row">
                        <span class="detail-label">解析进度</span>
                        <div class="progress-wrapper">
                          <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: getProgressPercent(task) + '%' }" />
                          </div>
                          <span class="progress-text">
                            {{ task.progress.extractedPages }} / {{ task.progress.totalPages }} 页
                          </span>
                        </div>
                      </div>

                      <!-- 错误信息（failed 状态） -->
                      <div v-if="task.state === 'failed' && task.errorMsg" class="detail-row error">
                        <span class="detail-label">错误信息</span>
                        <span class="detail-value error-text">{{ task.errorMsg }}</span>
                      </div>

                      <!-- 结果路径（done 状态） -->
                      <div v-if="task.state === 'done' && task.resultLocalPath" class="detail-row success">
                        <span class="detail-label">结果文件</span>
                        <span class="detail-value success-text">已下载</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 未来可以添加更多模块，如：AI 摘要、元数据提取 等 -->
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
  width: 520px;
  max-height: 70vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-icon {
  width: 18px;
  height: 18px;
  color: var(--color-accent);
}

.close-btn {
  width: 26px;
  height: 26px;
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
  width: 14px;
  height: 14px;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 手风琴模块 */
.accordion-module {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.module-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.02);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.module-header:hover {
  background: rgba(0, 0, 0, 0.04);
}

.module-icon {
  width: 18px;
  height: 18px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.module-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.module-summary {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: right;
  margin-right: 4px;
}

.chevron {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.module-header.expanded .chevron {
  transform: rotate(180deg);
}

.module-content {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 8px;
  background: white;
}

/* 空态 */
.empty-state {
  padding: 24px 16px;
  text-align: center;
}

.empty-state p {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 4px 0;
}

.empty-state span {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 任务手风琴 */
.task-accordion {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-item {
  border-radius: 6px;
  overflow: hidden;
  border-left: 3px solid transparent;
  background: rgba(0, 0, 0, 0.02);
}

.task-item.uploading { border-left-color: #6366f1; }
.task-item.pending { border-left-color: #f59e0b; }
.task-item.running { border-left-color: #3b82f6; }
.task-item.done { border-left-color: #10b981; }
.task-item.failed { border-left-color: #ef4444; }

.task-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.task-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.task-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-badge.uploading { background: #e0e7ff; color: #4338ca; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.running { background: #dbeafe; color: #1d4ed8; }
.status-badge.done { background: #d1fae5; color: #065f46; }
.status-badge.failed { background: #fee2e2; color: #991b1b; }

.chevron-small {
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.task-header.expanded .chevron-small {
  transform: rotate(180deg);
}

/* 任务详情 */
.task-detail {
  padding: 8px 12px 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-label {
  font-size: 12px;
  color: var(--color-text-muted);
  width: 60px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 12px;
  color: var(--color-text-primary);
}

.progress-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 5px;
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
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.error-text {
  color: #dc2626;
}

.success-text {
  color: #059669;
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
