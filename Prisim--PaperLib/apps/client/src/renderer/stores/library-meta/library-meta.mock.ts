/**
 * Library Meta Mock 数据源
 * Web 调试模式使用
 */
import type { LibraryMetaDataSource } from './library-meta.datasource'
import type { PaperDatabase, PaperMeta } from '@client&electron.share/types'

/** 模拟数据库列表 */
const mockDatabases: PaperDatabase[] = [
  {
    id: '1',
    name: 'Transformer 研究',
    path: '/mock/path/transformer',
    paperCount: 3,
    createdAt: new Date('2024-01-15').getTime(),
    lastOpenedAt: new Date('2024-01-20').getTime()
  },
  {
    id: '2',
    name: 'CV 论文集',
    path: '/mock/path/cv',
    paperCount: 2,
    createdAt: new Date('2024-01-14').getTime(),
    lastOpenedAt: new Date('2024-01-18').getTime()
  },
  {
    id: '3',
    name: 'NLP 基础',
    path: '/mock/path/nlp',
    paperCount: 2,
    createdAt: new Date('2024-01-13').getTime(),
    lastOpenedAt: new Date('2024-01-17').getTime()
  }
]

/** 模拟论文数据 */
const mockPapers: Record<string, PaperMeta[]> = {
  '1': [
    {
      id: 'p1',
      dirname: 'Attention Is All You Need.p1',
      filename: 'Attention Is All You Need.pdf',
      title: 'Attention Is All You Need',
      authors: ['Vaswani', 'Shazeer', 'Parmar'],
      year: 2017,
      tags: [],
      fileSize: 1024000,
      addedAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      pdfContentType: 'text-based'
    },
    {
      id: 'p2',
      dirname: 'BERT.p2',
      filename: 'BERT.pdf',
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      authors: ['Devlin', 'Chang', 'Lee'],
      year: 2018,
      tags: [],
      fileSize: 2048000,
      addedAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
      pdfContentType: 'text-based'
    },
    {
      id: 'p3',
      dirname: 'GPT-3.p3',
      filename: 'GPT-3.pdf',
      title: 'Language Models are Few-Shot Learners',
      authors: ['Brown', 'Mann', 'Ryder'],
      year: 2020,
      tags: [],
      fileSize: 3072000,
      addedAt: Date.now() - 259200000,
      updatedAt: Date.now() - 259200000,
      pdfContentType: 'text-based'
    }
  ],
  '2': [
    {
      id: 'p4',
      dirname: 'ResNet.p4',
      filename: 'ResNet.pdf',
      title: 'Deep Residual Learning for Image Recognition',
      authors: ['He', 'Zhang', 'Ren'],
      year: 2015,
      tags: [],
      fileSize: 1536000,
      addedAt: Date.now() - 345600000,
      updatedAt: Date.now() - 345600000,
      pdfContentType: 'text-based'
    },
    {
      id: 'p5',
      dirname: 'ViT.p5',
      filename: 'ViT.pdf',
      title: 'An Image is Worth 16x16 Words',
      authors: ['Dosovitskiy', 'Beyer', 'Kolesnikov'],
      year: 2020,
      tags: [],
      fileSize: 2560000,
      addedAt: Date.now() - 432000000,
      updatedAt: Date.now() - 432000000,
      pdfContentType: 'image-based'
    }
  ],
  '3': [
    {
      id: 'p6',
      dirname: 'Word2Vec.p6',
      filename: 'Word2Vec.pdf',
      title: 'Efficient Estimation of Word Representations',
      authors: ['Mikolov', 'Chen', 'Corrado'],
      year: 2013,
      tags: [],
      fileSize: 512000,
      addedAt: Date.now() - 518400000,
      updatedAt: Date.now() - 518400000,
      pdfContentType: 'text-based'
    },
    {
      id: 'p7',
      dirname: 'ELMo.p7',
      filename: 'ELMo.pdf',
      title: 'Deep contextualized word representations',
      authors: ['Peters', 'Neumann', 'Iyyer'],
      year: 2018,
      tags: [],
      fileSize: 1280000,
      addedAt: Date.now() - 604800000,
      updatedAt: Date.now() - 604800000,
      pdfContentType: 'text-based'
    }
  ]
}

export class LibraryMetaMockDataSource implements LibraryMetaDataSource {
  private databases = [...mockDatabases]
  private papers = { ...mockPapers }

  /** 模拟延迟 */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ===== 数据库操作 =====

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
    this.papers[db.id] = []
    return db
  }

  /** 删除数据库 */
  async remove(id: string): Promise<void> {
    await this.delay(200)
    const index = this.databases.findIndex(d => d.id === id)
    if (index !== -1) {
      this.databases.splice(index, 1)
      delete this.papers[id]
    }
  }

  // ===== 论文操作 =====

  /** 获取指定数据库的论文列表 */
  async getPapers(databaseId: string): Promise<PaperMeta[]> {
    await this.delay(150)
    return this.papers[databaseId] || []
  }

  /** 导入论文（Mock 模式仅模拟） */
  async importPapers(databaseId: string, filePaths: string[]): Promise<PaperMeta[]> {
    await this.delay(500)
    const now = Date.now()
    const imported: PaperMeta[] = filePaths.map((path, index) => {
      const filename = path.split(/[\\/]/).pop() || 'unknown.pdf'
      const title = filename.replace('.pdf', '')
      return {
        id: `mock-${now}-${index}`,
        dirname: `${title}.mock-${now}-${index}`,
        filename,
        title,
        authors: [],
        tags: [],
        fileSize: 1024000,
        addedAt: now,
        updatedAt: now,
        pdfContentType: 'text-based' as const
      }
    })
    
    if (!this.papers[databaseId]) {
      this.papers[databaseId] = []
    }
    this.papers[databaseId].push(...imported)
    
    // 更新数据库论文数量
    const db = this.databases.find(d => d.id === databaseId)
    if (db) {
      db.paperCount = this.papers[databaseId].length
    }
    
    return imported
  }

  /** 更新论文元数据 */
  async updatePaperMeta(databaseId: string, paperId: string, updates: Partial<PaperMeta>): Promise<void> {
    await this.delay(200)
    const papers = this.papers[databaseId]
    if (!papers) return
    
    const index = papers.findIndex(p => p.id === paperId)
    if (index !== -1) {
      papers[index] = {
        ...papers[index],
        ...updates,
        updatedAt: Date.now()
      }
    }
  }

  // Mock 模式不支持订阅
}
