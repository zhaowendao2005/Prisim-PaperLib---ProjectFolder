/**
 * Preload API 导出
 * 聚合所有暴露给渲染进程的 API
 */
import { windowApi } from './window/window.api'
import { systemApi } from './system/system.api'
import { libraryApi } from './library/library.api'
import { utilsApi } from './utils/utils.api'
import { pdfApi } from './pdf/pdf.api'
import { mineruApi } from './mineru/mineru.api'

export const api = {
  window: windowApi,
  system: systemApi,
  library: libraryApi,
  utils: utilsApi,
  pdf: pdfApi,
  mineru: mineruApi
}
