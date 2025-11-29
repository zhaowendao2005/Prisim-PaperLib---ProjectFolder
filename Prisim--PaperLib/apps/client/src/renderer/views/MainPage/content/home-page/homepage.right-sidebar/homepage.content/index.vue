<script setup lang="ts">
/**
 * HomePage 右侧栏 - 内容区
 * 显示选中数据卡片的概览信息
 */
import { useDataCardStore } from '@stores/home_datacard/home_datacard.store'

const store = useDataCardStore()

function formatDate(date: Date | null) {
  if (!date) return '从未'
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function getReadProgress(card: typeof store.selectedCard) {
  if (!card || card.stats.totalPapers === 0) return 0
  return Math.round((card.stats.readPapers / card.stats.totalPapers) * 100)
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

/* 操作按钮 */
.actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
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
</style>
