/**
 * Preload API 导出
 * 聚合所有暴露给渲染进程的 API
 */
import { windowApi } from './window/window.api'
import { systemApi } from './system/system.api'

export const api = {
  window: windowApi,
  system: systemApi
}
