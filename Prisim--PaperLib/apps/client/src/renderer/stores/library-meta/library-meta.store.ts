/**
 * Library Meta Store
 * 论文库元数据统一管理层
 * 负责维护 PaperDatabase[] 状态，实时同步，作为其他 Store 的数据源
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaperDatabase, FileChangeEvent } from '@client&electron.share/types'
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

  // 状态
  const databases = ref<PaperDatabase[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const initialized = ref(false)

  // 计算属性
  const databaseCount = computed(() => databases.value.length)
  const totalPaperCount = computed(() => 
    databases.value.reduce((sum, db) => sum + db.paperCount, 0)
  )

  // 获取单个数据库
  function getDatabaseById(id: string): PaperDatabase | undefined {
    return databases.value.find(db => db.id === id)
  }

  // 加载数据库列表
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

  // 创建数据库
  async function createDatabase(name: string, path?: string): Promise<PaperDatabase> {
    loading.value = true
    error.value = null
    try {
      const db = await dataSource.create(name, path)
      databases.value.unshift(db)
      console.log('[LibraryMetaStore] 创建数据库:', db.name)
      return db
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 删除数据库
  async function removeDatabase(id: string, deleteFiles = false): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await dataSource.remove(id, deleteFiles)
      databases.value = databases.value.filter(db => db.id !== id)
      console.log('[LibraryMetaStore] 删除数据库:', id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 更新数据库的论文数量（内部方法）
  function updatePaperCount(databaseId: string, delta: number): void {
    const db = databases.value.find(d => d.id === databaseId)
    if (db) {
      db.paperCount += delta
    }
  }

  // 初始化文件变更订阅
  function initFileChangeSubscription(): void {
    if (!dataSource.subscribeFileChange) {
      return
    }
    
    dataSource.subscribeFileChange((event: FileChangeEvent) => {
      console.log('[LibraryMetaStore] 收到文件变更事件:', event.type, event.databaseId)
      
      switch (event.type) {
        case 'add':
        case 'batch-add':
          if (event.items && event.databaseId) {
            updatePaperCount(event.databaseId, event.items.length)
          }
          break
        case 'remove':
          if (event.items && event.databaseId) {
            updatePaperCount(event.databaseId, -event.items.length)
          }
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
    loading,
    error,
    initialized,
    // Computed
    databaseCount,
    totalPaperCount,
    // Getters
    getDatabaseById,
    // Actions
    fetchDatabases,
    createDatabase,
    removeDatabase,
    updatePaperCount
  }
})
