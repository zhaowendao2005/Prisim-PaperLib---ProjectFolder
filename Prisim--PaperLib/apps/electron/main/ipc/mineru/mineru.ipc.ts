/**
 * MinerU IPC 处理器
 * 处理渲染进程与主进程之间的 MinerU 相关通信
 */
import { ipcMain } from 'electron'
import type { SubmitOcrTaskParams } from '@client&electron.share/types/mineru/mineru.type'
import * as MineruService from '../../services/mineru/mineru.service'

/**
 * 注册 MinerU IPC 处理器
 */
export function registerMineruIpcHandlers(): void {
  // 提交本地 OCR 任务
  ipcMain.handle('mineru:submitLocalOcrTask', async (_event, params: SubmitOcrTaskParams) => {
    return await MineruService.submitLocalOcrTask(params)
  })

  // 获取任务快照
  ipcMain.handle('mineru:getTasksSnapshot', async () => {
    return MineruService.getTasksSnapshot()
  })

  // 手动下载结果
  ipcMain.handle('mineru:downloadResult', async (_event, localId: string) => {
    await MineruService.downloadResult(localId)
  })

  // 测试连接
  ipcMain.handle('mineru:testConnection', async () => {
    return await MineruService.testConnection()
  })

  console.log('[MineruIPC] IPC 处理器注册完成')
}
