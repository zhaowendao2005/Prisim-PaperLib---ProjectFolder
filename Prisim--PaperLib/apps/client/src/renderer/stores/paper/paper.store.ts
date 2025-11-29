/**
 * Paper Pinia Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Paper, PaperFilter } from '@core/types/paper'
import type { PaperDataSource } from './paper.datasource'
import { PaperMockDataSource } from './paper.mock'
import { PaperElectronDataSource } from './paper.electron'
import { isElectron, forceMock } from '@core/utils/env'

/** 创建数据源实例 */
function createDataSource(): PaperDataSource {
  if (forceMock() || !isElectron()) {
    console.log('[PaperStore] 使用 Mock 数据源')
    return new PaperMockDataSource()
  }
  console.log('[PaperStore] 使用 Electron 数据源')
  return new PaperElectronDataSource()
}

export const usePaperStore = defineStore('paper', () => {
  // 数据源
  const dataSource = createDataSource()

  // 状态
  const papers = ref<Paper[]>([])
  const currentPaper = ref<Paper | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Actions
  async function fetchPapers(filter?: PaperFilter): Promise<void> {
    loading.value = true
    error.value = null
    try {
      papers.value = await dataSource.getList(filter)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function fetchPaper(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      currentPaper.value = await dataSource.getById(id)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function searchPapers(query: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      papers.value = await dataSource.search(query)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  function selectPaper(paper: Paper | null): void {
    currentPaper.value = paper
  }

  return {
    // State
    papers,
    currentPaper,
    loading,
    error,
    // Actions
    fetchPapers,
    fetchPaper,
    searchPapers,
    selectPaper
  }
})
