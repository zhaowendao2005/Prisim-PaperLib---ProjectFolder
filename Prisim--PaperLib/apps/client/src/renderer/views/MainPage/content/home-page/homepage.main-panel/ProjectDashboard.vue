<script setup lang="ts">
/**
 * 项目仪表盘 - 6列响应式网格
 * 显示项目/数据库/论文库卡片
 */
import { onMounted, ref } from 'vue'
import { useDataCardStore } from '@stores/home_datacard/home_datacard.store'
import type { DataCard } from '@stores/home_datacard/home_datacard.datasource'
import DropZone from '@/renderer/components/drop-zone/index.vue'
import CreateProjectDialog from '@/renderer/components/create-project-dialog/index.vue'
import { isElectron } from '@/core/utils/env'

const store = useDataCardStore()

// 当前拖拽目标卡片 ID
const dragTargetId = ref<string | null>(null)

// 新建项目对话框
const showCreateDialog = ref(false)

function handleCreateClick() {
  showCreateDialog.value = true
}

function handleProjectCreated() {
  console.log('[ProjectDashboard] 项目创建成功')
}

// 右键选中卡片，显示概览
function handleContextMenu(e: MouseEvent, card: DataCard) {
  e.preventDefault()
  store.selectCard(card)
}

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 处理文件拖放
async function handleFileDrop(files: File[], cardId: string) {
  if (!isElectron()) {
    console.log('[ProjectDashboard] Web 模式下不支持文件导入')
    return
  }

  // 获取文件路径（Electron 环境下 File 对象有 path 属性）
  const filePaths = files
    .filter(f => f.name.toLowerCase().endsWith('.pdf'))
    .map(f => (f as File & { path: string }).path)
    .filter(Boolean)

  if (filePaths.length === 0) {
    console.log('[ProjectDashboard] 没有有效的 PDF 文件')
    return
  }

  console.log(`[ProjectDashboard] 导入 ${filePaths.length} 个文件到数据库 ${cardId}`)
  await store.importPapers(cardId, filePaths)
}

function onDragEnter(cardId: string) {
  dragTargetId.value = cardId
}

function onDragLeave() {
  dragTargetId.value = null
}

onMounted(() => {
  store.fetchDataCards()
})
</script>

<template>
  <div class="project-dashboard">
    <div class="dashboard-grid">
      <!-- 新建项目卡片 -->
      <div class="project-card new-project" @click="handleCreateClick">
        <div class="new-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span class="new-text">新建项目</span>
      </div>

      <!-- 项目卡片列表 -->
      <DropZone
        v-for="card in store.dataCards"
        :key="card.id"
        accept=".pdf"
        :overlay-text="`释放以导入到 ${card.name}`"
        @drop="(files) => handleFileDrop(files, card.id)"
        @dragenter="onDragEnter(card.id)"
        @dragleave="onDragLeave"
      >
        <div
          class="project-card"
          :class="{ 
            selected: store.selectedCard?.id === card.id,
            'drag-over': dragTargetId === card.id
          }"
          @contextmenu="handleContextMenu($event, card)"
        >
        <div class="card-icon">
          <!-- 数据库图标 -->
          <svg class="db-icon" width="48" height="48" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景装饰网格 -->
            <path d="M64 4 L116 34 V94 L64 124 L12 94 V34 Z" stroke="currentColor" stroke-width="1" fill="none" opacity="0.3"/>
            
            <!-- 外框 -->
            <path d="M30 10 H10 L4 16 V40" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
            <path d="M98 118 H118 L124 112 V88" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
            
            <!-- 装饰性短线 -->
            <rect x="110" y="40" width="2" height="10" fill="var(--color-accent)" />
            
            <!-- 核心数据库主体 -->
            <g transform="translate(34, 34)">
              <!-- 顶部数据块 -->
              <path class="data-block" d="M0 0 H50 L60 10 V16 H10 L0 6 Z" fill="currentColor" opacity="0.3"/>
              <!-- 中部数据块 -->
              <path class="data-block" d="M0 20 H60 V36 H10 L0 26 Z" fill="currentColor" opacity="0.5"/>
              <!-- 底部数据块 -->
              <path class="data-block" d="M0 40 H50 L60 50 V56 H10 L0 46 Z" fill="currentColor" opacity="0.3"/>
              
              <!-- 细节：数据槽 -->
              <rect x="45" y="24" width="8" height="8" fill="var(--color-bg-primary)"/>
              <rect x="35" y="24" width="2" height="8" fill="currentColor" opacity="0.2"/>
              <rect x="31" y="24" width="2" height="8" fill="currentColor" opacity="0.2"/>
            </g>

            <!-- 动态强调元素 -->
            <path d="M20 64 H30" stroke="var(--color-accent)" stroke-width="2"/>
            <path d="M98 64 H108" stroke="var(--color-accent)" stroke-width="2"/>
            
            <!-- 扫描线 (hover 时动画) -->
            <rect class="scan-line" x="34" y="34" width="60" height="2" fill="var(--color-accent)" opacity="0"/>
            
            <!-- 装饰性文字 -->
            <text x="75" y="105" font-family="Arial, sans-serif" font-weight="bold" font-size="6" fill="var(--color-accent)" letter-spacing="1">DATA</text>
            <text x="75" y="112" font-family="Arial, sans-serif" font-size="4" fill="currentColor" opacity="0.4" letter-spacing="0.5">VER.2.0</text>
            
            <!-- 状态点 -->
            <rect x="94" y="26" width="4" height="4" fill="#F2C94C" transform="rotate(45 96 28)"/>
          </svg>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ card.name }}</h3>
          <div class="card-meta">
            <span class="paper-count">{{ card.paperCount }} 篇论文</span>
            <span class="update-time">{{ formatDate(card.updatedAt) }}</span>
          </div>
        </div>
        </div>
      </DropZone>
    </div>

    <!-- 新建项目对话框 -->
    <CreateProjectDialog
      v-model:visible="showCreateDialog"
      @created="handleProjectCreated"
    />
  </div>
</template>

<style scoped>
.project-dashboard {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

/* 自定义滚动条 */
.project-dashboard::-webkit-scrollbar {
  width: 6px;
}

.project-dashboard::-webkit-scrollbar-track {
  background: transparent;
}

.project-dashboard::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.project-dashboard::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  min-width: 0;
}

/* 响应式：逐步减少列数 */
@media (max-width: 1600px) {
  .dashboard-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 最小宽度限制：固定尺寸 + overflow */
@media (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    min-width: 400px;
  }
}

/* 项目卡片 */
.project-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  min-height: 140px;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.project-card.selected {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent);
}

/* 拖拽状态 */
.project-card.drag-over {
  border-color: var(--color-accent);
  background-color: rgba(var(--color-accent-rgb, 59, 130, 246), 0.05);
  transform: scale(1.02);
}

/* 新建项目卡片 */
.project-card.new-project {
  border-style: dashed;
  border-color: var(--color-border);
  background-color: transparent;
}

.project-card.new-project:hover {
  border-color: var(--color-accent);
  background-color: var(--color-bg-hover);
}

.new-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: var(--color-bg-hover);
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.new-icon svg {
  width: 24px;
  height: 24px;
}

.project-card.new-project:hover .new-icon {
  background-color: var(--color-accent);
  color: white;
}

.new-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.project-card.new-project:hover .new-text {
  color: var(--color-accent);
}

/* 普通项目卡片 */
.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.card-icon .db-icon {
  width: 56px;
  height: 56px;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.project-card:hover .db-icon {
  transform: scale(1.05);
}

/* 扫描线动画 */
.card-icon .db-icon .scan-line {
  opacity: 0;
  pointer-events: none;
}

.project-card:hover .db-icon .scan-line {
  animation: scan 1.5s infinite linear;
}

/* hover 时数据块变色 */
.project-card:hover .db-icon .data-block {
  fill: var(--color-accent);
  transition: fill 0.3s;
}

@keyframes scan {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(60px);
    opacity: 0;
  }
}

.card-content {
  text-align: center;
  width: 100%;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.paper-count::after {
  content: '·';
  margin-left: 8px;
  opacity: 0.5;
}
</style>
