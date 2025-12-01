/**
 * Electron 主进程入口
 * 仅负责应用生命周期管理和模块初始化
 */
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createMainWindow } from './services/window/window.service'
import { registerAllIpcHandlers } from './ipc/ipc.register'
import { initializeAppDirectories } from './services/system/system.service'
import { initializeMineruService } from './services/mineru/mineru.service'

/**
 * 安装 Vue DevTools 扩展（仅开发环境）
 */
async function installDevTools(): Promise<void> {
  if (!is.dev) return

  try {
    const { default: installExtension, VUEJS3_DEVTOOLS } = await import(
      'electron-devtools-installer'
    )
    const name = await installExtension(VUEJS3_DEVTOOLS)
    console.log(`[DevTools] ${name} 已安装`)
  } catch (err) {
    console.error('[DevTools] Vue DevTools 安装失败:', err)
  }
}

// 应用就绪后初始化
app.whenReady().then(async () => {
  // 设置 Windows 应用模型 ID
  electronApp.setAppUserModelId('com.electron')

  // 安装开发工具扩展
  await installDevTools()

  // 开发环境快捷键优化
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册所有 IPC 处理器
  registerAllIpcHandlers()

  // 初始化应用数据目录
  initializeAppDirectories()

  // 初始化 MinerU 服务
  initializeMineruService()

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
