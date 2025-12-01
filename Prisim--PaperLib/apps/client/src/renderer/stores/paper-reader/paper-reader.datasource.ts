/**
 * Paper Reader DataSource
 * 负责环境检测并自动选择 Mock 或 Electron 实现
 */
import { isElectron } from '@/core/utils/env'
import { PaperReaderMockDataSource } from './paper-reader.mock'
import { PaperReaderElectronDataSource } from './paper-reader.electron'

/** PDF 数据 */
export interface PDFData {
  arrayBuffer: ArrayBuffer  // PDF 文件的二进制数据
  fileSize: number          // 文件大小(字节)
  fileName: string          // 文件名
}

/** 论文阅读器数据源接口 */
export interface IPaperReaderDataSource {
  /** 加载 PDF 文件 */
  loadPDF(pdfPath: string): Promise<PDFData>
  
  /** 获取 PDF 文件信息 */
  getPDFInfo(pdfPath: string): Promise<{ size: number; name: string }>
}

/**
 * DataSource 工厂类
 * 根据环境自动选择 Mock 或 Electron 实现
 */
class PaperReaderDataSourceFactory {
  private static instance: IPaperReaderDataSource | null = null
  
  static getInstance(): IPaperReaderDataSource {
    if (!this.instance) {
      if (isElectron()) {
        console.log('[PaperReaderDataSource] 使用 Electron 实现')
        this.instance = new PaperReaderElectronDataSource()
      } else {
        console.log('[PaperReaderDataSource] 使用 Mock 实现')
        this.instance = new PaperReaderMockDataSource()
      }
    }
    return this.instance
  }
}

/** 导出单例 DataSource */
export const PaperReaderDataSource = PaperReaderDataSourceFactory.getInstance()
