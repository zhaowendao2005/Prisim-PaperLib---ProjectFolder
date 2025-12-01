/**
 * MinerU Task Store
 * MinerU OCR 任务统一管理层
 * 负责维护任务状态、订阅更新、提供 UI 所需的计算属性
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MineruTask, SubmitOcrTaskParams } from '@client&electron.share/types'
import type { IMineruTaskDataSource } from './mineru-task.datasource'
import { MineruTaskElectronDataSource } from './mineru-task.electron'
import { isElectron } from '@/core/utils/env'

/** 创建数据源实例（MinerU 仅支持 Electron 环境） */
function createDataSource(): IMineruTaskDataSource | null {
  if (!isElectron()) {
    console.warn('[MineruTaskStore] MinerU 仅在 Electron 环境可用')
    return null
  }
  console.log('[MineruTaskStore] 使用 Electron 数据源')
  return new MineruTaskElectronDataSource()
}

export const useMineruTaskStore = defineStore('mineru-task', () => {
  // 数据源（可能为 null，表示不可用）
  const dataSource = createDataSource()

  // ===== 状态 =====

  /** 任务表：localId -> MineruTask */
  const tasks = ref<Map<string, MineruTask>>(new Map())

  /** 加载状态 */
  const loading = ref(false)

  /** 错误状态 */
  const error = ref<Error | null>(null)

  /** 是否已初始化 */
  const initialized = ref(false)

  /** 取消订阅函数 */
  let unsubscribe: (() => void) | null = null

  // ===== 计算属性 =====

  /** 所有任务列表（按创建时间倒序） */
  const taskList = computed<MineruTask[]>(() => {
    return Array.from(tasks.value.values()).sort((a, b) => b.createdAt - a.createdAt)
  })

  /** 活跃任务（pending/running/uploading） */
  const activeTasks = computed<MineruTask[]>(() => {
    return taskList.value.filter(
      t => t.state === 'pending' || t.state === 'running' || t.state === 'uploading'
    )
  })

  /** 是否有正在运行的任务 */
  const hasRunningTask = computed<boolean>(() => {
    return activeTasks.value.length > 0
  })

  /** 已完成的任务 */
  const doneTasks = computed<MineruTask[]>(() => {
    return taskList.value.filter(t => t.state === 'done')
  })

  /** 失败的任务 */
  const failedTasks = computed<MineruTask[]>(() => {
    return taskList.value.filter(t => t.state === 'failed')
  })

  /** 全局进度统计 */
  const globalProgress = computed(() => {
    const total = tasks.value.size
    const running = activeTasks.value.length
    const done = doneTasks.value.length
    const failed = failedTasks.value.length
    return { total, running, done, failed }
  })

  /** MinerU 功能是否可用 */
  const isAvailable = computed<boolean>(() => {
    return dataSource !== null
  })

  // ===== Actions =====

  /**
   * 初始化 Store
   * 获取任务快照并订阅更新
   */
  async function initialize(): Promise<void> {
    if (initialized.value || !dataSource) return

    loading.value = true
    error.value = null

    try {
      // 获取任务快照
      const snapshot = await dataSource.getTasksSnapshot()
      for (const task of snapshot) {
        tasks.value.set(task.localId, task)
      }

      // 订阅任务更新
      unsubscribe = dataSource.subscribeTaskUpdate(handleTaskUpdate)

      initialized.value = true
      console.log('[MineruTaskStore] 初始化完成，任务数量:', tasks.value.size)
    } catch (e) {
      error.value = e as Error
      console.error('[MineruTaskStore] 初始化失败:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 提交本地 PDF OCR 任务
   */
  async function submitLocalOcrTask(params: SubmitOcrTaskParams): Promise<MineruTask | null> {
    if (!dataSource) {
      console.error('[MineruTaskStore] MinerU 不可用')
      return null
    }

    loading.value = true
    error.value = null

    try {
      const task = await dataSource.submitLocalOcrTask(params)
      // 任务会通过 taskUpdate 事件更新，这里也可以先乐观更新
      tasks.value.set(task.localId, task)
      console.log('[MineruTaskStore] 提交任务:', task.localId, task.fileName)
      return task
    } catch (e) {
      error.value = e as Error
      console.error('[MineruTaskStore] 提交任务失败:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 手动下载结果
   */
  async function downloadResult(localId: string): Promise<void> {
    if (!dataSource) return

    try {
      await dataSource.downloadResult(localId)
      console.log('[MineruTaskStore] 触发下载:', localId)
    } catch (e) {
      console.error('[MineruTaskStore] 下载失败:', e)
    }
  }

  /**
   * 测试 API 连接
   */
  async function testConnection(): Promise<{ success: boolean; message: string }> {
    if (!dataSource) {
      return { success: false, message: 'MinerU 不可用' }
    }

    try {
      return await dataSource.testConnection()
    } catch (e) {
      const message = e instanceof Error ? e.message : '连接测试失败'
      return { success: false, message }
    }
  }

  /**
   * 根据 localId 获取任务
   */
  function getTask(localId: string): MineruTask | undefined {
    return tasks.value.get(localId)
  }

  /**
   * 根据 paperId 获取相关任务
   */
  function getTasksForPaper(paperId: string): MineruTask[] {
    return taskList.value.filter(t => t.paperId === paperId)
  }

  /**
   * 清除所有任务缓存
   */
  async function clearTasksCache(): Promise<{ success: boolean; count: number }> {
    if (!dataSource) {
      return { success: false, count: 0 }
    }

    try {
      const result = await dataSource.clearTasksCache()
      if (result.success) {
        tasks.value.clear()
      }
      return result
    } catch (e) {
      console.error('[MineruTaskStore] 清除缓存失败:', e)
      return { success: false, count: 0 }
    }
  }

  // ===== 内部方法 =====

  /**
   * 处理任务更新事件
   */
  function handleTaskUpdate(updates: MineruTask[]): void {
    for (const task of updates) {
      tasks.value.set(task.localId, task)
    }
    console.log('[MineruTaskStore] 收到任务更新:', updates.length, '个')
  }

  /**
   * 销毁 Store（取消订阅）
   */
  function dispose(): void {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // 自动初始化（如果在 Electron 环境）
  if (dataSource) {
    initialize()
  }

  return {
    // State
    tasks,
    loading,
    error,
    initialized,

    // Computed
    taskList,
    activeTasks,
    hasRunningTask,
    doneTasks,
    failedTasks,
    globalProgress,
    isAvailable,

    // Actions
    initialize,
    submitLocalOcrTask,
    downloadResult,
    testConnection,
    clearTasksCache,
    getTask,
    getTasksForPaper,
    dispose
  }
})
