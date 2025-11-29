/**
 * Paper Mock 数据源实现（Web 调试模式）
 */

import type { PaperDataSource } from './paper.datasource'
import type { Paper, PaperFilter, PaperCreateInput } from '@core/types/paper'

/** 模拟数据 */
const mockPapers: Paper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Vaswani, A.', 'Shazeer, N.', 'Parmar, N.'],
    year: 2017,
    abstract:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
    journal: 'NIPS',
    tags: ['transformer', 'nlp', 'attention'],
    pdfPath: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['He, K.', 'Zhang, X.', 'Ren, S.', 'Sun, J.'],
    year: 2016,
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework...',
    journal: 'CVPR',
    tags: ['resnet', 'cnn', 'computer-vision'],
    pdfPath: null,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers',
    authors: ['Devlin, J.', 'Chang, M.', 'Lee, K.', 'Toutanova, K.'],
    year: 2019,
    abstract:
      'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations...',
    journal: 'NAACL',
    tags: ['bert', 'nlp', 'pre-training'],
    pdfPath: null,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: '4',
    title: 'Graph Attention Networks',
    authors: ['Veličković, P.', 'Cucurull, G.', 'Casanova, A.'],
    year: 2018,
    abstract:
      'We present graph attention networks (GATs), novel neural network architectures that operate on graph-structured data...',
    journal: 'ICLR',
    tags: ['gat', 'graph', 'attention'],
    pdfPath: null,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  }
]

export class PaperMockDataSource implements PaperDataSource {
  private papers = [...mockPapers]

  async getList(filter?: PaperFilter): Promise<Paper[]> {
    await this.delay(200)

    let result = [...this.papers]
    if (filter?.tag) {
      result = result.filter((p) => p.tags.includes(filter.tag!))
    }
    if (filter?.year) {
      result = result.filter((p) => p.year === filter.year)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.authors.some((a) => a.toLowerCase().includes(q))
      )
    }
    return result
  }

  async getById(id: string): Promise<Paper | null> {
    await this.delay(100)
    return this.papers.find((p) => p.id === id) ?? null
  }

  async create(input: PaperCreateInput): Promise<Paper> {
    await this.delay(300)
    const paper: Paper = {
      id: String(Date.now()),
      ...input,
      pdfPath: input.pdfPath ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.papers.push(paper)
    return paper
  }

  async update(id: string, input: Partial<PaperCreateInput>): Promise<Paper> {
    await this.delay(200)
    const index = this.papers.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Paper not found')

    this.papers[index] = {
      ...this.papers[index],
      ...input,
      updatedAt: new Date()
    }
    return this.papers[index]
  }

  async delete(id: string): Promise<void> {
    await this.delay(200)
    const index = this.papers.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.papers.splice(index, 1)
    }
  }

  async search(query: string): Promise<Paper[]> {
    await this.delay(300)
    const q = query.toLowerCase()
    return this.papers.filter(
      (p) => p.title.toLowerCase().includes(q) || p.authors.some((a) => a.toLowerCase().includes(q))
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
