/**
 * MinerU Task 数据源接口
 * MinerU OCR 任务管理的统一接口
 */
import type { MineruTask, SubmitOcrTaskParams } from '@client&electron.share/types'

/**
 * MinerU Task 数据源接口
 */
export interface IMineruTaskDataSource {
  /** 提交本地 PDF OCR 任务 */
  submitLocalOcrTask(params: SubmitOcrTaskParams): Promise<MineruTask>

  /** 获取所有任务快照 */
  getTasksSnapshot(): Promise<MineruTask[]>

  /** 手动下载结果 */
  downloadResult(localId: string): Promise<void>

  /** 测试 API 连接 */
  testConnection(): Promise<{ success: boolean; message: string }>

  /** 订阅任务更新事件，返回取消订阅函数 */
  subscribeTaskUpdate(callback: (updates: MineruTask[]) => void): () => void
}
