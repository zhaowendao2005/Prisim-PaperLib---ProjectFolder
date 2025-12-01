<script setup lang="ts">
/**
 * Single File Page - PDF 阅读器页面
 */
import { ref, computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'
import * as pdfjsLib from 'pdfjs-dist'
import { EventBus, PDFSinglePageViewer, PDFLinkService } from 'pdfjs-dist/web/pdf_viewer.mjs'
import 'pdfjs-dist/web/pdf_viewer.css'

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href
console.log('[PDF] Worker 配置:', pdfjsLib.GlobalWorkerOptions.workerSrc)

const paperReaderStore = usePaperReaderStore()

// 当前激活的阅读器状态
const readerState = computed(() => paperReaderStore.activeReaderState)

// PDF Viewer 相关
const viewerContainerRef = ref<HTMLDivElement | null>(null)
const viewerRef = ref<HTMLDivElement | null>(null)
const pdfViewer = shallowRef<PDFSinglePageViewer | null>(null)
const eventBus = shallowRef<EventBus | null>(null)
const pdfLinkService = shallowRef<PDFLinkService | null>(null)
const renderError = ref<string | null>(null)
const loadedPaperId = ref<string | null>(null)

// PDF 文档缓存 (LRU,最多 5 个)
const MAX_CACHE_SIZE = 5
const pdfDocumentCache = new Map<string, pdfjsLib.PDFDocumentProxy>()
const cacheAccessOrder: string[] = [] // 记录访问顺序,用于 LRU

// 监听 pdfPath 变化,直接加载 PDF
watch(
  () => readerState.value?.pdfPath,
  async (pdfPath, oldPdfPath) => {
    const state = readerState.value
    console.log('[SingleFilePage] pdfPath 变化:', {
      pdfPath,
      paperId: state?.paperId,
      loadedPaperId: loadedPaperId.value
    })
    
    // 只在 pdfPath 存在且未加载过该论文时加载
    if (pdfPath && state && state.paperId !== loadedPaperId.value) {
      loadedPaperId.value = state.paperId
      await loadPDFFromPath(pdfPath)
    }
  },
  { immediate: true }
)

/**
 * 初始化 PDF Viewer
 */
function initPDFViewer() {
  if (!viewerContainerRef.value || !viewerRef.value) return
  
  console.log('[PDF] 初始化 PDFSinglePageViewer')
  
  // 创建 EventBus
  eventBus.value = new EventBus()
  
  // 创建 LinkService
  pdfLinkService.value = new PDFLinkService({
    eventBus: eventBus.value
  })
  
  // 创建 PDFSinglePageViewer
  pdfViewer.value = new PDFSinglePageViewer({
    container: viewerContainerRef.value,
    viewer: viewerRef.value,
    eventBus: eventBus.value,
    linkService: pdfLinkService.value
  })
  
  pdfLinkService.value.setViewer(pdfViewer.value)
  
  // 添加 Ctrl+滚轮缩放支持
  setupWheelZoom()
  
  console.log('[PDF] PDFSinglePageViewer 初始化完成')
}

/**
 * 设置滚轮缩放
 */
function setupWheelZoom() {
  if (!viewerContainerRef.value || !pdfViewer.value) return
  
  const container = viewerContainerRef.value
  
  const handleWheel = (evt: WheelEvent) => {
    // 检查是否按下 Ctrl 或 Meta 键
    if (evt.ctrlKey || evt.metaKey) {
      evt.preventDefault()
      
      // 计算缩放方向
      const delta = evt.deltaY
      const ticks = delta > 0 ? -1 : 1
      
      // 使用 PDFViewer 的缩放方法
      if (pdfViewer.value) {
        if (ticks > 0) {
          pdfViewer.value.increaseScale()
        } else {
          pdfViewer.value.decreaseScale()
        }
      }
    }
  }
  
  container.addEventListener('wheel', handleWheel, { passive: false })
  
  // 清理函数
  const cleanup = () => {
    container.removeEventListener('wheel', handleWheel)
  }
  
  // 保存清理函数供 onUnmounted 使用
  ;(container as any)._wheelCleanup = cleanup
}

/**
 * 更新 LRU 缓存访问顺序
 */
function updateCacheAccess(pdfPath: string) {
  // 移除旧的访问记录
  const index = cacheAccessOrder.indexOf(pdfPath)
  if (index > -1) {
    cacheAccessOrder.splice(index, 1)
  }
  // 添加到最前面(最近访问)
  cacheAccessOrder.unshift(pdfPath)
}

/**
 * 清理最旧的缓存
 */
function evictOldestCache() {
  if (pdfDocumentCache.size >= MAX_CACHE_SIZE) {
    // 移除最久未访问的
    const oldestPath = cacheAccessOrder.pop()
    if (oldestPath) {
      const doc = pdfDocumentCache.get(oldestPath)
      if (doc) {
        doc.destroy() // 释放资源
        pdfDocumentCache.delete(oldestPath)
        console.log('[PDF Cache] 清理缓存:', oldestPath)
      }
    }
  }
}

/**
 * 从路径加载 PDF
 */
async function loadPDFFromPath(pdfPath: string) {
  try {
    console.log('[PDF] 从路径加载 PDF:', pdfPath)
    renderError.value = null
    
    let pdfDocument: pdfjsLib.PDFDocumentProxy
    
    // 检查缓存
    if (pdfDocumentCache.has(pdfPath)) {
      console.log('[PDF] ✅ 从缓存加载')
      pdfDocument = pdfDocumentCache.get(pdfPath)!
      updateCacheAccess(pdfPath)
    } else {
      console.log('[PDF] 📥 从文件加载')
      
      // 通过 IPC 读取 PDF 文件
      const arrayBuffer = await window.api.pdf.readPDF(pdfPath)
      console.log('[PDF] PDF 数据读取成功:', arrayBuffer.byteLength, 'bytes')
      
      // 加载 PDF 文档
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      pdfDocument = await loadingTask.promise
      
      console.log('[PDF] 文档加载成功,总页数:', pdfDocument.numPages)
      
      // 添加到缓存
      evictOldestCache() // 先清理旧缓存
      pdfDocumentCache.set(pdfPath, pdfDocument)
      updateCacheAccess(pdfPath)
      console.log('[PDF] 💾 已缓存,当前缓存数:', pdfDocumentCache.size)
    }
    
    // 更新总页数
    if (readerState.value) {
      paperReaderStore.setTotalPages(
        readerState.value.paperId,
        pdfDocument.numPages
      )
    }
    
    // 设置文档到 viewer
    if (pdfViewer.value && pdfLinkService.value) {
      pdfLinkService.value.setDocument(pdfDocument)
      pdfViewer.value.setDocument(pdfDocument)
      console.log('[PDF] ✅ 文档已设置到 viewer')
    }
  } catch (error) {
    console.error('[PDF] 从路径加载失败:', error)
    renderError.value = error instanceof Error ? error.message : '加载失败'
  }
}

/**
 * 翻页
 */
function goToPage(delta: number) {
  if (!pdfViewer.value || !readerState.value) return
  
  const newPage = readerState.value.currentPage + delta
  if (newPage < 1 || newPage > (readerState.value.totalPages || 0)) return
  
  pdfViewer.value.currentPageNumber = newPage
  paperReaderStore.setCurrentPage(readerState.value.paperId, newPage)
}

/**
 * 缩放
 */
function zoom(delta: number) {
  if (!pdfViewer.value) return
  
  if (delta > 0) {
    pdfViewer.value.increaseScale()
  } else {
    pdfViewer.value.decreaseScale()
  }
}

onMounted(() => {
  console.log('[SingleFilePage] 组件已挂载')
  initPDFViewer()
})

onUnmounted(() => {
  // 清理滚轮事件监听
  if (viewerContainerRef.value && (viewerContainerRef.value as any)._wheelCleanup) {
    ;(viewerContainerRef.value as any)._wheelCleanup()
  }
  
  // 清理 PDFViewer 资源
  if (pdfViewer.value) {
    pdfViewer.value.cleanup()
  }
  
  // 清理所有缓存的 PDF 文档
  console.log('[PDF Cache] 清理所有缓存,共', pdfDocumentCache.size, '个文档')
  pdfDocumentCache.forEach((doc) => {
    doc.destroy()
  })
  pdfDocumentCache.clear()
  cacheAccessOrder.length = 0
})
</script>

<template>
  <div class="single-file-page">
    <!-- 加载状态 -->
    <div v-if="!readerState" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="empty-text">未找到论文</p>
    </div>

    <!-- PDF 阅读器 -->
    <div v-else class="pdf-reader">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="paper-title">{{ readerState.title }}</span>
        </div>
        <div class="toolbar-center">
          <button class="tool-btn" title="上一页" @click="goToPage(-1)" :disabled="readerState.currentPage <= 1">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="page-info">
            {{ readerState.currentPage }} / {{ readerState.totalPages || '...' }}
          </span>
          <button class="tool-btn" title="下一页" @click="goToPage(1)" :disabled="readerState.currentPage >= (readerState.totalPages || 0)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div class="toolbar-right">
          <button class="tool-btn" title="缩小" @click="zoom(-0.1)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <span class="zoom-level">{{ Math.round(readerState.zoomLevel * 100) }}%</span>
          <button class="tool-btn" title="放大" @click="zoom(0.1)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- PDF 渲染区域 - PDFViewer 容器 -->
      <div ref="viewerContainerRef" class="pdf-container">
        <div v-if="renderError" class="error-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ renderError }}</span>
        </div>
        <!-- PDFViewer 内层容器 -->
        <div ref="viewerRef" class="pdfViewer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.single-file-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  overflow: hidden;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--color-text-muted);
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.5;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}

/* PDF 阅读器 */
.pdf-reader {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
  gap: 24px;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  position: absolute;
  left: 16px;
}

.toolbar-right {
  position: absolute;
  right: 16px;
}

.paper-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.tool-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn:disabled:hover {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.tool-btn svg {
  width: 18px;
  height: 18px;
}

.page-info,
.zoom-level {
  font-size: 13px;
  color: var(--color-text-secondary);
  min-width: 80px;
  text-align: center;
}

/* PDF 容器 - PDFViewer 外层容器 */
.pdf-container {
  flex: 1;
  position: absolute;
  top: 56px; /* toolbar 高度 */
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  background-color: var(--color-bg-secondary);
}

/* PDFViewer 内层容器 */
.pdfViewer {
  /* PDF.js 会自动管理内部样式 */
}

.error-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--color-text-muted);
  z-index: 10;
}

.error-state svg {
  width: 48px;
  height: 48px;
  color: var(--color-error);
}

/* PDF 占位符 */
.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: var(--color-text-muted);
}

.pdf-placeholder svg {
  width: 64px;
  height: 64px;
  opacity: 0.3;
}

.pdf-placeholder p {
  margin: 0;
  font-size: 14px;
}

.pdf-placeholder .hint {
  font-size: 12px;
  opacity: 0.7;
}

/* PDF 画布包装器 */
.pdf-canvas-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* PDF Canvas */
.pdf-canvas {
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
