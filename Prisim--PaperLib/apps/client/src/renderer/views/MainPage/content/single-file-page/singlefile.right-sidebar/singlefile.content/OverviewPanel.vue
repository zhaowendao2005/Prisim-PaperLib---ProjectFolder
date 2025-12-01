<script setup lang="ts">
/**
 * SingleFile Right Sidebar Overview Panel - 概览面板
 * 显示 PDF 元数据，包括类型选择器
 */
import { computed } from 'vue'
import type { PdfContentType } from '@client&electron.share/types'
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'
import { useDataCardStore } from '@stores/home_datacard/home_datacard.store'

const paperReaderStore = usePaperReaderStore()
const dataCardStore = useDataCardStore()

// 当前阅读器状态
const readerState = computed(() => paperReaderStore.activeReaderState)

// 当前论文的完整信息（从 DataCardStore 获取）
const currentPaper = computed(() => {
  if (!readerState.value) return null
  return dataCardStore.papers.find(p => p.id === readerState.value?.paperId) || null
})

// 当前 PDF 类型
const currentPdfType = computed(() => currentPaper.value?.pdfContentType || 'text-based')

// PDF 类型选项
const pdfTypeOptions: Array<{ value: PdfContentType; label: string; description: string }> = [
  { value: 'text-based', label: '文本型', description: '包含可提取文字' },
  { value: 'image-based', label: '图像型', description: '扫描件或纯图片' },
  { value: 'structured', label: '结构型', description: '已解析的富结构数据' }
]

// 更新 PDF 类型
async function updatePdfType(newType: PdfContentType) {
  if (!readerState.value || !currentPaper.value) return
  
  try {
    // 调用后端 API 更新元数据
    await window.api.library.updatePaperMeta(
      currentPaper.value.projectId,
      currentPaper.value.id,
      { pdfContentType: newType }
    )
    console.log('[OverviewPanel] PDF 类型已更新:', newType)
  } catch (error) {
    console.error('[OverviewPanel] 更新 PDF 类型失败:', error)
  }
}
</script>

<template>
  <div class="single-pdf-right-sidebar-overview">
    <!-- PDF 类型选择器 -->
    <section class="single-pdf-right-sidebar-overview__section">
      <h4 class="single-pdf-right-sidebar-overview__title">PDF 类型</h4>
      <div class="single-pdf-right-sidebar-overview__type-selector">
        <button 
          v-for="option in pdfTypeOptions" 
          :key="option.value"
          class="single-pdf-right-sidebar-overview__type-btn"
          :class="{ 'single-pdf-right-sidebar-overview__type-btn--active': currentPdfType === option.value }"
          :title="option.description"
          @click="updatePdfType(option.value)"
        >
          <span class="single-pdf-right-sidebar-overview__type-label">{{ option.label }}</span>
        </button>
      </div>
      <p class="single-pdf-right-sidebar-overview__type-desc">
        {{ pdfTypeOptions.find(o => o.value === currentPdfType)?.description }}
      </p>
    </section>

    <!-- 基本信息 -->
    <section class="single-pdf-right-sidebar-overview__section">
      <h4 class="single-pdf-right-sidebar-overview__title">基本信息</h4>
      <div class="single-pdf-right-sidebar-overview__info-list">
        <div class="single-pdf-right-sidebar-overview__info-item">
          <span class="single-pdf-right-sidebar-overview__info-label">标题</span>
          <span class="single-pdf-right-sidebar-overview__info-value">{{ readerState?.title || '-' }}</span>
        </div>
        <div class="single-pdf-right-sidebar-overview__info-item">
          <span class="single-pdf-right-sidebar-overview__info-label">页数</span>
          <span class="single-pdf-right-sidebar-overview__info-value">{{ readerState?.totalPages || '-' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.single-pdf-right-sidebar-overview {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.single-pdf-right-sidebar-overview__section {
  margin-bottom: 24px;
}

.single-pdf-right-sidebar-overview__section:last-child {
  margin-bottom: 0;
}

.single-pdf-right-sidebar-overview__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

/* PDF 类型选择器 */
.single-pdf-right-sidebar-overview__type-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.single-pdf-right-sidebar-overview__type-btn {
  flex: 1;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.single-pdf-right-sidebar-overview__type-btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-hover);
  border-color: var(--color-border);
}

.single-pdf-right-sidebar-overview__type-btn--active {
  color: var(--color-accent);
  background-color: var(--color-accent-light);
  border-color: var(--color-accent);
}

.single-pdf-right-sidebar-overview__type-btn--active:hover {
  background-color: var(--color-accent-light);
}

.single-pdf-right-sidebar-overview__type-label {
  display: block;
}

.single-pdf-right-sidebar-overview__type-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

/* 信息列表 */
.single-pdf-right-sidebar-overview__info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.single-pdf-right-sidebar-overview__info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.single-pdf-right-sidebar-overview__info-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.single-pdf-right-sidebar-overview__info-value {
  font-size: 13px;
  color: var(--color-text-primary);
  word-break: break-all;
}

/* 自定义滚动条 */
.single-pdf-right-sidebar-overview::-webkit-scrollbar {
  width: 4px;
}

.single-pdf-right-sidebar-overview::-webkit-scrollbar-track {
  background: transparent;
}

.single-pdf-right-sidebar-overview::-webkit-scrollbar-thumb {
  background-color: var(--color-text-muted);
  border-radius: 2px;
  opacity: 0.3;
}
</style>
