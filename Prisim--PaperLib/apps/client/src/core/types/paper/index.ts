/**
 * Paper 相关类型定义
 */

export interface Paper {
  id: string
  title: string
  authors: string[]
  year: number
  abstract: string
  journal?: string
  tags: string[]
  pdfPath: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PaperFilter {
  tag?: string
  year?: number
  search?: string
}

export interface PaperCreateInput {
  title: string
  authors: string[]
  year: number
  abstract: string
  journal?: string
  tags: string[]
  pdfPath?: string | null
}
