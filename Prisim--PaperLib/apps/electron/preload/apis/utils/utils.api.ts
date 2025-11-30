/**
 * Utils API
 * 工具函数 API
 */
import { webUtils } from 'electron'

export const utilsApi = {
  /**
   * 获取拖放文件的本地路径
   * 现代 Electron 中 File.path 不再可用，需要使用此方法
   */
  getPathForFile: (file: File): string => {
    return webUtils.getPathForFile(file)
  }
}
