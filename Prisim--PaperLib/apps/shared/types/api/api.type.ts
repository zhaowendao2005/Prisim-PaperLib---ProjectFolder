/**
 * Preload API 类型定义
 * 定义暴露给渲染进程的所有 API 接口
 */
import type { WindowApi } from '../window/window.type'

/** 自定义 API 聚合类型 */
export interface Api {
  window: WindowApi
}
