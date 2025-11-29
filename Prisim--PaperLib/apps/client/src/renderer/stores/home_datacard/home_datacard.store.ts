/**
 * Home DataCard Store
 * 首页数据卡片及论文状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DataCard, DataCardFilter, Paper } from './home_datacard.datasource'
import type { DataCardDataSource } from './home_datacard.datasource'
import { DataCardMockDataSource } from './home_datacard.mock'

/** 创建数据源实例 */
function createDataSource(): DataCardDataSource {
  // TODO: 后续添加 Electron 数据源判断
  console.log('[DataCardStore] 使用 Mock 数据源')
  return new DataCardMockDataSource()
}

export const useDataCardStore = defineStore('home_datacard', () => {
  // 数据源
  const dataSource = createDataSource()
  
  // 数据卡片状态
  const dataCards = ref<DataCard[]>([])
  const selectedCard = ref<DataCard | null>(null)
  
  // 论文状态
  const papers = ref<Paper[]>([])
  const selectedPaper = ref<Paper | null>(null)
  
  // 通用状态
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 计算属性：按项目分组的论文
  const papersByProject = computed(() => {
    const map = new Map<string, Paper[]>()
    for (const paper of papers.value) {
      const list = map.get(paper.projectId) || []
      list.push(paper)
      map.set(paper.projectId, list)
    }
    return map
  })

  // DataCard Actions
  async function fetchDataCards(filter?: DataCardFilter) {
    loading.value = true
    error.value = null
    try {
      dataCards.value = await dataSource.getList(filter)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function fetchDataCard(id: string) {
    loading.value = true
    error.value = null
    try {
      selectedCard.value = await dataSource.getById(id)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function searchDataCards(query: string) {
    loading.value = true
    error.value = null
    try {
      dataCards.value = await dataSource.search(query)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  function selectCard(card: DataCard | null) {
    selectedCard.value = card
  }

  function clearCardSelection() {
    selectedCard.value = null
  }

  // Paper Actions
  async function fetchAllPapers() {
    loading.value = true
    error.value = null
    try {
      papers.value = await dataSource.getAllPapers()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function fetchPapersByProject(projectId: string) {
    loading.value = true
    error.value = null
    try {
      const projectPapers = await dataSource.getPapersByProject(projectId)
      // 合并到 papers 中（避免重复）
      const existingIds = new Set(papers.value.map(p => p.id))
      for (const paper of projectPapers) {
        if (!existingIds.has(paper.id)) {
          papers.value.push(paper)
        }
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  function selectPaper(paper: Paper | null) {
    selectedPaper.value = paper
  }

  function clearPaperSelection() {
    selectedPaper.value = null
  }

  function getPapersForProject(projectId: string): Paper[] {
    return papersByProject.value.get(projectId) || []
  }

  return {
    // State
    dataCards,
    selectedCard,
    papers,
    selectedPaper,
    loading,
    error,
    // Computed
    papersByProject,
    // DataCard Actions
    fetchDataCards,
    fetchDataCard,
    searchDataCards,
    selectCard,
    clearCardSelection,
    // Paper Actions
    fetchAllPapers,
    fetchPapersByProject,
    selectPaper,
    clearPaperSelection,
    getPapersForProject
  }
})
