/**
 * 窗口控制 IPC 处理器
 * 处理渲染进程发来的窗口控制请求
 */
import { ipcMain, BrowserWindow } from 'electron'

/**
 * 注册窗口控制相关的 IPC 处理器
 */
export function registerWindowIpcHandlers(): void {
  // 最小化窗口
  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  // 最大化/还原窗口
  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  // 关闭窗口
  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })

  // 查询窗口是否最大化
  ipcMain.handle('window:isMaximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isMaximized() ?? false
  })
}
