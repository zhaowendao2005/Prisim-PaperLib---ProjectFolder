<script setup lang="ts">
/**
 * SingleFile Right Sidebar Overview Panel - 概览面板
 * 显示 PDF 元数据，包括类型选择器
 */
import { computed, ref } from 'vue'
import type { PdfContentType } from '@client&electron.share/types'
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'
import { useLibraryMetaStore } from '@stores/library-meta/library-meta.store'
import { useMineruTaskStore } from '@stores/mineru-task/mineru-task.store'

const paperReaderStore = usePaperReaderStore()
const libraryMetaStore = useLibraryMetaStore()
const mineruStore = useMineruTaskStore()

// 当前阅读器状态
const readerState = computed(() => paperReaderStore.activeReaderState)

// 当前论文的完整信息（从 LibraryMetaStore 获取）
const currentPaperInfo = computed(() => {
  if (!readerState.value) return null
  return libraryMetaStore.getPaperWithDatabase(readerState.value.paperId)
})

const currentPaper = computed(() => currentPaperInfo.value?.paper || null)

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
  if (!readerState.value || !currentPaperInfo.value) return
  
  try {
    // 通过 Store 更新元数据
    await libraryMetaStore.updatePaperMeta(
      currentPaperInfo.value.databaseId,
      currentPaperInfo.value.paper.id,
      { pdfContentType: newType }
    )
    console.log('[OverviewPanel] PDF 类型已更新:', newType)
  } catch (error) {
    console.error('[OverviewPanel] 更新 PDF 类型失败:', error)
  }
}

// ===== MinerU OCR =====

/** 提交中状态 */
const mineruSubmitting = ref(false)

/** 提交结果消息 */
const mineruMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

/** MinerU 功能是否可用 */
const isMineruAvailable = computed(() => mineruStore.isAvailable)

/** 当前论文是否有进行中的 MinerU 任务 */
const hasPendingMineruTask = computed(() => {
  if (!currentPaper.value) return false
  const tasks = mineruStore.getTasksForPaper(currentPaper.value.id)
  return tasks.some(t => t.state === 'uploading' || t.state === 'pending' || t.state === 'running')
})

/** 提交到 MinerU 进行 OCR */
async function submitToMineru() {
  if (!readerState.value || !currentPaper.value || mineruSubmitting.value) return

  mineruSubmitting.value = true
  mineruMessage.value = null

  try {
    const result = await mineruStore.submitLocalOcrTask({
      paperId: currentPaper.value.id,
      pdfPath: readerState.value.pdfPath,
      fileName: currentPaper.value.filename
    })

    if (result) {
      mineruMessage.value = { type: 'success', text: '已提交，可在进度面板查看' }
      // 3秒后清除消息
      setTimeout(() => { mineruMessage.value = null }, 3000)
    } else {
      mineruMessage.value = { type: 'error', text: '提交失败，请检查 MinerU 配置' }
    }
  } catch (error) {
    console.error('[OverviewPanel] MinerU 提交失败:', error)
    mineruMessage.value = { type: 'error', text: '提交失败' }
  } finally {
    mineruSubmitting.value = false
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

    <!-- MinerU OCR -->
    <section v-if="isMineruAvailable" class="single-pdf-right-sidebar-overview__section">
      <h4 class="single-pdf-right-sidebar-overview__title">智能处理</h4>
      <div class="single-pdf-right-sidebar-overview__mineru">
        <button
          class="single-pdf-right-sidebar-overview__mineru-btn"
          :disabled="mineruSubmitting || hasPendingMineruTask"
          @click="submitToMineru"
        >
          <svg class="single-pdf-right-sidebar-overview__mineru-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 15h6" />
            <path d="M12 18v-6" />
          </svg>
          <span v-if="mineruSubmitting">提交中...</span>
          <span v-else-if="hasPendingMineruTask">处理中</span>
          <span v-else>发送至 MinerU OCR</span>
        </button>
        <p class="single-pdf-right-sidebar-overview__mineru-desc">
          使用 MinerU 解析 PDF 内容，提取文本和结构
        </p>
        <!-- 提交结果消息 -->
        <div 
          v-if="mineruMessage" 
          class="single-pdf-right-sidebar-overview__mineru-msg"
          :class="{ 
            'single-pdf-right-sidebar-overview__mineru-msg--success': mineruMessage.type === 'success',
            'single-pdf-right-sidebar-overview__mineru-msg--error': mineruMessage.type === 'error'
          }"
        >
          {{ mineruMessage.text }}
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

/* MinerU OCR */
.single-pdf-right-sidebar-overview__mineru {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.single-pdf-right-sidebar-overview__mineru-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.single-pdf-right-sidebar-overview__mineru-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.single-pdf-right-sidebar-overview__mineru-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.single-pdf-right-sidebar-overview__mineru-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.single-pdf-right-sidebar-overview__mineru-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.single-pdf-right-sidebar-overview__mineru-msg {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.single-pdf-right-sidebar-overview__mineru-msg--success {
  background: #d1fae5;
  color: #065f46;
}

.single-pdf-right-sidebar-overview__mineru-msg--error {
  background: #fee2e2;
  color: #991b1b;
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
