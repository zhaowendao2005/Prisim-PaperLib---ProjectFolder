/**
 * Library Meta 数据源接口
 * 论文库元数据的统一管理接口（含论文操作）
 */
import type { PaperDatabase, PaperMeta, FileChangeEvent } from '@client&electron.share/types'

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
  // ===== 数据库操作 =====
  
  /** 获取所有数据库列表 */
  getList(): Promise<PaperDatabase[]>
  
  /** 创建数据库 */
  create(name: string, path?: string): Promise<PaperDatabase>
  
  /** 删除数据库 */
  remove(id: string, deleteFiles?: boolean): Promise<void>
  
  // ===== 论文操作 =====
  
  /** 获取指定数据库的论文列表 */
  getPapers(databaseId: string): Promise<PaperMeta[]>
  
  /** 导入论文 */
  importPapers(databaseId: string, filePaths: string[]): Promise<PaperMeta[]>
  
  /** 更新论文元数据 */
  updatePaperMeta(databaseId: string, paperId: string, updates: Partial<PaperMeta>): Promise<void>
  
  // ===== 事件订阅 =====
  
  /** 订阅文件变更事件 */
  subscribeFileChange?(callback: (event: FileChangeEvent) => void): () => void
}
