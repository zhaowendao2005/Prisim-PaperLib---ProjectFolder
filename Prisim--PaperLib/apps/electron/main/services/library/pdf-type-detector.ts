/**
 * PDF 类型检测器
 * 通过分析 PDF 内容判断是文本型还是图像型
 */
import { readFileSync } from 'fs'
import type { PdfContentType } from '@client&electron.share/types/library/library.type'

// 动态导入 pdfjs-dist（避免 ESM/CJS 兼容问题）
let pdfjsLib: typeof import('pdfjs-dist') | null = null

async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
  }
  return pdfjsLib
}

/**
 * 检测 PDF 内容类型
 * 抽样检测前 N 页，判断是否包含可提取文本
 * 
 * @param pdfPath PDF 文件路径
 * @param samplePages 抽样页数（默认 3）
 * @returns 检测到的 PDF 类型
 */
export async function detectPdfContentType(
  pdfPath: string,
  samplePages = 3
): Promise<PdfContentType> {
  try {
    const pdfjs = await getPdfjsLib()
    const data = readFileSync(pdfPath)
    
    // 加载 PDF 文档
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(data),
      // 禁用 worker（Node.js 环境）
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    })
    
    const pdf = await loadingTask.promise
    const totalPages = pdf.numPages
    const pagesToCheck = Math.min(samplePages, totalPages)
    
    let pagesWithText = 0
    
    // 抽样检测每页的文本内容
    for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // 检查是否有有效文本（过滤空白字符）
      const hasValidText = textContent.items.some((item) => {
        if ('str' in item) {
          return item.str.trim().length > 0
        }
        return false
      })
      
      if (hasValidText) {
        pagesWithText++
      }
    }
    
    // 清理资源
    await pdf.destroy()
    
    // 判断逻辑：
    // - 所有抽样页都无文本 → image-based
    // - 有任意页有文本 → text-based
    // - structured 类型需要通过 MinerU 解析后手动设置
    const contentType: PdfContentType = pagesWithText === 0 ? 'image-based' : 'text-based'
    
    console.log(`[PdfTypeDetector] ${pdfPath}: ${contentType} (${pagesWithText}/${pagesToCheck} pages with text)`)
    
    return contentType
  } catch (error) {
    console.error('[PdfTypeDetector] 检测失败:', error)
    // 检测失败时默认返回 text-based（保守策略）
    return 'text-based'
  }
}
