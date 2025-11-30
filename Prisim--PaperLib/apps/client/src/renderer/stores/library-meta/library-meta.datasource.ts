/**
 * Library Meta 数据源接口
 * 论文库元数据的统一管理接口
 */
import type { PaperDatabase, FileChangeEvent } from '@client&electron.share/types'

/** 数据库变更事件 */
export interface LibraryChangeEvent {
  type: 'add' | 'remove' | 'update'
  database?: PaperDatabase
  databaseId?: string
}

/**
 * Library Meta 数据源接口
 */
export interface LibraryMetaDataSource {
  /** 获取所有数据库列表 */
  getList(): Promise<PaperDatabase[]>
  
  /** 创建数据库 */
  create(name: string, path?: string): Promise<PaperDatabase>
  
  /** 删除数据库 */
  remove(id: string, deleteFiles?: boolean): Promise<void>
  
  /** 订阅文件变更事件 */
  subscribeFileChange?(callback: (event: FileChangeEvent) => void): () => void
}
