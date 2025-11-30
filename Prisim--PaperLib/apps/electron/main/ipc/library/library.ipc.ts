/**
 * Library IPC 处理器
 * 处理论文库相关的 IPC 请求
 */
import { ipcMain, BrowserWindow } from 'electron'
import * as libraryService from '../../services/library/library.service'
import * as watcherService from '../../services/library/watcher.service'
import type { PaperMeta, Tag, FileChangeEvent } from '@client&electron.share/types/library/library.type'

/**
 * 初始化所有数据库的文件监听
 * 独立于数据库创建，作为常态化服务运行
 */
function initializeWatchers(): void {
  const databases = libraryService.getDatabases()
  console.log(`[Library IPC] 初始化文件监听，数据库数量: ${databases.length}`)
  
  for (const db of databases) {
    watcherService.startWatching(db.id, db.name, db.path)
  }
}

/**
 * 刷新监听状态（同步最新的数据库列表）
 */
function refreshWatchers(): void {
  // 先停止所有监听
  watcherService.stopAllWatching()
  // 重新初始化
  initializeWatchers()
}

/**
 * 注册 Library 相关的 IPC 处理器
 */
export function registerLibraryIpcHandlers(): void {
  // ===== 初始化：延迟启动文件监听，等待窗口准备就绪 =====
  // 延迟 2 秒，确保渲染进程已加载并订阅了事件
  setTimeout(() => {
    console.log('[Library IPC] 延迟初始化文件监听...')
    initializeWatchers()
  }, 2000)

  // ===== 数据库管理 =====

  // 获取所有数据库
  ipcMain.handle('library:getDatabases', () => {
    return libraryService.getDatabases()
  })

  // 创建数据库
  ipcMain.handle('library:createDatabase', (_event, name: string, path?: string) => {
    const db = libraryService.createDatabase(name, path)
    // 刷新监听状态（解耦：不直接关联创建操作）
    refreshWatchers()
    return db
  })

  // 打开数据库
  ipcMain.handle('library:openDatabase', (_event, id: string) => {
    return libraryService.openDatabase(id)
  })

  // 关闭数据库
  ipcMain.handle('library:closeDatabase', (_event, id: string) => {
    return libraryService.closeDatabase(id)
  })

  // 删除数据库
  ipcMain.handle('library:removeDatabase', (_event, id: string, deleteFiles?: boolean) => {
    const result = libraryService.removeDatabase(id, deleteFiles)
    // 刷新监听状态
    refreshWatchers()
    return result
  })

  // ===== 论文操作 =====

  // 获取论文列表
  ipcMain.handle('library:getPapers', (_event, databaseId: string) => {
    return libraryService.getPapers(databaseId)
  })

  // 获取单篇论文
  ipcMain.handle('library:getPaper', (_event, databaseId: string, paperId: string) => {
    return libraryService.getPaper(databaseId, paperId)
  })

  // 导入论文
  ipcMain.handle('library:importPapers', (_event, databaseId: string, filePaths: string[]) => {
    return libraryService.importPapers(databaseId, filePaths)
  })

  // 删除论文
  ipcMain.handle('library:removePaper', (_event, databaseId: string, paperId: string, deleteFile?: boolean) => {
    return libraryService.removePaper(databaseId, paperId, deleteFile)
  })

  // 更新论文元数据
  ipcMain.handle('library:updatePaperMeta', (_event, databaseId: string, paperId: string, updates: Partial<PaperMeta>) => {
    return libraryService.updatePaperMeta(databaseId, paperId, updates)
  })

  // ===== 标签操作 =====

  // 获取标签列表
  ipcMain.handle('library:getTags', (_event, databaseId: string) => {
    return libraryService.getTags(databaseId)
  })

  // 创建标签
  ipcMain.handle('library:createTag', (_event, databaseId: string, name: string, color?: string) => {
    return libraryService.createTag(databaseId, name, color)
  })

  // 更新标签
  ipcMain.handle('library:updateTag', (_event, databaseId: string, tagId: string, updates: Partial<Tag>) => {
    return libraryService.updateTag(databaseId, tagId, updates)
  })

  // 删除标签
  ipcMain.handle('library:deleteTag', (_event, databaseId: string, tagId: string) => {
    return libraryService.deleteTag(databaseId, tagId)
  })

  // ===== 索引管理 =====

  // 重建索引
  ipcMain.handle('library:rebuildIndex', (_event, databaseId: string) => {
    return libraryService.rebuildIndex(databaseId)
  })

  // ===== 文件变更事件 =====

  // 注册文件变更监听，将事件推送到渲染进程
  libraryService.addFileChangeListener((event: FileChangeEvent) => {
    // 向所有窗口广播文件变更事件
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('library:fileChange', event)
      }
    }
  })

  // ===== 导入确认 =====

  // 处理用户确认导入结果
  ipcMain.handle('library:handleConfirmImport', (_event, confirmed: boolean) => {
    watcherService.handleConfirmResult(confirmed)
  })

  // 确认后执行导入
  ipcMain.handle('library:executeImport', async (_event, databaseId: string, filePaths: string[]) => {
    return libraryService.importPapers(databaseId, filePaths)
  })
}
