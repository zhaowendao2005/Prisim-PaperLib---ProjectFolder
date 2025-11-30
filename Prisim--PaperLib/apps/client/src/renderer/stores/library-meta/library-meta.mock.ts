/**
 * Library Meta Mock 数据源
 * Web 调试模式使用
 */
import type { LibraryMetaDataSource } from './library-meta.datasource'
import type { PaperDatabase } from '@client&electron.share/types'

/** 模拟数据库列表 */
const mockDatabases: PaperDatabase[] = [
  {
    id: '1',
    name: 'Transformer 研究',
    path: '/mock/path/transformer',
    paperCount: 12,
    createdAt: new Date('2024-01-15').getTime(),
    lastOpenedAt: new Date('2024-01-20').getTime()
  },
  {
    id: '2',
    name: 'CV 论文集',
    path: '/mock/path/cv',
    paperCount: 8,
    createdAt: new Date('2024-01-14').getTime(),
    lastOpenedAt: new Date('2024-01-18').getTime()
  },
  {
    id: '3',
    name: 'NLP 基础',
    path: '/mock/path/nlp',
    paperCount: 25,
    createdAt: new Date('2024-01-13').getTime(),
    lastOpenedAt: new Date('2024-01-17').getTime()
  },
  {
    id: '4',
    name: '强化学习',
    path: '/mock/path/rl',
    paperCount: 6,
    createdAt: new Date('2024-01-12').getTime(),
    lastOpenedAt: new Date('2024-01-16').getTime()
  },
  {
    id: '5',
    name: '图神经网络',
    path: '/mock/path/gnn',
    paperCount: 15,
    createdAt: new Date('2024-01-11').getTime(),
    lastOpenedAt: new Date('2024-01-15').getTime()
  }
]

export class LibraryMetaMockDataSource implements LibraryMetaDataSource {
  private databases = [...mockDatabases]

  /** 模拟延迟 */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /** 获取所有数据库列表 */
  async getList(): Promise<PaperDatabase[]> {
    await this.delay(200)
    return [...this.databases]
  }

  /** 创建数据库 */
  async create(name: string, path?: string): Promise<PaperDatabase> {
    await this.delay(300)
    const now = Date.now()
    const db: PaperDatabase = {
      id: String(now),
      name,
      path: path || `/mock/path/${name.toLowerCase().replace(/\s+/g, '-')}`,
      paperCount: 0,
      createdAt: now,
      lastOpenedAt: now
    }
    this.databases.unshift(db)
    return db
  }

  /** 删除数据库 */
  async remove(id: string): Promise<void> {
    await this.delay(200)
    const index = this.databases.findIndex(d => d.id === id)
    if (index !== -1) {
      this.databases.splice(index, 1)
    }
  }

  // Mock 模式不支持订阅
}
