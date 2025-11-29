/**
 * 窗口控制 API
 * 暴露给渲染进程的窗口操作接口
 */
import { ipcRenderer } from 'electron'

export const windowApi = {
  /** 最小化窗口 */
  minimize: () => ipcRenderer.send('window:minimize'),

  /** 最大化/还原窗口 */
  maximize: () => ipcRenderer.send('window:maximize'),

  /** 关闭窗口 */
  close: () => ipcRenderer.send('window:close'),

  /** 查询窗口是否最大化 */
  isMaximized: () => ipcRenderer.invoke('window:isMaximized') as Promise<boolean>
}
