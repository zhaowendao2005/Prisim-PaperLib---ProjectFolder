/**
 * Electron 主进程入口
 * 仅负责应用生命周期管理和模块初始化
 */
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './services/window/window.service'
import { registerAllIpcHandlers } from './ipc/ipc.register'

// 应用就绪后初始化
app.whenReady().then(() => {
  // 设置 Windows 应用模型 ID
  electronApp.setAppUserModelId('com.electron')

  // 开发环境快捷键优化
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册所有 IPC 处理器
  registerAllIpcHandlers()

  // 创建主窗口
  createMainWindow()

  // macOS: 点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
