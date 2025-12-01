/**
 * Home DataCard 数据源接口
 * 首页数据卡片（项目/数据库/论文库）及论文
 */
import type { PdfContentType } from '@client&electron.share/types'

/** 论文实体 */
export interface Paper {
  id: string
  title: string
  authors: string[]
  year: number
  abstract: string
  tags: string[]
  projectId: string
  pdfPath: string | null
  isRead: boolean
  isAnnotated: boolean
  createdAt: Date
  updatedAt: Date
  /** PDF 内容类型 */
  pdfContentType?: PdfContentType
}

/** 数据卡片实体 */
export interface DataCard {
  id: string
  name: string
  description: string
  paperCount: number
  tags: string[]
  coverColor: string
  createdAt: Date
  updatedAt: Date
  stats: {
    totalPapers: number
    readPapers: number
    annotatedPapers: number
    lastOpenedAt: Date | null
  }
}

/** 过滤条件 */
export interface DataCardFilter {
  tag?: string
  sortBy?: 'name' | 'updatedAt' | 'createdAt' | 'paperCount'
  sortOrder?: 'asc' | 'desc'
}

/** 创建输入 */
export interface DataCardCreateInput {
  name: string
  description?: string
  tags?: string[]
  coverColor?: string
}

/**
 * DataCard 数据源接口
 */
export interface DataCardDataSource {
  /** 获取列表 */
  getList(filter?: DataCardFilter): Promise<DataCard[]>
  
  /** 获取单个 */
  getById(id: string): Promise<DataCard | null>
  
  /** 创建 */
  create(input: DataCardCreateInput): Promise<DataCard>
  
  /** 更新 */
  update(id: string, input: Partial<DataCardCreateInput>): Promise<DataCard>
  
  /** 删除 */
  delete(id: string): Promise<void>
  
  /** 搜索 */
  search(query: string): Promise<DataCard[]>

  /** 获取所有论文 */
  getAllPapers(): Promise<Paper[]>

  /** 获取指定项目的论文 */
  getPapersByProject(projectId: string): Promise<Paper[]>

  /** 获取单篇论文 */
  getPaperById(id: string): Promise<Paper | null>

  /** 导入论文到指定数据库 */
  importPapers?(databaseId: string, filePaths: string[]): Promise<Paper[]>
}
