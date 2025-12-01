/**
 * Paper Reader Store
 * 论文阅读器状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTabManager } from '@composables/page-navigation'

/** 论文阅读器状态 */
export interface PaperReaderState {
  paperId: string
  libraryId: string
  pdfPath: string
  title: string
  currentPage: number
  totalPages: number
  zoomLevel: number
}

export const usePaperReaderStore = defineStore('paper-reader', () => {
  const tabManager = useTabManager()
  
  // ============================================================
  // 状态
  // ============================================================
  
  /** 所有打开的论文阅读器状态 (key: paperId) */
  const readerStates = ref<Map<string, PaperReaderState>>(new Map())
  
  /** 当前激活的 paperId */
  const activePaperId = computed(() => {
    const activeTab = tabManager.activeTab.value
    if (activeTab?.type === 'single-file-page') {
      return activeTab.metadata?.paperId
    }
    return null
  })
  
  /** 当前激活的阅读器状态 */
  const activeReaderState = computed(() => {
    if (!activePaperId.value) return null
    return readerStates.value.get(activePaperId.value) ?? null
  })
  
  // ============================================================
  // Actions
  // ============================================================
  
  /**
   * 打开论文 PDF
   * @param paperId 论文 ID
   * @param libraryId 论文库 ID
   * @param pdfPath PDF 文件路径
   * @param title 论文标题
   */
  function openPaper(
    paperId: string,
    libraryId: string,
    pdfPath: string,
    title: string
  ) {
    // 1. 检查是否已存在该论文的 Tab
    const existingTab = tabManager.tabs.value.find(
      tab => tab.type === 'single-file-page' && tab.metadata?.paperId === paperId
    )
    
    if (existingTab) {
      // 已存在,直接聚焦
      tabManager.setActiveTab(existingTab.id)
      return existingTab.id
    }
    
    // 2. 创建新 Tab
    const tabId = tabManager.addTab('single-file-page', title)
    
    // 3. 设置 Tab 元数据
    tabManager.updateTab(tabId, {
      metadata: {
        paperId,
        libraryId,
        pdfPath
      }
    })
    
    // 4. 初始化阅读器状态
    readerStates.value.set(paperId, {
      paperId,
      libraryId,
      pdfPath,
      title,
      currentPage: 1,
      totalPages: 0,
      zoomLevel: 1.0
    })
    
    return tabId
  }
  
  /**
   * 关闭论文 Tab
   * @param paperId 论文 ID
   */
  function closePaper(paperId: string) {
    // 1. 查找对应的 Tab
    const tab = tabManager.tabs.value.find(
      t => t.type === 'single-file-page' && t.metadata?.paperId === paperId
    )
    
    if (!tab) return
    
    // 2. 关闭 Tab
    tabManager.closeTab(tab.id)
    
    // 3. 清理阅读器状态
    readerStates.value.delete(paperId)
  }
  
  /**
   * 更新阅读器状态
   * @param paperId 论文 ID
   * @param updates 状态更新
   */
  function updateReaderState(
    paperId: string,
    updates: Partial<PaperReaderState>
  ) {
    const state = readerStates.value.get(paperId)
    if (state) {
      // 创建新对象触发响应式更新
      const newState = { ...state, ...updates }
      readerStates.value.set(paperId, newState)
    }
  }
  
  /**
   * 设置当前页码
   */
  function setCurrentPage(paperId: string, page: number) {
    updateReaderState(paperId, { currentPage: page })
  }
  
  /**
   * 设置缩放级别
   */
  function setZoomLevel(paperId: string, zoom: number) {
    updateReaderState(paperId, { zoomLevel: zoom })
  }
  
  /**
   * 设置总页数
   */
  function setTotalPages(paperId: string, total: number) {
    updateReaderState(paperId, { totalPages: total })
  }
  
  return {
    // State
    readerStates,
    activePaperId,
    activeReaderState,
    
    // Actions
    openPaper,
    closePaper,
    updateReaderState,
    setCurrentPage,
    setZoomLevel,
    setTotalPages
  }
})
