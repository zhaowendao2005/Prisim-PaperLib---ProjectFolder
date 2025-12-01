/**
 * MinerU API
 * 暴露给渲染进程的 MinerU OCR 功能接口
 */
import { ipcRenderer } from 'electron'
import type { MineruApi, MineruTask, SubmitOcrTaskParams } from '@client&electron.share/types/mineru/mineru.type'

export const mineruApi: MineruApi = {
  /** 提交本地 PDF OCR 任务 */
  submitLocalOcrTask: (params: SubmitOcrTaskParams) => 
    ipcRenderer.invoke('mineru:submitLocalOcrTask', params) as Promise<MineruTask>,

  /** 获取所有任务快照 */
  getTasksSnapshot: () => 
    ipcRenderer.invoke('mineru:getTasksSnapshot') as Promise<MineruTask[]>,

  /** 手动下载结果 */
  downloadResult: (localId: string) => 
    ipcRenderer.invoke('mineru:downloadResult', localId) as Promise<void>,

  /** 测试 API 连接 */
  testConnection: () => 
    ipcRenderer.invoke('mineru:testConnection') as Promise<{ success: boolean; message: string }>,

  /** 清除任务缓存 */
  clearTasksCache: () => 
    ipcRenderer.invoke('mineru:clearTasksCache') as Promise<{ success: boolean; count: number }>,

  /** 订阅任务更新事件 */
  onTaskUpdate: (callback: (updates: MineruTask[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, updates: MineruTask[]) => {
      callback(updates)
    }
    ipcRenderer.on('mineru:taskUpdate', handler)
    
    // 返回取消订阅函数
    return () => {
      ipcRenderer.removeListener('mineru:taskUpdate', handler)
    }
  }
}
