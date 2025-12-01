/**
 * PDF Preload API
 * 暴露给渲染进程的 PDF 相关 API
 */
import { ipcRenderer } from 'electron'

export const pdfApi = {
  /**
   * 读取 PDF 文件
   * @param pdfPath PDF 文件路径
   * @returns PDF 文件的 ArrayBuffer
   */
  readPDF: (pdfPath: string): Promise<ArrayBuffer> => {
    return ipcRenderer.invoke('pdf:read', pdfPath)
  },

  /**
   * 获取 PDF 文件信息
   * @param pdfPath PDF 文件路径
   * @returns 文件大小和文件名
   */
  getPDFInfo: (pdfPath: string): Promise<{ size: number; name: string }> => {
    return ipcRenderer.invoke('pdf:getInfo', pdfPath)
  }
}
