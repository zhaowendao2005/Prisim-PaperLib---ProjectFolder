/**
 * Library Meta Electron 数据源
 * 通过 IPC 与主进程通信，获取论文库元数据和论文数据
 */
import type { LibraryMetaDataSource } from './library-meta.datasource'
import type { PaperDatabase, PaperMeta, FileChangeEvent } from '@client&electron.share/types'

export class LibraryMetaElectronDataSource implements LibraryMetaDataSource {
  // ===== 数据库操作 =====

  /** 获取所有数据库列表 */
  async getList(): Promise<PaperDatabase[]> {
    return window.api.library.getDatabases()
  }

  /** 创建数据库 */
  async create(name: string, path?: string): Promise<PaperDatabase> {
    return window.api.library.createDatabase(name, path)
  }

  /** 删除数据库 */
  async remove(id: string, deleteFiles = false): Promise<void> {
    await window.api.library.removeDatabase(id, deleteFiles)
  }

  // ===== 论文操作 =====

  /** 获取指定数据库的论文列表 */
  async getPapers(databaseId: string): Promise<PaperMeta[]> {
    return window.api.library.getPapers(databaseId)
  }

  /** 导入论文 */
  async importPapers(databaseId: string, filePaths: string[]): Promise<PaperMeta[]> {
    return window.api.library.importPapers(databaseId, filePaths)
  }

  /** 更新论文元数据 */
  async updatePaperMeta(databaseId: string, paperId: string, updates: Partial<PaperMeta>): Promise<void> {
    await window.api.library.updatePaperMeta(databaseId, paperId, updates)
  }

  // ===== 事件订阅 =====

  /** 订阅文件变更事件 */
  subscribeFileChange(callback: (event: FileChangeEvent) => void): () => void {
    return window.api.library.onFileChange(callback)
  }
}
