/**
 * IPC 处理器注册入口
 * 统一注册所有 IPC 处理器
 */
import { ipcMain } from 'electron'
import { registerWindowIpcHandlers } from './window/window.ipc'
import { registerSystemIpcHandlers } from './system/system.ipc'
import { registerLibraryIpcHandlers } from './library/library.ipc'
import { registerPdfIpcHandlers } from './pdf/pdf.ipc'

/**
 * 注册所有 IPC 处理器
 */
export function registerAllIpcHandlers(): void {
  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 窗口控制
  registerWindowIpcHandlers()

  // 系统功能
  registerSystemIpcHandlers()

  // 论文库功能
  registerLibraryIpcHandlers()

  // PDF 功能
  registerPdfIpcHandlers()
}
