/**
 * Library Meta Electron 数据源
 * 通过 IPC 与主进程通信，获取论文库元数据
 */
import type { LibraryMetaDataSource } from './library-meta.datasource'
import type { PaperDatabase, FileChangeEvent } from '@client&electron.share/types'

export class LibraryMetaElectronDataSource implements LibraryMetaDataSource {
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

  /** 订阅文件变更事件 */
  subscribeFileChange(callback: (event: FileChangeEvent) => void): () => void {
    return window.api.library.onFileChange(callback)
  }
}
