/**
 * PDF IPC 处理器
 * 负责读取 PDF 文件并返回二进制数据
 */
import { ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'

/**
 * 注册 PDF 相关的 IPC 处理器
 */
export function registerPdfIpcHandlers() {
  /**
   * 读取 PDF 文件
   * @param pdfPath PDF 文件路径
   * @returns PDF 文件的 ArrayBuffer
   */
  ipcMain.handle('pdf:read', async (_event, pdfPath: string) => {
    try {
      console.log('[PDF IPC] 读取 PDF 文件:', pdfPath)
      
      // 检查文件是否存在
      const exists = await fs.access(pdfPath).then(() => true).catch(() => false)
      if (!exists) {
        throw new Error(`PDF 文件不存在: ${pdfPath}`)
      }
      
      // 读取文件为 Buffer
      const buffer = await fs.readFile(pdfPath)
      
      // 转换为 ArrayBuffer
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      )
      
      console.log('[PDF IPC] 读取成功,文件大小:', buffer.length, 'bytes')
      return arrayBuffer
    } catch (error) {
      console.error('[PDF IPC] 读取 PDF 失败:', error)
      throw error
    }
  })
  
  /**
   * 获取 PDF 文件信息
   * @param pdfPath PDF 文件路径
   * @returns 文件大小和文件名
   */
  ipcMain.handle('pdf:getInfo', async (_event, pdfPath: string) => {
    try {
      console.log('[PDF IPC] 获取 PDF 信息:', pdfPath)
      
      const stats = await fs.stat(pdfPath)
      const fileName = path.basename(pdfPath)
      
      return {
        size: stats.size,
        name: fileName
      }
    } catch (error) {
      console.error('[PDF IPC] 获取 PDF 信息失败:', error)
      throw error
    }
  })
  
  console.log('[PDF IPC] PDF IPC 处理器已注册')
}
