/**
 * Paper Reader Mock DataSource
 * Web 调试模式使用的模拟数据源
 */
import type { IPaperReaderDataSource, PDFData } from './paper-reader.datasource'

export class PaperReaderMockDataSource implements IPaperReaderDataSource {
  async loadPDF(pdfPath: string): Promise<PDFData> {
    // 模拟网络延迟
    await this.delay(500)
    
    console.log('[Mock] 加载 PDF:', pdfPath)
    
    // 返回模拟的 PDF 数据
    // 实际使用时可以加载真实的示例 PDF 文件
    return {
      arrayBuffer: new ArrayBuffer(0),
      fileSize: 1024 * 1024 * 2, // 模拟 2MB
      fileName: pdfPath.split('/').pop() || 'sample.pdf'
    }
  }
  
  async getPDFInfo(pdfPath: string): Promise<{ size: number; name: string }> {
    await this.delay(100)
    return {
      size: 1024 * 1024 * 2,
      name: pdfPath.split('/').pop() || 'sample.pdf'
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
