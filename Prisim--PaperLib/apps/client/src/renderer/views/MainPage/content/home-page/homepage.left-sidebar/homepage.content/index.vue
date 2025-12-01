<script setup lang="ts">
/**
 * HomePage 左侧栏 - 内容区
 * 论文列表视图（Tree / Flat）
 */
import { ref, onMounted } from 'vue'
import { useLibraryMetaStore } from '@stores/library-meta/library-meta.store'
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'
import type { PaperMeta } from '@client&electron.share/types'

type ViewMode = 'tree' | 'flat'

const viewMode = ref<ViewMode>('tree')
const store = useLibraryMetaStore()
const paperReaderStore = usePaperReaderStore()

// 展开状态
const expandedProjects = ref<Set<string>>(new Set(['1', '2', '3', '4', '5']))

function toggleExpand(databaseId: string) {
  if (expandedProjects.value.has(databaseId)) {
    expandedProjects.value.delete(databaseId)
  } else {
    expandedProjects.value.add(databaseId)
  }
}

// 点击论文节点
function handlePaperClick(paper: PaperMeta, databaseId: string) {
  paperReaderStore.openPaper(
    paper.id,
    databaseId,
    paper.pdfPath || '',
    paper.title
  )
}

onMounted(() => {
  // 加载所有论文数据
  store.loadAllPapers()
})
</script>

<template>
  <div class="left-content">
    <!-- 视图切换条 -->
    <div class="view-switcher">
      <button 
        class="view-btn" 
        :class="{ active: viewMode === 'tree' }"
        @click="viewMode = 'tree'"
        title="树形视图"
      >
        <!-- Tree 图标 -->
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6v12" />
        </svg>
      </button>
      <button 
        class="view-btn" 
        :class="{ active: viewMode === 'flat' }"
        @click="viewMode = 'flat'"
        title="扁平视图"
      >
        <!-- Flat 图标 -->
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- 分隔线 -->
    <div class="divider" />

    <!-- 论文列表 -->
    <div class="paper-list">
      <!-- 树形视图 -->
      <template v-if="viewMode === 'tree'">
        <div 
          v-for="db in store.databases" 
          :key="db.id" 
          class="tree-node"
        >
          <!-- 项目节点 -->
          <div 
            class="project-node"
            @click="toggleExpand(db.id)"
          >
            <svg 
              class="expand-icon" 
              :class="{ expanded: expandedProjects.has(db.id) }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <svg class="folder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="node-name">{{ db.name }}</span>
            <span class="paper-count">{{ db.paperCount }}</span>
          </div>

          <!-- 论文子节点 -->
          <div 
            v-if="expandedProjects.has(db.id)" 
            class="paper-nodes"
          >
            <div 
              v-for="paper in store.getPapersForDatabase(db.id)" 
              :key="paper.id" 
              class="paper-node"
              @click="handlePaperClick(paper, db.id)"
            >
              <svg class="paper-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="paper-title">{{ paper.title }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 扁平视图 -->
      <template v-else>
        <div 
          v-for="paper in store.allPapers" 
          :key="paper.id" 
          class="flat-paper-item"
          @click="handlePaperClick(paper, store.getPaperWithDatabase(paper.id)?.databaseId || '')"
        >
          <svg class="paper-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="paper-title">{{ paper.title }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.left-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 视图切换条 */
.view-switcher {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  flex-shrink: 0;
}

.view-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.view-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.view-btn.active {
  background-color: var(--color-bg-hover);
  color: var(--color-accent);
}

.view-btn svg {
  width: 16px;
  height: 16px;
}

/* 分隔线 */
.divider {
  height: 1px;
  background-color: var(--color-border);
  flex-shrink: 0;
}

/* 论文列表 */
.paper-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* 自定义滚动条 */
.paper-list::-webkit-scrollbar {
  width: 4px;
}

.paper-list::-webkit-scrollbar-track {
  background: transparent;
}

.paper-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

/* 树形视图 */
.tree-node {
  margin-bottom: 2px;
}

.project-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.project-node:hover {
  background-color: var(--color-bg-hover);
}

.expand-icon {
  width: 12px;
  height: 12px;
  color: var(--color-text-muted);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.folder-icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.node-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.paper-count {
  font-size: 11px;
  color: var(--color-text-muted);
  background-color: var(--color-bg-hover);
  padding: 2px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

/* 论文子节点 */
.paper-nodes {
  margin-left: 18px;
  border-left: 1px solid var(--color-border-light);
}

.paper-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.paper-node:hover {
  background-color: var(--color-bg-hover);
}

.paper-icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.paper-title {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 扁平视图 */
.flat-paper-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.flat-paper-item:hover {
  background-color: var(--color-bg-hover);
}

.flat-paper-item .paper-icon {
  width: 16px;
  height: 16px;
}

.flat-paper-item .paper-title {
  font-size: 13px;
}
</style>
