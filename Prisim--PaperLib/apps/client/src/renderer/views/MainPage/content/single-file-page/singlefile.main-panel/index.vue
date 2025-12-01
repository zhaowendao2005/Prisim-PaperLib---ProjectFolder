<script setup lang="ts">
/**
 * SingleFile Main Panel - PDF 渲染区域
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

const paperReaderStore = usePaperReaderStore()
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
const cacheAccessOrder: string[] = []

// 暴露方法给父组件
defineExpose({
  goToPage,
  zoom
})

// 监听 pdfPath 变化,直接加载 PDF
watch(
  () => readerState.value?.pdfPath,
  async (pdfPath) => {
    const state = readerState.value
    console.log('[MainPanel] pdfPath 变化:', {
      pdfPath,
      paperId: state?.paperId,
      loadedPaperId: loadedPaperId.value
    })
    
    if (pdfPath && state && state.paperId !== loadedPaperId.value) {
      loadedPaperId.value = state.paperId
      await loadPDFFromPath(pdfPath)
    }
  },
  { immediate: true }
)

// 监听 store 的 zoomLevel 变化,同步到 PDFViewer
watch(
  () => readerState.value?.zoomLevel,
  (zoomLevel) => {
    if (pdfViewer.value && zoomLevel !== undefined) {
      if (Math.abs(pdfViewer.value.currentScale - zoomLevel) > 0.001) {
        pdfViewer.value.currentScale = zoomLevel
      }
    }
  }
)

/**
 * 初始化 PDF Viewer
 */
function initPDFViewer() {
  if (!viewerContainerRef.value || !viewerRef.value) return
  
  console.log('[PDF] 初始化 PDFSinglePageViewer')
  
  eventBus.value = new EventBus()
  
  pdfLinkService.value = new PDFLinkService({
    eventBus: eventBus.value
  })
  
  pdfViewer.value = new PDFSinglePageViewer({
    container: viewerContainerRef.value,
    viewer: viewerRef.value,
    eventBus: eventBus.value,
    linkService: pdfLinkService.value
  })
  
  pdfLinkService.value.setViewer(pdfViewer.value)
  setupWheelZoom()
  
  console.log('[PDF] PDFSinglePageViewer 初始化完成')
}

/**
 * 设置滚轮缩放
 */
function setupWheelZoom() {
  if (!viewerContainerRef.value) return
  
  const container = viewerContainerRef.value
  
  const handleWheel = (evt: WheelEvent) => {
    if (evt.ctrlKey || evt.metaKey) {
      evt.preventDefault()
      
      if (!readerState.value) return
      
      const currentScale = readerState.value.zoomLevel
      const zoomFactor = evt.deltaY > 0 ? 0.9 : 1.1
      let newScale = currentScale * zoomFactor
      newScale = Math.max(0.25, Math.min(4, newScale))
      
      paperReaderStore.setZoomLevel(readerState.value.paperId, newScale)
    }
  }
  
  container.addEventListener('wheel', handleWheel, { passive: false })
  ;(container as any)._wheelCleanup = () => {
    container.removeEventListener('wheel', handleWheel)
  }
}

/**
 * 更新 LRU 缓存访问顺序
 */
function updateCacheAccess(pdfPath: string) {
  const index = cacheAccessOrder.indexOf(pdfPath)
  if (index > -1) {
    cacheAccessOrder.splice(index, 1)
  }
  cacheAccessOrder.unshift(pdfPath)
}

/**
 * 清理最旧的缓存
 */
function evictOldestCache() {
  if (pdfDocumentCache.size >= MAX_CACHE_SIZE) {
    const oldestPath = cacheAccessOrder.pop()
    if (oldestPath) {
      const doc = pdfDocumentCache.get(oldestPath)
      if (doc) {
        doc.destroy()
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
    
    if (pdfDocumentCache.has(pdfPath)) {
      console.log('[PDF] ✅ 从缓存加载')
      pdfDocument = pdfDocumentCache.get(pdfPath)!
      updateCacheAccess(pdfPath)
    } else {
      console.log('[PDF] 📥 从文件加载')
      
      const arrayBuffer = await window.api.pdf.readPDF(pdfPath)
      console.log('[PDF] PDF 数据读取成功:', arrayBuffer.byteLength, 'bytes')
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      pdfDocument = await loadingTask.promise
      
      console.log('[PDF] 文档加载成功,总页数:', pdfDocument.numPages)
      
      evictOldestCache()
      pdfDocumentCache.set(pdfPath, pdfDocument)
      updateCacheAccess(pdfPath)
      console.log('[PDF] 💾 已缓存,当前缓存数:', pdfDocumentCache.size)
    }
    
    if (readerState.value) {
      paperReaderStore.setTotalPages(
        readerState.value.paperId,
        pdfDocument.numPages
      )
    }
    
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
  console.log('[MainPanel] 组件已挂载')
  initPDFViewer()
})

onUnmounted(() => {
  if (viewerContainerRef.value && (viewerContainerRef.value as any)._wheelCleanup) {
    ;(viewerContainerRef.value as any)._wheelCleanup()
  }
  
  if (pdfViewer.value) {
    pdfViewer.value.cleanup()
  }
  
  console.log('[PDF Cache] 清理所有缓存,共', pdfDocumentCache.size, '个文档')
  pdfDocumentCache.forEach((doc) => {
    doc.destroy()
  })
  pdfDocumentCache.clear()
  cacheAccessOrder.length = 0
})
</script>

<template>
  <div class="singlefile-main-panel">
    <!-- PDF 渲染区域 -->
    <div ref="viewerContainerRef" class="pdf-container">
      <div v-if="renderError" class="error-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ renderError }}</span>
      </div>
      <div ref="viewerRef" class="pdfViewer"></div>
    </div>
  </div>
</template>

<style scoped>
.singlefile-main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;
}

.pdf-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  background-color: var(--color-bg-secondary);
}

/* 自定义滚动条 - 垂直 */
.pdf-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.pdf-container::-webkit-scrollbar-track {
  background: transparent;
}

.pdf-container::-webkit-scrollbar-thumb {
  background-color: var(--color-text-muted);
  border-radius: 4px;
  opacity: 0.3;
}

.pdf-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-secondary);
}

/* 滚动条角落 */
.pdf-container::-webkit-scrollbar-corner {
  background: transparent;
}

.pdfViewer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
</style>
