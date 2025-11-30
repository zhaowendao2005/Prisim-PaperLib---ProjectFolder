/**
 * Home DataCard Store
 * 首页数据卡片及论文状态管理
 * 数据源从 LibraryMetaStore 获取，负责 UI 展示层的状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DataCard, DataCardFilter, Paper } from './home_datacard.datasource'
import type { DataCardDataSource } from './home_datacard.datasource'
import type { PaperDatabase } from '@client&electron.share/types'
import { DataCardMockDataSource } from './home_datacard.mock'
import { DataCardElectronDataSource } from './home_datacard.electron'
import { useLibraryMetaStore } from '../library-meta/library-meta.store'
import { isElectron, forceMock } from '@/core/utils/env'

/** 创建数据源实例 */
function createDataSource(): DataCardDataSource {
  if (forceMock() || !isElectron()) {
    console.log('[DataCardStore] 使用 Mock 数据源')
    return new DataCardMockDataSource()
  }
  console.log('[DataCardStore] 使用 Electron 数据源')
  return new DataCardElectronDataSource()
}

/** 将 PaperDatabase 转换为 DataCard */
function mapDatabaseToCard(db: PaperDatabase): DataCard {
  return {
    id: db.id,
    name: db.name,
    description: '',
    paperCount: db.paperCount,
    tags: [],
    coverColor: '#3b82f6',
    createdAt: new Date(db.createdAt),
    updatedAt: new Date(db.lastOpenedAt),
    stats: {
      totalPapers: db.paperCount,
      readPapers: 0,
      annotatedPapers: 0,
      lastOpenedAt: db.lastOpenedAt ? new Date(db.lastOpenedAt) : null
    }
  }
}

export const useDataCardStore = defineStore('home_datacard', () => {
  // 数据源（仅用于 Mock 模式和论文操作）
  const dataSource = createDataSource()
  
  // 获取 LibraryMetaStore（Electron 模式下使用）
  const libraryMetaStore = isElectron() && !forceMock() ? useLibraryMetaStore() : null
  
  // 数据卡片：响应式绑定到 LibraryMetaStore
  const dataCards = computed<DataCard[]>(() => {
    if (libraryMetaStore) {
      return libraryMetaStore.databases.map(mapDatabaseToCard)
    }
    return _dataCardsCache.value
  })
  
  // Mock 模式的缓存
  const _dataCardsCache = ref<DataCard[]>([])
  
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
    // Electron 模式：数据已通过 computed 绑定，确保 libraryMetaStore 已初始化
    if (libraryMetaStore) {
      if (!libraryMetaStore.initialized) {
        loading.value = true
        await libraryMetaStore.fetchDatabases()
        loading.value = false
      }
      return
    }
    
    // Mock 模式：从 dataSource 获取
    loading.value = true
    error.value = null
    try {
      _dataCardsCache.value = await dataSource.getList(filter)
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
    // Electron 模式：直接过滤 computed 结果（实际上应该用 computed 做过滤）
    if (libraryMetaStore) {
      // 搜索逻辑已在 computed 外部处理，这里不需要做什么
      return
    }
    
    // Mock 模式
    loading.value = true
    error.value = null
    try {
      _dataCardsCache.value = await dataSource.search(query)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function createCard(input: { name: string; description?: string }) {
    loading.value = true
    error.value = null
    try {
      // Electron 模式：通过 libraryMetaStore 创建，computed 自动更新
      if (libraryMetaStore) {
        const db = await libraryMetaStore.createDatabase(input.name)
        return mapDatabaseToCard(db)
      }
      
      // Mock 模式
      const newCard = await dataSource.create({
        name: input.name,
        description: input.description
      })
      _dataCardsCache.value.unshift(newCard)
      return newCard
    } catch (e) {
      error.value = e as Error
      throw e
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

  // 导入论文
  async function importPapers(databaseId: string, filePaths: string[]) {
    if (!dataSource.importPapers) {
      console.warn('[DataCardStore] importPapers not supported')
      return []
    }
    loading.value = true
    error.value = null
    try {
      const imported = await dataSource.importPapers(databaseId, filePaths)
      // 更新本地状态
      papers.value.push(...imported)
      return imported
    } catch (e) {
      error.value = e as Error
      return []
    } finally {
      loading.value = false
    }
  }

  // 刷新数据卡片（从 LibraryMetaStore 同步）
  async function refreshDataCards() {
    await fetchDataCards()
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
    createCard,
    selectCard,
    clearCardSelection,
    // Paper Actions
    fetchAllPapers,
    fetchPapersByProject,
    selectPaper,
    clearPaperSelection,
    getPapersForProject,
    importPapers,
    refreshDataCards
  }
})
