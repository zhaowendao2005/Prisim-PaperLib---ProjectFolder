/**
 * Library Meta Store
 * 论文库元数据统一管理层
 * 负责维护 PaperDatabase[] 和 PaperMeta[] 状态，实时同步
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaperDatabase, PaperMeta, FileChangeEvent } from '@client&electron.share/types'
import type { LibraryMetaDataSource } from './library-meta.datasource'
import { LibraryMetaMockDataSource } from './library-meta.mock'
import { LibraryMetaElectronDataSource } from './library-meta.electron'
import { isElectron, forceMock } from '@/core/utils/env'

/** 创建数据源实例 */
function createDataSource(): LibraryMetaDataSource {
  if (forceMock() || !isElectron()) {
    console.log('[LibraryMetaStore] 使用 Mock 数据源')
    return new LibraryMetaMockDataSource()
  }
  console.log('[LibraryMetaStore] 使用 Electron 数据源')
  return new LibraryMetaElectronDataSource()
}

export const useLibraryMetaStore = defineStore('library-meta', () => {
  // 数据源
  const dataSource = createDataSource()

  // ===== 状态 =====
  
  // 数据库列表
  const databases = ref<PaperDatabase[]>([])
  
  // 论文缓存：databaseId -> PaperMeta[]
  const papers = ref<Map<string, PaperMeta[]>>(new Map())
  
  // 当前选中的数据库 ID
  const selectedDatabaseId = ref<string | null>(null)
  
  // 通用状态
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const initialized = ref(false)

  // ===== 计算属性 =====
  
  const databaseCount = computed(() => databases.value.length)
  
  const totalPaperCount = computed(() => 
    databases.value.reduce((sum, db) => sum + db.paperCount, 0)
  )
  
  // 当前选中的数据库
  const selectedDatabase = computed<PaperDatabase | null>(() => {
    if (!selectedDatabaseId.value) return null
    return databases.value.find(db => db.id === selectedDatabaseId.value) || null
  })
  
  // 当前选中数据库的论文列表
  const activePapers = computed<PaperMeta[]>(() => {
    if (!selectedDatabaseId.value) return []
    return papers.value.get(selectedDatabaseId.value) || []
  })
  
  // 所有论文（扁平列表）
  const allPapers = computed<PaperMeta[]>(() => {
    const result: PaperMeta[] = []
    papers.value.forEach(list => result.push(...list))
    return result
  })

  // ===== 数据库操作 =====

  function getDatabaseById(id: string): PaperDatabase | undefined {
    return databases.value.find(db => db.id === id)
  }

  async function fetchDatabases(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      databases.value = await dataSource.getList()
      initialized.value = true
      console.log('[LibraryMetaStore] 加载完成，数据库数量:', databases.value.length)
    } catch (e) {
      error.value = e as Error
      console.error('[LibraryMetaStore] 加载失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function createDatabase(name: string, path?: string): Promise<PaperDatabase> {
    loading.value = true
    error.value = null
    try {
      const db = await dataSource.create(name, path)
      databases.value.unshift(db)
      papers.value.set(db.id, [])
      console.log('[LibraryMetaStore] 创建数据库:', db.name)
      return db
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeDatabase(id: string, deleteFiles = false): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await dataSource.remove(id, deleteFiles)
      databases.value = databases.value.filter(db => db.id !== id)
      papers.value.delete(id)
      if (selectedDatabaseId.value === id) {
        selectedDatabaseId.value = null
      }
      console.log('[LibraryMetaStore] 删除数据库:', id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // ===== 论文操作 =====

  /** 加载指定数据库的论文 */
  async function loadPapers(databaseId: string): Promise<void> {
    try {
      const list = await dataSource.getPapers(databaseId)
      papers.value.set(databaseId, list)
      console.log(`[LibraryMetaStore] 加载论文: ${databaseId}, 数量: ${list.length}`)
    } catch (e) {
      console.error('[LibraryMetaStore] 加载论文失败:', e)
      throw e
    }
  }

  /** 加载所有数据库的论文 */
  async function loadAllPapers(): Promise<void> {
    const promises = databases.value.map(db => loadPapers(db.id))
    await Promise.all(promises)
  }

  /** 获取指定数据库的论文列表 */
  function getPapersForDatabase(databaseId: string): PaperMeta[] {
    return papers.value.get(databaseId) || []
  }

  /** 根据 ID 获取单篇论文 */
  function getPaper(paperId: string): PaperMeta | null {
    for (const list of papers.value.values()) {
      const paper = list.find(p => p.id === paperId)
      if (paper) return paper
    }
    return null
  }

  /** 根据 ID 获取论文及其所属数据库 ID */
  function getPaperWithDatabase(paperId: string): { paper: PaperMeta; databaseId: string } | null {
    for (const [databaseId, list] of papers.value.entries()) {
      const paper = list.find(p => p.id === paperId)
      if (paper) return { paper, databaseId }
    }
    return null
  }

  /** 导入论文 */
  async function importPapers(databaseId: string, filePaths: string[]): Promise<PaperMeta[]> {
    try {
      const imported = await dataSource.importPapers(databaseId, filePaths)
      // 本地状态会通过 FileChangeEvent 更新，这里不需要手动更新
      console.log(`[LibraryMetaStore] 导入论文: ${imported.length} 篇`)
      return imported
    } catch (e) {
      console.error('[LibraryMetaStore] 导入论文失败:', e)
      throw e
    }
  }

  /** 更新论文元数据 */
  async function updatePaperMeta(databaseId: string, paperId: string, updates: Partial<PaperMeta>): Promise<void> {
    try {
      await dataSource.updatePaperMeta(databaseId, paperId, updates)
      // 本地状态会通过 FileChangeEvent 更新
      console.log(`[LibraryMetaStore] 更新论文元数据: ${paperId}`)
    } catch (e) {
      console.error('[LibraryMetaStore] 更新论文元数据失败:', e)
      throw e
    }
  }

  // ===== UI 状态操作 =====

  function selectDatabase(id: string | null): void {
    selectedDatabaseId.value = id
  }

  function clearDatabaseSelection(): void {
    selectedDatabaseId.value = null
  }

  // ===== 内部方法 =====

  function updatePaperCount(databaseId: string, delta: number): void {
    const db = databases.value.find(d => d.id === databaseId)
    if (db) {
      db.paperCount += delta
    }
  }

  /** 处理论文添加事件 */
  function handlePapersAdded(databaseId: string, items: PaperMeta[]): void {
    const list = papers.value.get(databaseId)
    if (list) {
      // 避免重复添加
      const existingIds = new Set(list.map(p => p.id))
      const newItems = items.filter(item => !existingIds.has(item.id))
      list.push(...newItems)
    } else {
      papers.value.set(databaseId, [...items])
    }
    updatePaperCount(databaseId, items.length)
  }

  /** 处理论文更新事件 */
  function handlePapersUpdated(databaseId: string, items: PaperMeta[]): void {
    const list = papers.value.get(databaseId)
    if (!list) return
    
    for (const updated of items) {
      const index = list.findIndex(p => p.id === updated.id)
      if (index !== -1) {
        list[index] = updated
      }
    }
  }

  /** 处理论文删除事件 */
  function handlePapersRemoved(databaseId: string, items: PaperMeta[]): void {
    const list = papers.value.get(databaseId)
    if (!list) return
    
    const removedIds = new Set(items.map(p => p.id))
    const filtered = list.filter(p => !removedIds.has(p.id))
    papers.value.set(databaseId, filtered)
    updatePaperCount(databaseId, -items.length)
  }

  // 初始化文件变更订阅
  function initFileChangeSubscription(): void {
    if (!dataSource.subscribeFileChange) {
      return
    }
    
    dataSource.subscribeFileChange((event: FileChangeEvent) => {
      console.log('[LibraryMetaStore] 收到文件变更事件:', event.type, event.databaseId)
      
      if (!event.databaseId || !event.items) return
      
      switch (event.type) {
        case 'add':
        case 'batch-add':
          handlePapersAdded(event.databaseId, event.items)
          break
        case 'update':
          handlePapersUpdated(event.databaseId, event.items)
          break
        case 'remove':
          handlePapersRemoved(event.databaseId, event.items)
          break
      }
    })
  }

  // 初始化
  function initialize(): void {
    if (initialized.value) return
    
    fetchDatabases()
    initFileChangeSubscription()
  }

  // 自动初始化
  initialize()

  return {
    // State
    databases,
    papers,
    selectedDatabaseId,
    loading,
    error,
    initialized,
    
    // Computed
    databaseCount,
    totalPaperCount,
    selectedDatabase,
    activePapers,
    allPapers,
    
    // Database Actions
    getDatabaseById,
    fetchDatabases,
    createDatabase,
    removeDatabase,
    
    // Paper Actions
    loadPapers,
    loadAllPapers,
    getPapersForDatabase,
    getPaper,
    getPaperWithDatabase,
    importPapers,
    updatePaperMeta,
    
    // UI Actions
    selectDatabase,
    clearDatabaseSelection
  }
})
