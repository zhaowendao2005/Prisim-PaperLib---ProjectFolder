/**
 * Paper Reader Electron DataSource
 * Electron 生产环境使用的数据源
 */
import type { IPaperReaderDataSource, PDFData } from './paper-reader.datasource'

export class PaperReaderElectronDataSource implements IPaperReaderDataSource {
  async loadPDF(pdfPath: string): Promise<PDFData> {
    // 通过 Preload API 调用主进程读取 PDF 文件
    const arrayBuffer = await window.api.pdf.readPDF(pdfPath)
    const info = await this.getPDFInfo(pdfPath)
    
    return {
      arrayBuffer,
      fileSize: info.size,
      fileName: info.name
    }
  }
  
  async getPDFInfo(pdfPath: string): Promise<{ size: number; name: string }> {
    return window.api.pdf.getPDFInfo(pdfPath)
  }
}
