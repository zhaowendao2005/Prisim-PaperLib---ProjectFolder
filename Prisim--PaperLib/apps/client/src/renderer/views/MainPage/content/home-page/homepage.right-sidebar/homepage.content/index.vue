<script setup lang="ts">
/**
 * HomePage 右侧栏 - 内容区
 * 显示选中数据卡片的概览信息和论文列表
 */
import { ref, watch, computed } from 'vue'
import { useDataCardStore } from '@stores/home_datacard/home_datacard.store'
import { useLibraryMetaStore } from '@stores/library-meta/library-meta.store'
import type { Paper } from '@stores/home_datacard/home_datacard.datasource'
import { isElectron } from '@/core/utils/env'

const store = useDataCardStore()
const libraryMetaStore = isElectron() ? useLibraryMetaStore() : null

// 当前选中卡片的论文列表
const papers = ref<Paper[]>([])
const loadingPapers = ref(false)

// 删除确认对话框
const showDeleteConfirm = ref(false)
const deleting = ref(false)

// 获取当前选中卡片的论文
const currentPapers = computed(() => {
  if (!store.selectedCard) return []
  return store.getPapersForProject(store.selectedCard.id)
})

// 监听选中卡片变化，加载论文
watch(() => store.selectedCard, async (card) => {
  if (!card) {
    papers.value = []
    return
  }
  loadingPapers.value = true
  try {
    await store.fetchPapersByProject(card.id)
  } finally {
    loadingPapers.value = false
  }
}, { immediate: true })

function formatDate(date: Date | null) {
  if (!date) return '从未'
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function getReadProgress(card: typeof store.selectedCard) {
  if (!card || card.stats.totalPapers === 0) return 0
  return Math.round((card.stats.readPapers / card.stats.totalPapers) * 100)
}

function formatAuthors(authors: string[]) {
  if (authors.length === 0) return '未知作者'
  if (authors.length <= 2) return authors.join(', ')
  return `${authors[0]} 等`
}

function formatFileSize(bytes: number | undefined) {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`
}

// 删除数据库
function handleDeleteClick() {
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!store.selectedCard || !libraryMetaStore) return
  
  deleting.value = true
  try {
    const cardId = store.selectedCard.id
    // 清除选中状态
    store.clearCardSelection()
    // 删除数据库（同时删除文件）
    await libraryMetaStore.removeDatabase(cardId, true)
  } catch (e) {
    console.error('[RightContent] 删除数据库失败:', e)
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="right-content">
    <!-- 有选中卡片时显示概览 -->
    <template v-if="store.selectedCard">
      <div class="overview-card">
        <!-- 标题 -->
        <h3 class="overview-title">{{ store.selectedCard.name }}</h3>
        
        <!-- 描述 -->
        <p class="overview-desc">{{ store.selectedCard.description }}</p>
        
        <!-- 标签 -->
        <div class="overview-tags">
          <span 
            v-for="tag in store.selectedCard.tags" 
            :key="tag" 
            class="tag"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 分隔线 -->
        <div class="divider" />

        <!-- 统计信息 -->
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ store.selectedCard.stats.totalPapers }}</span>
            <span class="stat-label">总论文</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.selectedCard.stats.readPapers }}</span>
            <span class="stat-label">已阅读</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.selectedCard.stats.annotatedPapers }}</span>
            <span class="stat-label">已标注</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ getReadProgress(store.selectedCard) }}%</span>
            <span class="stat-label">阅读进度</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: getReadProgress(store.selectedCard) + '%' }"
          />
        </div>

        <!-- 分隔线 -->
        <div class="divider" />

        <!-- 时间信息 -->
        <div class="time-info">
          <div class="time-item">
            <span class="time-label">创建时间</span>
            <span class="time-value">{{ formatDate(store.selectedCard.createdAt) }}</span>
          </div>
          <div class="time-item">
            <span class="time-label">更新时间</span>
            <span class="time-value">{{ formatDate(store.selectedCard.updatedAt) }}</span>
          </div>
          <div class="time-item">
            <span class="time-label">上次打开</span>
            <span class="time-value">{{ formatDate(store.selectedCard.stats.lastOpenedAt) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <button class="action-btn primary">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            打开项目
          </button>
          <button class="action-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
          <button class="action-btn danger" @click="handleDeleteClick">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            删除
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="divider" />

        <!-- 论文列表 -->
        <div class="papers-section">
          <div class="section-header">
            <h4 class="section-title">论文列表</h4>
            <span class="paper-count">{{ currentPapers.length }} 篇</span>
          </div>

          <!-- 加载状态 -->
          <div v-if="loadingPapers" class="papers-loading">
            <div class="loading-spinner"></div>
            <span>加载中...</span>
          </div>

          <!-- 论文列表 -->
          <div v-else-if="currentPapers.length > 0" class="papers-list">
            <div 
              v-for="paper in currentPapers" 
              :key="paper.id" 
              class="paper-item"
              :class="{ 'is-read': paper.isRead }"
            >
              <div class="paper-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div class="paper-content">
                <h5 class="paper-title">{{ paper.title }}</h5>
                <div class="paper-meta">
                  <span class="paper-authors">{{ formatAuthors(paper.authors) }}</span>
                  <span v-if="paper.year" class="paper-year">{{ paper.year }}</span>
                </div>
                <div class="paper-footer">
                  <span class="paper-date">{{ formatShortDate(paper.createdAt) }}</span>
                  <div class="paper-badges">
                    <span v-if="paper.isRead" class="badge read">已读</span>
                    <span v-if="paper.isAnnotated" class="badge annotated">已标注</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="papers-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>暂无论文</span>
            <span class="hint">拖放 PDF 文件到卡片导入</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 无选中时显示提示 -->
    <template v-else>
      <div class="empty-state">
        <div class="empty-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="empty-text">右键点击卡片查看概览</p>
      </div>
    </template>

    <!-- 删除确认对话框 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteConfirm" class="delete-confirm-overlay" @click.self="cancelDelete">
          <div class="delete-confirm-dialog">
            <div class="dialog-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="dialog-title">删除论文库</h3>
            <p class="dialog-message">
              确定要删除「{{ store.selectedCard?.name }}」吗？<br>
              <span class="warning">此操作将永久删除所有论文文件，无法恢复。</span>
            </p>
            <div class="dialog-actions">
              <button class="dialog-btn cancel" @click="cancelDelete" :disabled="deleting">
                取消
              </button>
              <button class="dialog-btn confirm" @click="confirmDelete" :disabled="deleting">
                {{ deleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.right-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 自定义滚动条 */
.right-content::-webkit-scrollbar {
  width: 4px;
}

.right-content::-webkit-scrollbar-track {
  background: transparent;
}

.right-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

/* 概览卡片 */
.overview-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.overview-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 标签 */
.overview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-accent);
  background-color: rgba(0, 122, 255, 0.1);
  border-radius: 4px;
}

/* 分隔线 */
.divider {
  height: 1px;
  background-color: var(--color-border-light);
  margin: 4px 0;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* 进度条 */
.progress-bar {
  height: 4px;
  background-color: var(--color-bg-hover);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-accent);
  border-radius: 2px;
  transition: width 0.3s;
}

/* 时间信息 */
.time-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.time-value {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 操作按钮 - 2列网格 */
.actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  height: 40px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  background-color: var(--color-bg-card);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--color-border);
  background-color: var(--color-bg-hover);
}

.action-btn.primary {
  border-color: var(--color-accent);
  background-color: var(--color-accent);
  color: white;
}

.action-btn.primary:hover {
  background-color: var(--color-accent-hover, #0066CC);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-text {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
}

/* 论文列表区域 */
.papers-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.paper-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 加载状态 */
.papers-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--color-text-muted);
  font-size: 13px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border-light);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 论文列表 */
.papers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.papers-list::-webkit-scrollbar {
  width: 4px;
}

.papers-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.paper-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.paper-item:hover {
  background-color: var(--color-bg-hover);
}

.paper-item.is-read {
  opacity: 0.7;
}

.paper-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
}

.paper-icon svg {
  width: 20px;
  height: 20px;
}

.paper-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.paper-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.paper-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.paper-year {
  color: var(--color-text-secondary);
}

.paper-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.paper-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.paper-badges {
  display: flex;
  gap: 4px;
}

.badge {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 500;
  border-radius: 4px;
}

.badge.read {
  background-color: rgba(52, 199, 89, 0.15);
  color: #34C759;
}

.badge.annotated {
  background-color: rgba(255, 149, 0, 0.15);
  color: #FF9500;
}

/* 空状态 */
.papers-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--color-text-muted);
}

.papers-empty svg {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

.papers-empty span {
  font-size: 13px;
}

.papers-empty .hint {
  font-size: 11px;
  opacity: 0.7;
}

/* 删除按钮样式 */
.action-btn.danger {
  border-color: rgba(255, 59, 48, 0.3);
  color: #FF3B30;
}

.action-btn.danger:hover {
  border-color: #FF3B30;
  background-color: rgba(255, 59, 48, 0.1);
}

/* 删除确认对话框 */
.delete-confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.delete-confirm-dialog {
  background: var(--color-bg-card);
  border-radius: 16px;
  padding: 24px;
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.dialog-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 50%;
  color: #FF3B30;
}

.dialog-icon svg {
  width: 28px;
  height: 28px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.dialog-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.dialog-message .warning {
  color: #FF3B30;
  font-size: 13px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  width: 100%;
}

.dialog-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.dialog-btn.cancel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
}

.dialog-btn.cancel:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.dialog-btn.confirm {
  background: #FF3B30;
  border: none;
  color: white;
}

.dialog-btn.confirm:hover:not(:disabled) {
  background: #E53528;
}

.dialog-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 对话框动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
