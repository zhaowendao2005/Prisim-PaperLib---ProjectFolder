/**
 * MinerU Task Electron 数据源
 * 通过 IPC 与主进程通信，管理 MinerU OCR 任务
 */
import type { IMineruTaskDataSource } from './mineru-task.datasource'
import type { MineruTask, SubmitOcrTaskParams } from '@client&electron.share/types'

export class MineruTaskElectronDataSource implements IMineruTaskDataSource {
  /** 提交本地 PDF OCR 任务 */
  async submitLocalOcrTask(params: SubmitOcrTaskParams): Promise<MineruTask> {
    return window.api.mineru.submitLocalOcrTask(params)
  }

  /** 获取所有任务快照 */
  async getTasksSnapshot(): Promise<MineruTask[]> {
    return window.api.mineru.getTasksSnapshot()
  }

  /** 手动下载结果 */
  async downloadResult(localId: string): Promise<void> {
    await window.api.mineru.downloadResult(localId)
  }

  /** 测试 API 连接 */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    return window.api.mineru.testConnection()
  }

  /** 清除所有任务缓存 */
  async clearTasksCache(): Promise<{ success: boolean; count: number }> {
    return window.api.mineru.clearTasksCache()
  }

  /** 订阅任务更新事件 */
  subscribeTaskUpdate(callback: (updates: MineruTask[]) => void): () => void {
    return window.api.mineru.onTaskUpdate(callback)
  }
}
