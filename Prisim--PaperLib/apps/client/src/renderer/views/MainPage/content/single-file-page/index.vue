<script setup lang="ts">
/**
 * Single File Page - PDF 阅读器页面
 */
import { ref, computed, watch, onMounted, nextTick, shallowRef } from 'vue'
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'
import * as pdfjsLib from 'pdfjs-dist'

// 配置 PDF.js worker - 使用本地安装的 worker
// Vite 会自动处理 node_modules 中的文件
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href
console.log('[PDF] Worker 配置:', pdfjsLib.GlobalWorkerOptions.workerSrc)

const paperReaderStore = usePaperReaderStore()

// 当前激活的阅读器状态
const readerState = computed(() => paperReaderStore.activeReaderState)

// PDF 相关状态
const canvasRef = ref<HTMLCanvasElement | null>(null)
// 使用 shallowRef 避免深度响应式破坏 PDF.js 内部私有字段
const pdfDocument = shallowRef<pdfjsLib.PDFDocumentProxy | null>(null)
const renderError = ref<string | null>(null)
const loadedPaperId = ref<string | null>(null)  // 记录已加载的 paperId

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
 * 从路径加载 PDF
 */
async function loadPDFFromPath(pdfPath: string) {
  try {
    console.log('[PDF] 从路径加载 PDF:', pdfPath)
    renderError.value = null
    
    // 通过 IPC 读取 PDF 文件
    const arrayBuffer = await window.api.pdf.readPDF(pdfPath)
    console.log('[PDF] PDF 数据读取成功:', arrayBuffer.byteLength, 'bytes')
    
    await loadPDF(arrayBuffer)
  } catch (error) {
    console.error('[PDF] 从路径加载失败:', error)
    renderError.value = error instanceof Error ? error.message : '加载失败'
  }
}

/**
 * 加载 PDF 文档
 */
async function loadPDF(arrayBuffer: ArrayBuffer) {
  try {
    console.log('[PDF] 开始加载 PDF, arrayBuffer 大小:', arrayBuffer.byteLength)
    renderError.value = null
    
    // 加载 PDF 文档
    console.log('[PDF] 调用 pdfjsLib.getDocument...')
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    
    console.log('[PDF] 等待 loadingTask.promise...')
    pdfDocument.value = await loadingTask.promise
    
    console.log('[PDF] 文档加载成功,总页数:', pdfDocument.value.numPages)
    
    // 更新总页数
    if (readerState.value) {
      paperReaderStore.setTotalPages(
        readerState.value.paperId,
        pdfDocument.value.numPages
      )
    }
    
    // 等待 canvas 准备好 - 需要多次 nextTick 确保 DOM 更新
    await nextTick()
    await nextTick()
    console.log('[PDF] canvas 是否存在:', !!canvasRef.value)
    
    if (!canvasRef.value) {
      console.warn('[PDF] Canvas 仍未准备好,延迟渲染')
      // 使用 setTimeout 确保 DOM 完全更新
      setTimeout(() => renderPage(1), 100)
    } else {
      // 渲染第一页
      await renderPage(1)
    }
  } catch (error) {
    console.error('[PDF] 加载失败:', error)
    renderError.value = error instanceof Error ? error.message : '加载失败'
  }
}

/**
 * 渲染指定页面
 */
async function renderPage(pageNumber: number) {
  console.log('[PDF] renderPage 调用:', {
    pageNumber,
    hasPdfDocument: !!pdfDocument.value,
    hasCanvas: !!canvasRef.value,
    hasReaderState: !!readerState.value
  })
  
  if (!pdfDocument.value || !canvasRef.value || !readerState.value) {
    console.warn('[PDF] renderPage 条件不满足,跳过渲染')
    return
  }
  
  try {
    console.log('[PDF] 获取第', pageNumber, '页...')
    // 获取页面 - 使用原始对象而不是响应式包装
    const pdf = pdfDocument.value
    const page = await pdf.getPage(pageNumber)
    console.log('[PDF] 页面获取成功')
    
    // 计算缩放后的视口
    const viewport = page.getViewport({ scale: readerState.value.zoomLevel })
    console.log('[PDF] 视口尺寸:', viewport.width, 'x', viewport.height)
    
    // 设置 canvas 尺寸
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')
    if (!context) {
      console.error('[PDF] 无法获取 canvas context')
      return
    }
    
    canvas.width = viewport.width
    canvas.height = viewport.height
    console.log('[PDF] Canvas 尺寸已设置:', canvas.width, 'x', canvas.height)
    
    // 渲染页面
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    
    console.log('[PDF] 开始渲染到 canvas...')
    await page.render(renderContext).promise
    
    console.log('[PDF] ✅ 页面渲染成功:', pageNumber)
  } catch (error) {
    console.error('[PDF] ❌ 渲染页面失败:', error)
    renderError.value = error instanceof Error ? error.message : '渲染失败'
  }
}

/**
 * 翻页
 */
async function goToPage(delta: number) {
  if (!readerState.value || !pdfDocument.value) return
  
  const newPage = readerState.value.currentPage + delta
  if (newPage < 1 || newPage > pdfDocument.value.numPages) return
  
  paperReaderStore.setCurrentPage(readerState.value.paperId, newPage)
  await renderPage(newPage)
}

/**
 * 缩放
 */
async function zoom(delta: number) {
  if (!readerState.value) return
  
  const newZoom = Math.max(0.5, Math.min(3.0, readerState.value.zoomLevel + delta))
  paperReaderStore.setZoomLevel(readerState.value.paperId, newZoom)
  await renderPage(readerState.value.currentPage)
}

onMounted(() => {
  console.log('[SingleFilePage] 组件已挂载')
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

      <!-- PDF 渲染区域 -->
      <div class="pdf-container">
        <div v-if="readerState.isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="renderError" class="error-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ renderError }}</span>
        </div>
        <div v-else class="pdf-canvas-wrapper">
          <!-- PDF Canvas -->
          <canvas ref="canvasRef" class="pdf-canvas"></canvas>
        </div>
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* PDF 容器 */
.pdf-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  background-color: var(--color-bg-secondary);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-muted);
}

.error-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
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
