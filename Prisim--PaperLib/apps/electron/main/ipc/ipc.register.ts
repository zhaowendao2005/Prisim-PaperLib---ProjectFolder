/**
 * IPC 处理器注册入口
 * 统一注册所有 IPC 处理器
 */
import { ipcMain } from 'electron'
import { registerWindowIpcHandlers } from './window/window.ipc'

/**
 * 注册所有 IPC 处理器
 */
export function registerAllIpcHandlers(): void {
  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 窗口控制
  registerWindowIpcHandlers()
}
