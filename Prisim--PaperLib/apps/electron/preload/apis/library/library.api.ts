/**
 * Library API
 * 暴露给渲染进程的论文库功能接口
 */
import { ipcRenderer } from 'electron'
import type {
  PaperDatabase,
  PaperMeta,
  Tag,
  FileChangeEvent,
  ImportConfirmRequest,
  ImportConfirmResult,
  LibraryApi
} from '@client&electron.share/types/library/library.type'

export const libraryApi: LibraryApi = {
  // ===== 数据库管理 =====

  /** 获取所有数据库 */
  getDatabases: () => ipcRenderer.invoke('library:getDatabases') as Promise<PaperDatabase[]>,

  /** 创建数据库 */
  createDatabase: (name: string, path?: string) =>
    ipcRenderer.invoke('library:createDatabase', name, path) as Promise<PaperDatabase>,

  /** 打开数据库 */
  openDatabase: (id: string) => ipcRenderer.invoke('library:openDatabase', id),

  /** 关闭数据库 */
  closeDatabase: (id: string) => ipcRenderer.invoke('library:closeDatabase', id),

  /** 删除数据库 */
  removeDatabase: (id: string, deleteFiles?: boolean) =>
    ipcRenderer.invoke('library:removeDatabase', id, deleteFiles),

  // ===== 论文操作 =====

  /** 获取论文列表 */
  getPapers: (databaseId: string) =>
    ipcRenderer.invoke('library:getPapers', databaseId) as Promise<PaperMeta[]>,

  /** 获取单篇论文 */
  getPaper: (databaseId: string, paperId: string) =>
    ipcRenderer.invoke('library:getPaper', databaseId, paperId) as Promise<PaperMeta | null>,

  /** 导入论文 */
  importPapers: (databaseId: string, filePaths: string[]) =>
    ipcRenderer.invoke('library:importPapers', databaseId, filePaths) as Promise<PaperMeta[]>,

  /** 确认导入论文 */
  confirmImportPapers: (databaseId: string, filePaths: string[], confirm: boolean) =>
    ipcRenderer.invoke('library:confirmImportPapers', databaseId, filePaths, confirm) as Promise<PaperMeta[] | void>,

  /** 删除论文 */
  removePaper: (databaseId: string, paperId: string, deleteFile?: boolean) =>
    ipcRenderer.invoke('library:removePaper', databaseId, paperId, deleteFile),

  /** 更新论文元数据 */
  updatePaperMeta: (databaseId: string, paperId: string, updates: Partial<PaperMeta>) =>
    ipcRenderer.invoke('library:updatePaperMeta', databaseId, paperId, updates),

  // ===== 标签操作 =====

  /** 获取标签列表 */
  getTags: (databaseId: string) =>
    ipcRenderer.invoke('library:getTags', databaseId) as Promise<Tag[]>,

  /** 创建标签 */
  createTag: (databaseId: string, name: string, color?: string) =>
    ipcRenderer.invoke('library:createTag', databaseId, name, color) as Promise<Tag>,

  /** 更新标签 */
  updateTag: (databaseId: string, tagId: string, updates: Partial<Tag>) =>
    ipcRenderer.invoke('library:updateTag', databaseId, tagId, updates),

  /** 删除标签 */
  deleteTag: (databaseId: string, tagId: string) =>
    ipcRenderer.invoke('library:deleteTag', databaseId, tagId),

  // ===== 索引管理 =====

  /** 重建索引 */
  rebuildIndex: (databaseId: string) => ipcRenderer.invoke('library:rebuildIndex', databaseId),

  // ===== 事件订阅 =====

  /** 订阅文件变更事件 */
  onFileChange: (callback: (event: FileChangeEvent) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: FileChangeEvent) => {
      callback(data)
    }
    ipcRenderer.on('library:fileChange', handler)
    // 返回取消订阅函数
    return () => {
      ipcRenderer.removeListener('library:fileChange', handler)
    }
  },

  // ===== 导入确认 =====

  /** 订阅导入确认请求 */
  onConfirmImport: (callback: (request: ImportConfirmRequest) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: ImportConfirmRequest) => {
      callback(data)
    }
    ipcRenderer.on('library:confirmImport', handler)
    return () => {
      ipcRenderer.removeListener('library:confirmImport', handler)
    }
  },

  /** 订阅导入确认结果 */
  onConfirmImportResult: (callback: (result: ImportConfirmResult) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: ImportConfirmResult) => {
      callback(data)
    }
    ipcRenderer.on('library:confirmImportResult', handler)
    return () => {
      ipcRenderer.removeListener('library:confirmImportResult', handler)
    }
  },

  /** 处理用户确认结果 */
  handleConfirmImport: (confirmed: boolean) =>
    ipcRenderer.invoke('library:handleConfirmImport', confirmed),

  /** 执行导入 */
  executeImport: (databaseId: string, filePaths: string[]) =>
    ipcRenderer.invoke('library:executeImport', databaseId, filePaths) as Promise<PaperMeta[]>
}
