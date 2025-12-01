/**
 * Home DataCard Electron 数据源
 * 从 LibraryMetaStore 获取数据，做兼容转换
 */
import type { DataCardDataSource, DataCard, DataCardFilter, DataCardCreateInput, Paper } from './home_datacard.datasource'
import type { PaperDatabase, PaperMeta } from '@client&electron.share/types'
import { useLibraryMetaStore } from '../library-meta/library-meta.store'

/**
 * 将 PaperDatabase 转换为 DataCard
 */
function mapDatabaseToCard(db: PaperDatabase): DataCard {
  return {
    id: db.id,
    name: db.name,
    description: '',
    paperCount: db.paperCount,
    tags: [],
    coverColor: '#3b82f6',
    createdAt: new Date(db.createdAt),
    updatedAt: new Date(db.lastOpenedAt),
    stats: {
      totalPapers: db.paperCount,
      readPapers: 0,
      annotatedPapers: 0,
      lastOpenedAt: db.lastOpenedAt ? new Date(db.lastOpenedAt) : null
    }
  }
}

/**
 * 将 PaperMeta 转换为 Paper
 */
function mapMetaToPaper(meta: PaperMeta, projectId: string): Paper {
  return {
    id: meta.id,
    title: meta.title,
    authors: meta.authors,
    year: meta.year || 0,
    abstract: '',
    tags: meta.tags,
    projectId,
    pdfPath: meta.pdfPath || null,  // 使用后端填充的完整路径
    isRead: false,
    isAnnotated: false,
    createdAt: new Date(meta.addedAt),
    updatedAt: new Date(meta.updatedAt)
  }
}

export class DataCardElectronDataSource implements DataCardDataSource {
  // ===== DataCard 操作 =====

  async getList(filter?: DataCardFilter): Promise<DataCard[]> {
    const libraryMetaStore = useLibraryMetaStore()
    
    // 等待初始化完成
    if (!libraryMetaStore.initialized) {
      await libraryMetaStore.fetchDatabases()
    }
    
    let cards = libraryMetaStore.databases.map(mapDatabaseToCard)

    // 应用过滤
    if (filter?.tag) {
      cards = cards.filter(c => c.tags.includes(filter.tag!))
    }

    // 应用排序
    if (filter?.sortBy) {
      const order = filter.sortOrder === 'desc' ? -1 : 1
      cards.sort((a, b) => {
        switch (filter.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name) * order
          case 'updatedAt':
            return (a.updatedAt.getTime() - b.updatedAt.getTime()) * order
          case 'createdAt':
            return (a.createdAt.getTime() - b.createdAt.getTime()) * order
          case 'paperCount':
            return (a.paperCount - b.paperCount) * order
          default:
            return 0
        }
      })
    }

    return cards
  }

  async getById(id: string): Promise<DataCard | null> {
    const libraryMetaStore = useLibraryMetaStore()
    const db = libraryMetaStore.getDatabaseById(id)
    return db ? mapDatabaseToCard(db) : null
  }

  async create(input: DataCardCreateInput): Promise<DataCard> {
    const libraryMetaStore = useLibraryMetaStore()
    const db = await libraryMetaStore.createDatabase(input.name)
    return mapDatabaseToCard(db)
  }

  async update(id: string, input: Partial<DataCardCreateInput>): Promise<DataCard> {
    // 目前只支持创建，更新暂不实现
    const card = await this.getById(id)
    if (!card) {
      throw new Error(`DataCard not found: ${id}`)
    }
    return {
      ...card,
      ...input,
      updatedAt: new Date()
    }
  }

  async delete(id: string): Promise<void> {
    const libraryMetaStore = useLibraryMetaStore()
    await libraryMetaStore.removeDatabase(id, false)
  }

  async search(query: string): Promise<DataCard[]> {
    const libraryMetaStore = useLibraryMetaStore()
    const q = query.toLowerCase()
    return libraryMetaStore.databases
      .filter(db => db.name.toLowerCase().includes(q))
      .map(mapDatabaseToCard)
  }

  // ===== Paper 操作 =====

  async getAllPapers(): Promise<Paper[]> {
    const libraryMetaStore = useLibraryMetaStore()
    const allPapers: Paper[] = []

    for (const db of libraryMetaStore.databases) {
      const papers = await window.api.library.getPapers(db.id)
      allPapers.push(...papers.map(p => mapMetaToPaper(p, db.id)))
    }

    return allPapers
  }

  async getPapersByProject(projectId: string): Promise<Paper[]> {
    const papers = await window.api.library.getPapers(projectId)
    return papers.map(p => mapMetaToPaper(p, projectId))
  }

  async getPaperById(id: string): Promise<Paper | null> {
    const libraryMetaStore = useLibraryMetaStore()

    for (const db of libraryMetaStore.databases) {
      const paper = await window.api.library.getPaper(db.id, id)
      if (paper) {
        return mapMetaToPaper(paper, db.id)
      }
    }

    return null
  }

  // ===== 扩展操作 =====

  async importPapers(databaseId: string, filePaths: string[]): Promise<Paper[]> {
    const imported = await window.api.library.importPapers(databaseId, filePaths)
    return imported.map(p => mapMetaToPaper(p, databaseId))
  }

  // 不再需要 subscribeFileChange，由 LibraryMetaStore 统一管理
}
